import uuid
from .workflow import WorkflowManager

class ConsoleChat:
    """Console chat uygulaması sınıfı"""
    
    def __init__(self):
        self.workflow = None
        
    def initialize_agent(self):
        """Agent'ı başlat"""
        print("LangGraph Agent başlatılıyor...")
        
        try:
            thread_id = str(uuid.uuid4())[:8]
            self.workflow = WorkflowManager(thread_id=thread_id)
            print(f"✅ Agent başarıyla yüklendi! (Thread ID: {thread_id})")
            return True
        except Exception as e:
            print(f"❌ Agent yüklenirken hata: {e}")
            return False
    
    def show_welcome_message(self):
        """Karşılama mesajını göster"""
        print("LangGraph Chat Agent (Checkpoint Memory Destekli)")
        print("Komutlar:")
        print("  - 'quit', 'exit', 'q': Çıkış")
        print("  - 'clear': Memory'yi temizle")
        print("  - 'history': Konuşma geçmişini göster")
        print("  - 'newthread': Yeni thread başlat")
        print("  - 'thread <id>': Belirli thread'e geç")
        print("-" * 60)
    
    def handle_special_commands(self, user_input: str) -> bool:
        """Özel komutları işle. True döndürürse loop devam etsin"""
        command = user_input.lower().strip()
        
        if command in ["quit", "exit", "q", ""]:
            print("👋 Görüşürüz!")
            return False
            
        elif command == "clear":
            self.workflow.clear_memory()
            print("🧹 Memory temizlendi!")
            return True
            
        elif command == "history":
            self._show_history()
            return True
            
        elif command == "newthread":
            self._create_new_thread()
            return True
            
        elif command.startswith("thread "):
            self._switch_thread(command)
            return True
            
        return None  # Normal mesaj
    
    def _show_history(self):
        """Konuşma geçmişini göster"""
        history = self.workflow.get_conversation_history()
        print("📜 Konuşma Geçmişi:")
        if not history:
            print("  Henüz konuşma yok.")
        else:
            for msg in history:
                role = "👤" if hasattr(msg, 'type') and msg.type == "human" else "🤖"
                content = msg.content[:100] + "..." if len(msg.content) > 100 else msg.content
                print(f"  {role} {content}")
    
    def _create_new_thread(self):
        """Yeni thread oluştur"""
        new_thread_id = str(uuid.uuid4())[:8]
        self.workflow.set_thread_id(new_thread_id)
        print(f"🆕 Yeni thread başlatıldı: {new_thread_id}")
    
    def _switch_thread(self, command: str):
        """Thread değiştir"""
        thread_id = command.split(" ", 1)[1].strip()
        self.workflow.set_thread_id(thread_id)
        print(f"🔄 Thread değiştirildi: {thread_id}")
    
    def process_message(self, user_input: str):
        """Kullanıcı mesajını işle ve yanıt göster"""
        print("🤖 Assistant: ", end="", flush=True)
        
        response_parts = []
        has_response = False
        
        for response_chunk in self.workflow.stream_updates(user_input):
            if response_chunk and response_chunk.strip():
                print(response_chunk, end="", flush=True)
                response_parts.append(response_chunk)
                has_response = True
        
        if not has_response:
            print("Yanıt alınamadı.")
        else:
            print()  # Yeni satır
    
    def run(self):
        """Ana chat döngüsü"""
        if not self.initialize_agent():
            return
        
        self.show_welcome_message()
        
        while True:
            try:
                user_input = input(f"\n🤔 User (Thread: {self.workflow.get_thread_id()}): ")
                
                command_result = self.handle_special_commands(user_input)
                if command_result is False:
                    break
                elif command_result is True:
                    continue
                
                # Normal mesaj işleme
                self.process_message(user_input)
                
            except KeyboardInterrupt:
                print("\n👋 Görüşürüz!")
                break
            except Exception as e:
                print(f"\n❌ Hata: {e}")
                print("Lütfen tekrar deneyin.")

def run_console_chat():
    """Console chat başlatma fonksiyonu"""
    chat = ConsoleChat()
    chat.run()