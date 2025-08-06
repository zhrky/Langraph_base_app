"""
LangGraph Agent Demo Uygulaması

Kullanım:
    python main.py              # Console chat başlat
    python main.py --test       # Memory testlerini çalıştır
"""

import sys
from src.console_chat import run_console_chat
from src.memory_test import test_memory_example

def main():
    """Ana uygulama giriş noktası"""
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_memory_example()
    else:
        run_console_chat()

if __name__ == "__main__":
    main()
    