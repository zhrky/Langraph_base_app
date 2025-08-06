"""
LangGraph Agent Demo Uygulaması

Kullanım:
    python main.py              # FastAPI backend başlat
    python main.py --test       # Memory testlerini çalıştır
"""

import sys
import os
import uvicorn
from src.memory_test import test_memory_example

def start_api_server():
    """FastAPI sunucusunu başlat"""
    # Backend src klasörünü Python path'ine ekle
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
    
    print("🚀 FastAPI Backend başlatılıyor...")
    print("📍 URL: http://127.0.0.1:8000")
    print("📖 API Docs: http://127.0.0.1:8000/docs")
    print("🔗 Frontend ile bağlantı için: http://localhost:3000")
    print("-" * 50)
    
    uvicorn.run(
        "src.api:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

def main():
    """Ana uygulama giriş noktası"""
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        
        if arg == "--test":
            print("🧪 Memory testleri çalıştırılıyor...")
            test_memory_example()
        else:
            print(f"❌ Bilinmeyen parametre: {arg}")
            print("\nKullanılabilir parametreler:")
            print("  --test    : Memory testlerini çalıştır")
            
    else:
        print("🌐 API Backend modu")
        start_api_server()

if __name__ == "__main__":
    main()
