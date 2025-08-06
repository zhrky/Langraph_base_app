import React, { useState, useEffect } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState("default");
  const [connected, setConnected] = useState(false);

  // Backend bağlantısını test et
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch("http://localhost:8000/");
        if (response.ok) {
          setConnected(true);
        }
      } catch (error) {
        console.error("Backend bağlantı hatası:", error);
        setConnected(false);
      }
    };
    testConnection();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !connected) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          thread_id: threadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = { role: "assistant", content: data.response };

      setMessages((prev) => [...prev, assistantMessage]);
      setInput("");
    } catch (error) {
      console.error("API hatası:", error);
      const errorMessage = {
        role: "assistant",
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  const clearChat = () => {
    setMessages([]);
    // Yeni thread ID oluştur
    setThreadId(`thread_${Date.now()}`);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <h2>LangGraph Chatbot</h2>
        <div
          style={{
            color: connected ? "green" : "red",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          {connected ? "✅ Backend bağlı" : "❌ Backend bağlantısı yok"}
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          Thread ID: {threadId}
        </div>
      </div>

      <div
        style={{
          minHeight: 300,
          maxHeight: 400,
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "15px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              color: "#666",
              textAlign: "center",
              marginTop: "50px",
            }}
          >
            Merhaba! Benimle sohbet etmeye başlayabilirsin.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                maxWidth: "80%",
                padding: "10px 15px",
                borderRadius: "18px",
                backgroundColor:
                  msg.role === "user" ? "#007bff" : "#e9ecef",
                color: msg.role === "user" ? "white" : "black",
                wordWrap: "break-word",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.8,
                  marginBottom: "5px",
                }}
              >
                {msg.role === "user" ? "Sen" : "Bot"}
              </div>
              <div>{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ textAlign: "left", margin: "10px 0" }}>
            <div
              style={{
                display: "inline-block",
                padding: "10px 15px",
                borderRadius: "18px",
                backgroundColor: "#e9ecef",
                color: "#666",
              }}
            >
              Yanıt yazıyor...
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
          }}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || !connected}
          placeholder={
            connected
              ? "Mesajınızı yazın..."
              : "Backend bağlantısı bekleniyor..."
          }
        />
        <button
          style={{
            padding: "12px 20px",
            borderRadius: "20px",
            border: "none",
            backgroundColor:
              loading || !connected ? "#ccc" : "#007bff",
            color: "white",
            cursor:
              loading || !connected ? "not-allowed" : "pointer",
          }}
          onClick={sendMessage}
          disabled={loading || !connected}
        >
          Gönder
        </button>
        <button
          style={{
            padding: "12px 15px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            cursor: "pointer",
          }}
          onClick={clearChat}
          disabled={loading}
        >
          Temizle
        </button>
      </div>
    </div>
  );
}
