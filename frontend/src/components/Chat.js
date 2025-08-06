import React, { useState, useEffect, useRef } from "react";

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      '"Google Sans", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    backgroundColor: "#f8f9fa",
  },
  header: {
    background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
    color: "white",
    padding: "20px 24px",
    borderRadius: "0 0 24px 24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "500",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "12px",
  },
  statusBadge: (connected) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
    backgroundColor:
      connected ? "rgba(255,255,255,0.2)" : "rgba(244,67,54,0.2)",
    color: "white",
  }),
  threadInfo: {
    fontSize: "12px",
    opacity: "0.9",
    padding: "4px 12px",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "12px",
  },
  chatContainer: {
    flex: 1,
    margin: "0 20px",
    backgroundColor: "white",
    borderRadius: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  messagesContainer: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    scrollBehavior: "smooth",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#5f6368",
  },
  emptyStateIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyStateTitle: {
    fontSize: "20px",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#202124",
  },
  emptyStateText: {
    fontSize: "14px",
    lineHeight: "1.4",
  },
  messageContainer: (isUser) => ({
    display: "flex",
    justifyContent: isUser ? "flex-end" : "flex-start",
    marginBottom: "16px",
  }),
  messageBubble: (isUser) => ({
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
    backgroundColor: isUser ? "#4285f4" : "#f1f3f4",
    color: isUser ? "white" : "#202124",
    fontSize: "14px",
    lineHeight: "1.4",
    position: "relative",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  }),
  messageHeader: {
    fontSize: "11px",
    opacity: "0.8",
    marginBottom: "4px",
    fontWeight: "500",
  },
  messageContent: {
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: "#f1f3f4",
    borderRadius: "20px 20px 20px 4px",
    maxWidth: "75%",
    color: "#5f6368",
    fontSize: "14px",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#9aa0a6",
    animation: "pulse 1.4s infinite ease-in-out",
  },
  inputContainer: {
    padding: "20px 24px",
    borderTop: "1px solid #e8eaed",
    backgroundColor: "white",
  },
  inputWrapper: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  textareaContainer: {
    flex: 1,
    position: "relative",
  },
  textarea: {
    width: "100%",
    minHeight: "44px",
    maxHeight: "120px",
    padding: "12px 48px 12px 16px",
    border: "2px solid #e8eaed",
    borderRadius: "24px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    transition: "border-color 0.2s ease",
    backgroundColor: "#f8f9fa",
  },
  textareaFocus: {
    borderColor: "#4285f4",
    backgroundColor: "white",
  },
  sendButton: (disabled) => ({
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: disabled ? "#e8eaed" : "#4285f4",
    color: disabled ? "#9aa0a6" : "white",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "all 0.2s ease",
    boxShadow: disabled ? "none" : "0 2px 4px rgba(66,133,244,0.3)",
  }),
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  actionButton: {
    padding: "8px 16px",
    border: "1px solid #e8eaed",
    borderRadius: "20px",
    backgroundColor: "white",
    color: "#5f6368",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState("default");
  const [connected, setConnected] = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // CSS Animation for typing dots
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0%, 60%, 100% { opacity: 0.4; transform: scale(0.8); }
        30% { opacity: 1; transform: scale(1); }
      }
      .dot:nth-child(2) { animation-delay: 0.2s; }
      .dot:nth-child(3) { animation-delay: 0.4s; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Backend connection test
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch("http://localhost:8000/");
        setConnected(response.ok);
      } catch (error) {
        console.error("Backend bağlantı hatası:", error);
        setConnected(false);
      }
    };
    testConnection();
    const interval = setInterval(testConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const sendMessage = async () => {
    if (!input.trim() || !connected || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          thread_id: threadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("API hatası:", error);
      const errorMessage = {
        role: "assistant",
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setThreadId(`thread_${Date.now()}`);
  };

  const formatContent = (content) => {
    // Format markdown-like content
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(
        /🔗 \[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" style="color: #1a73e8; text-decoration: none;">🔗 $1</a>'
      );
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🤖 LangGraph AI Assistant</h1>
        <div style={styles.statusContainer}>
          <div style={styles.statusBadge(connected)}>
            <span>{connected ? "🟢" : "🔴"}</span>
            {connected ? "Bağlı ve Hazır" : "Bağlantı Bekleniyor"}
          </div>
          <div style={styles.threadInfo}>
            Oturum: {threadId.replace("thread_", "")}
          </div>
        </div>
      </header>

      <div style={styles.chatContainer}>
        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>💬</div>
              <div style={styles.emptyStateTitle}>
                Merhaba! Nasıl yardımcı olabilirim?
              </div>
              <div style={styles.emptyStateText}>
                Sorularınızı sorun, araştırma yapabilirim ve size kapsamlı yanıtlar
                verebilirim.
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} style={styles.messageContainer(msg.role === "user")}>
                <div style={styles.messageBubble(msg.role === "user")}>
                  <div style={styles.messageHeader}>
                    {msg.role === "user" ? "Sen" : "AI Assistant"}
                    {msg.timestamp && ` • ${msg.timestamp}`}
                  </div>
                  <div
                    style={styles.messageContent}
                    dangerouslySetInnerHTML={{
                      __html: formatContent(msg.content),
                    }}
                  />
                </div>
              </div>
            ))
          )}

          {loading && (
            <div style={styles.messageContainer(false)}>
              <div style={styles.typingIndicator}>
                <span>AI düşünüyor</span>
                <div style={styles.typingDots}>
                  <div className="dot" style={styles.dot}></div>
                  <div className="dot" style={styles.dot}></div>
                  <div className="dot" style={styles.dot}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          <div style={styles.actionButtons}>
            <button
              style={styles.actionButton}
              onClick={clearChat}
              disabled={loading}
            >
              🗑️ Temizle
            </button>
          </div>

          <div style={styles.inputWrapper}>
            <div style={styles.textareaContainer}>
              <textarea
                ref={textareaRef}
                style={{
                  ...styles.textarea,
                  ...(textareaFocused ? styles.textareaFocus : {}),
                }}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setTextareaFocused(true)}
                onBlur={() => setTextareaFocused(false)}
                disabled={loading || !connected}
                placeholder={
                  connected
                    ? "Mesajınızı yazın... (Enter ile gönder)"
                    : "Backend bağlantısı bekleniyor..."
                }
              />
            </div>
            <button
              style={styles.sendButton(
                loading || !connected || !input.trim()
              )}
              onClick={sendMessage}
              disabled={loading || !connected || !input.trim()}
            >
              {loading ? "⏳" : "📤"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
