import sys
import os
import uvicorn

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
    else:
        print("🌐 API Backend modu")
        start_api_server()

if __name__ == "__main__":
    main()
