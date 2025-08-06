from .workflow import WorkflowManager

class MemoryTester:
    """Memory test sınıfı"""
    
    def __init__(self):
        self.workflow = WorkflowManager(thread_id="1")
    
    def _stream_response(self, user_input: str, config: dict = None):
        """Yanıtları stream et ve göster"""
        if config is None:
            config = self.workflow.config
        
        events = self.workflow.graph.stream(
            {"messages": [{"role": "user", "content": user_input}]},
            config,
            stream_mode="values",
        )
        
        for event in events:
            if "messages" in event and len(event["messages"]) > 0:
                last_message = event["messages"][-1]
                # Sadece AI yanıtlarını göster
                if hasattr(last_message, 'type') and last_message.type != "human":
                    print(last_message.content)
                elif not hasattr(last_message, 'type') and last_message.content != user_input:
                    print(last_message.content)
    
    def test_name_learning(self):
        """Test 1: İsim öğrenme"""
        print("\n=== Test 1: İsim öğrenme ===")
        user_input = "Hi there! My name is Will."
        print(f"User: {user_input}")
        print("Assistant: ", end="", flush=True)
        
        self._stream_response(user_input)
    
    def test_name_remembering_same_thread(self):
        """Test 2: İsim hatırlama (aynı thread)"""
        print("\n=== Test 2: İsim hatırlama (aynı thread) ===")
        user_input = "Remember my name?"
        print(f"User: {user_input}")
        print("Assistant: ", end="", flush=True)
        
        self._stream_response(user_input)
    
    def test_name_remembering_different_thread(self):
        """Test 3: İsim hatırlama (farklı thread)"""
        print("\n=== Test 3: İsim hatırlama (farklı thread) ===")
        user_input = "Remember my name?"
        print(f"User: {user_input}")
        print("Assistant: ", end="", flush=True)
        
        # Farklı thread config'i
        different_thread_config = {"configurable": {"thread_id": "2"}}
        self._stream_response(user_input, different_thread_config)
    
    def run_all_tests(self):
        """Tüm testleri çalıştır"""
        print("Memory Test Başlatılıyor...")
        
        self.test_name_learning()
        self.test_name_remembering_same_thread()
        self.test_name_remembering_different_thread()

def test_memory_example():
    """Memory test başlatma fonksiyonu"""
    tester = MemoryTester()
    tester.run_all_tests()