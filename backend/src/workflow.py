from typing import Annotated
from typing_extensions import TypedDict
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from .agent import LangGraphAgent
import json

class State(TypedDict):
    """Graph state tanımı"""
    messages: Annotated[list, add_messages]

class WorkflowManager:
    """Workflow yönetimi için ana sınıf - LangGraph Memory destekli"""
    
    def __init__(self, thread_id="default"):
        self.agent = LangGraphAgent()
        self.memory = InMemorySaver()
        self.graph = self._build_graph()
        self.thread_id = thread_id
        self.config = {"configurable": {"thread_id": self.thread_id}}
    
    def _build_graph(self):
        """Graph'i oluştur ve yapılandır - Simplified version"""
        graph_builder = StateGraph(State)
        
        # Tools ve LLM hazırla
        tools = self.agent.get_tools()
        llm_with_tools = self.agent.get_llm_with_tools()
        
        # Chatbot node
        def chatbot(state: State):
            return {"messages": [llm_with_tools.invoke(state["messages"])]}
        
        # Nodes ekle
        graph_builder.add_node("chatbot", chatbot)
        
        # Built-in ToolNode kullan
        tool_node = ToolNode(tools=tools)
        graph_builder.add_node("tools", tool_node)
        
        # Built-in tools_condition kullan
        graph_builder.add_conditional_edges(
            "chatbot",
            tools_condition,
        )
        graph_builder.add_edge("tools", "chatbot")
        graph_builder.set_entry_point("chatbot")
        
        # Memory ile compile et
        return graph_builder.compile(checkpointer=self.memory)
    
    def stream_updates(self, user_input: str):
        """Graph güncellemelerini stream et - Memory destekli"""
        events = self.graph.stream(
            {"messages": [{"role": "user", "content": user_input}]},
            self.config,
            stream_mode="values",
        )
        
        for event in events:
            if "messages" in event and len(event["messages"]) > 0:
                last_message = event["messages"][-1]
                
                # AI mesajlarını yield et
                if hasattr(last_message, 'content') and hasattr(last_message, 'type'):
                    if last_message.type == "ai":
                        yield last_message.content
                elif hasattr(last_message, 'content'):
                    # Tool mesajlarını da işle
                    if hasattr(last_message, 'name'):  # Tool message
                        try:
                            # Tool response'unu parse et
                            tool_data = json.loads(last_message.content)
                            if isinstance(tool_data, list) and len(tool_data) > 0:
                                # Tavily search results
                                formatted_results = "🔍 **Arama Sonuçları:**\n\n"
                                for i, result in enumerate(tool_data[:3], 1):
                                    title = result.get('title', 'Başlık yok')
                                    content = result.get('content', 'İçerik yok')[:200] + "..."
                                    url = result.get('url', '')
                                    formatted_results += f"**{i}. {title}**\n{content}\n🔗 [Kaynak]({url})\n\n"
                                yield formatted_results
                        except (json.JSONDecodeError, AttributeError):
                            pass
                    elif last_message.content != user_input:
                        yield last_message.content
    
    def set_thread_id(self, thread_id: str):
        """Thread ID'yi değiştir (farklı konuşma oturumları için)"""
        self.thread_id = thread_id
        self.config = {"configurable": {"thread_id": self.thread_id}}
    
    def get_thread_id(self):
        """Mevcut thread ID'yi döndür"""
        return self.thread_id
    
    def clear_memory(self):
        """Memory'yi temizle (yeni InMemorySaver oluştur)"""
        self.memory = InMemorySaver()
        self.graph = self._build_graph()
    
    def get_conversation_history(self):
        """Mevcut thread'deki konuşma geçmişini al"""
        try:
            # Graph'ın mevcut durumunu al
            state = self.graph.get_state(self.config)
            return state.values.get("messages", []) if state else []
        except Exception:
            return []
    
    def get_graph_visualization(self):
        """Graph görselleştirmesi (opsiyonel)"""
        try:
            from IPython.display import Image
            return Image(self.graph.get_graph().draw_mermaid_png())
        except Exception as e:
            return f"Görselleştirme hatası: {e}"
