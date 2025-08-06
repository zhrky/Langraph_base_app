from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch
from dotenv import load_dotenv
import os

load_dotenv()

class AgentConfig:
    """Agent konfigürasyonu ve ortam değişkenleri yönetimi"""
    
    def __init__(self):
        self._setup_environment()
        
    def _setup_environment(self):
        """Ortam değişkenlerini ayarla"""
        os.environ["AZURE_OPENAI_API_KEY"] = os.getenv("AZURE_OPENAI_API_KEY")
        os.environ["AZURE_OPENAI_ENDPOINT"] = os.getenv("AZURE_OPENAI_ENDPOINT")
        os.environ["AZURE_OPENAI_API_VERSION"] = os.getenv("AZURE_OPENAI_API_VERSION")
        os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
        os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")
    
    def get_llm(self):
        """Azure OpenAI LLM'i başlat"""
        return init_chat_model(
            "azure_openai:gpt-4o",
            azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
            api_version=os.environ["AZURE_OPENAI_API_VERSION"],
        )
    
    def get_tools(self):
        """Mevcut araçları döndür"""
        return [TavilySearch(max_results=2)]

class LangGraphAgent:
    """Ana agent sınıfı - LangGraph checkpoint memory kullanır"""
    
    def __init__(self):
        self.config = AgentConfig()
        self.llm = self.config.get_llm()
        self.tools = self.config.get_tools()
        self.llm_with_tools = self.llm.bind_tools(self.tools)
    
    def get_llm_with_tools(self):
        """Tools ile bind edilmiş LLM'i döndür"""
        return self.llm_with_tools
    
    def get_tools(self):
        """Tools listesini döndür"""
        return self.tools
    
    def get_llm(self):
        """Base LLM'i döndür"""
        return self.llm