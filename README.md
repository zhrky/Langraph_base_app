# LangGraph AI - Intelligent Assistant

![Uploading image.png…]()


## 📋 Proje Hakkında

LangGraph AI, modern web teknolojileri kullanılarak geliştirilmiş akıllı bir asistan uygulamasıdır. Bu uygulama, kullanıcıların doğal dil işleme yetenekleri ile etkileşim kurmasını sağlar ve çeşitli sorulara kapsamlı yanıtlar verebilir.

## ✨ Özellikler

- 🤖 **Akıllı Sohbet Asistanı**: Doğal dil işleme ile gelişmiş konuşma yetenekleri
- 🔍 **Web Araması**: Gerçek zamanlı web araması ve bilgi toplama
- 💾 **Konuşma Hafızası**: Oturum boyunca konuşma geçmişini hatırlama
- 🎨 **Modern UI**: Kullanıcı dostu ve responsive tasarım
- ⚡ **Gerçek Zamanlı**: Stream edilmiş yanıtlar
- 🧠 **LangGraph Framework**: Güçlü workflow yönetimi

## 🛠️ Teknoloji Stack

### Backend
- **Python 3.8+**
- **FastAPI**: Modern web framework
- **LangGraph**: Workflow ve agent yönetimi
- **LangChain**: LLM entegrasyonu
- **InMemorySaver**: Oturum hafızası

### Frontend
- **HTML5/CSS3/JavaScript**
- **Modern ES6+ Syntax**
- **Responsive Design**
- **Real-time WebSocket Communication**

## 📁 Proje Yapısı

```
Langraph_base/
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   ├── agent.py          # LangGraph Agent
│   │   ├── workflow.py       # Workflow Manager
│   │   └── tools.py          # Custom Tools
│   ├── main.py               # FastAPI Application
│   └── requirements.txt      # Python Dependencies
├── frontend/
│   ├──         
│   ├──
│   └──  
└── README.md              
```

## 🚀 Kurulum

### Gereksinimler
- Python 3.12 veya üzeri
- pip package manager
- Modern web tarayıcısı

### Backend Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/zhrky/Langraph_base_app.git
cd Langraph_base_app
```

2. **Virtual environment oluşturun:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

3. **Gerekli paketleri yükleyin:**
```bash
cd backend
pip install -r requirements.txt
```

4. **Environment variables ayarlayın:**
```bash
# .env dosyası oluşturun ve gerekli API anahtarlarını ekleyin
AZURE_OPENAI_ENDPOINT=https://xxxxxx
AZURE_OPENAI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_OPENAI_DEPLOYMENT_NAME=xxxx
AZURE_OPENAI_API_VERSION=xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. **Uygulamayı çalıştırın:**
```bash
python main.py
```

### Frontend Kurulum

1. **Frontend klasörüne gidin:**
```bash
cd ../frontend
```
2. **Frontend'i başlatın**
```bash
cd npm start
```


## 💻 Kullanım

1. **Backend'i başlatın**: `python main.py` komutu ile
2. **Frontend'i başlat**: `npm start` komutu ile
3. **Sohbet etmeye başlayın**: Mesaj kutusuna sorularınızı yazın

### Örnek Sorular
- "Bugünkü hava nasıl?"
- "Python hakkında bilgi ver"
- "LangGraph nedir?"
- "En son teknoloji haberlerini göster"

## 🎨 UI Özellikleri

- **Modern Tasarım**: Gradient arka plan ve modern kart tasarımı
- **Responsive**: Mobil ve masaüstü uyumlu
- **Gerçek Zamanlı**: Mesajlar anında görüntülenir
- **Temizle Butonu**: Konuşma geçmişini temizleme
- **Online Durumu**: Bağlantı durumu göstergesi

## 🔧 Geliştirme

### Yeni Tool Ekleme

```python
# tools.py dosyasına yeni tool ekleyin
@tool
def my_custom_tool(query: str) -> str:
    """Custom tool açıklaması"""
    # Tool logic here
    return result
```

### Workflow Özelleştirme

`workflow.py` dosyasında `WorkflowManager` sınıfını özelleştirebilirsiniz.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

