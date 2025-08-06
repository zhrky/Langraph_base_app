import React, { useState, useEffect, useRef } from "react";

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState("default");
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connection monitoring
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch("http://localhost:8000/");
        setConnected(response.ok);
      } catch (error) {
        setConnected(false);
      }
    };

    testConnection();
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const sendMessage = async () => {
    if (!input.trim() || !connected || loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setIsTyping(true);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "56px";
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

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Simulate typing delay for better UX
      setTimeout(() => {
        const assistantMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          id: Date.now() + 1,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error("API hatası:", error);
      const errorMessage = {
        role: "assistant",
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        timestamp: new Date(),
        id: Date.now() + 1,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
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

  // Gelişmiş içerik formatlaması
  const formatContent = (content) => {
    // Eğer JSON formatında search results varsa
    try {
      const parsed = JSON.parse(content);
      if (parsed.type === "search_results") {
        return renderSearchResults(parsed);
      }
    } catch (e) {
      // JSON değilse normal formatting uygula
    }

    // Normal text formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="link">$1</a>')
      .replace(/^# (.+)$/gm, '<h1 class="heading-1">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="heading-2">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="heading-3">$1</h3>')
      .replace(/^- (.+)$/gm, '<div class="list-item">• $1</div>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="numbered-item">$1. $2</div>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  };

  // Search results renderer
  const renderSearchResults = (searchData) => {
    return `
      <div class="search-results-container">
        <div class="search-header">
          <span class="search-icon">🔍</span>
          <h3 class="search-title">${searchData.title}</h3>
        </div>
        <div class="search-results">
          ${searchData.results.map(result => `
            <div class="search-result-item">
              <div class="result-header">
                <span class="result-number">${result.number}</span>
                <h4 class="result-title">${result.title}</h4>
              </div>
              <p class="result-content">${result.content}</p>
              ${result.url ? `<a href="${result.url}" target="_blank" class="result-link">🔗 Kaynağı Görüntüle</a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logo}>🤖</div>
            <div>
              <h1 style={styles.title}>LangGraph AI</h1>
              <p style={styles.subtitle}>Intelligent Assistant</p>
            </div>
          </div>

          <div style={styles.statusSection}>
            <div
              style={{
                ...styles.statusBadge,
                ...(connected ? styles.statusOnline : styles.statusOffline),
              }}
            >
              <div style={styles.statusDot}></div>
              <span>{connected ? "Online" : "Offline"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div style={styles.chatContainer} ref={chatContainerRef}>
        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <h2 style={styles.emptyTitle}>Merhaba! Nasıl yardımcı olabilirim?</h2>
              <p style={styles.emptyDescription}>
                Sorularınızı sorun, araştırma yapabilirim ve size kapsamlı yanıtlar
                verebilirim.
              </p>
              <div style={styles.suggestedQuestions}>
                {["Bugünkü hava nasıl?", "Python hakkında bilgi ver", "LangGraph nedir?"].map((suggestion, idx) => (
                  <div 
                    key={idx}
                    style={styles.suggestionChip}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.messagesList}>
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  style={{
                    ...styles.messageWrapper,
                    ...(msg.role === "user"
                      ? styles.userMessageWrapper
                      : styles.assistantMessageWrapper),
                  }}
                >
                  <div style={styles.messageContainer}>
                    <div style={styles.messageAvatar}>
                      {msg.role === "user" ? "👤" : "🤖"}
                    </div>
                    <div style={styles.messageContent}>
                      <div style={styles.messageHeader}>
                        <span style={styles.messageSender}>
                          {msg.role === "user" ? "Sen" : "AI Assistant"}
                        </span>
                        <span style={styles.messageTime}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...(msg.role === "user"
                            ? styles.userMessage
                            : styles.assistantMessage),
                          ...(msg.isError ? styles.errorMessage : {}),
                        }}
                        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ ...styles.messageWrapper, ...styles.assistantMessageWrapper }}>
                  <div style={styles.messageContainer}>
                    <div style={styles.messageAvatar}>🤖</div>
                    <div style={styles.messageContent}>
                      <div style={styles.typingIndicator}>
                        <div style={styles.typingDots}>
                          <div style={styles.typingDot}></div>
                          <div style={styles.typingDot}></div>
                          <div style={styles.typingDot}></div>
                        </div>
                        <span style={styles.typingText}>AI düşünüyor...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputContainer}>
            <div style={styles.inputWrapper}>
              <textarea
                ref={textareaRef}
                style={styles.textarea}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading || !connected}
                placeholder={
                  connected ? "Mesajınızı yazın..." : "Bağlantı bekleniyor..."
                }
                rows={1}
              />
              <button
                style={{
                  ...styles.sendButton,
                  ...(loading || !connected || !input.trim()
                    ? styles.sendButtonDisabled
                    : {}),
                }}
                onClick={sendMessage}
                disabled={loading || !connected || !input.trim()}
              >
                {loading ? "⏳" : "🚀"}
              </button>
            </div>

            <div style={styles.actionButtons}>
              <button
                style={styles.actionButton}
                onClick={clearChat}
                disabled={loading}
              >
                <span>🗑️</span>
                <span>Temizle</span>
              </button>
              <div style={styles.threadInfo}>
                Oturum: {threadId.replace("thread_", "").slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced styles object
const styles = {
  container: {
    width: "100%",
    maxWidth: "1000px",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface-0)",
    borderRadius: "var(--radius-xl)",
    overflow: "hidden",
    boxShadow: "var(--elevation-5)",
    position: "relative",
  },

  header: {
    background:
      "linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%)",
    color: "white",
    padding: "var(--space-lg)",
    position: "relative",
    overflow: "hidden",
  },

  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-md)",
  },

  logo: {
    fontSize: "2.5rem",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-md)",
    backdropFilter: "blur(10px)",
  },

  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    margin: 0,
    background:
      "linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    fontSize: "0.875rem",
    opacity: 0.9,
    margin: "4px 0 0 0",
    fontWeight: "400",
  },

  statusSection: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-md)",
  },

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-sm)",
    padding: "var(--space-sm) var(--space-md)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.875rem",
    fontWeight: "500",
    backdropFilter: "blur(10px)",
  },

  statusOnline: {
    background: "rgba(76, 175, 80, 0.2)",
    border: "1px solid rgba(76, 175, 80, 0.3)",
  },

  statusOffline: {
    background: "rgba(244, 67, 54, 0.2)",
    border: "1px solid rgba(244, 67, 54, 0.3)",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    animation: "pulse 2s infinite",
  },

  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "var(--space-lg)",
  },

  emptyState: {
    textAlign: "center",
    padding: "var(--space-3xl) var(--space-lg)",
    maxWidth: "500px",
    margin: "0 auto",
  },

  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "var(--space-lg)",
    opacity: 0.7,
  },

  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "var(--on-surface)",
    marginBottom: "var(--space-md)",
  },

  emptyDescription: {
    fontSize: "1rem",
    color: "var(--on-surface-variant)",
    lineHeight: 1.6,
    marginBottom: "var(--space-xl)",
  },

  suggestedQuestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-sm)",
    justifyContent: "center",
  },

  suggestionChip: {
    padding: "var(--space-sm) var(--space-md)",
    background: "var(--surface-2)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.875rem",
    color: "var(--on-surface-variant)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    border: "1px solid var(--surface-3)",
  },

  messagesList: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-lg)",
  },

  messageWrapper: {
    animation: "fadeIn 0.5s ease-out",
  },

  userMessageWrapper: {
    alignSelf: "flex-end",
  },

  assistantMessageWrapper: {
    alignSelf: "flex-start",
  },

  messageContainer: {
    display: "flex",
    gap: "var(--space-md)",
    maxWidth: "80%",
  },

  messageAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "var(--radius-lg)",
    background: "var(--surface-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    flexShrink: 0,
  },

  messageContent: {
    flex: 1,
  },

  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--space-xs)",
  },

  messageSender: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--on-surface-variant)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  messageTime: {
    fontSize: "0.75rem",
    color: "var(--on-surface-secondary)",
  },

  messageBubble: {
    padding: "var(--space-md) var(--space-lg)",
    borderRadius: "var(--radius-lg)",
    fontSize: "0.9375rem",
    lineHeight: 1.5,
    wordWrap: "break-word",
    position: "relative",
  },

  userMessage: {
    background:
      "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
    color: "white",
  },

  assistantMessage: {
    background: "var(--surface-1)",
    color: "var(--on-surface)",
    border: "1px solid var(--surface-3)",
  },

  errorMessage: {
    background: "var(--error-bg)",
    color: "var(--error)",
    border: "1px solid rgba(217, 48, 37, 0.2)",
  },

  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-md)",
    padding: "var(--space-md) var(--space-lg)",
    background: "var(--surface-1)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--surface-3)",
  },

  typingDots: {
    display: "flex",
    gap: "var(--space-xs)",
  },

  typingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-500)",
    animation: "bounce 1.4s infinite ease-in-out",
  },

  typingText: {
    fontSize: "0.875rem",
    color: "var(--on-surface-variant)",
  },

  inputSection: {
    borderTop: "1px solid var(--surface-3)",
    background: "var(--surface-0)",
  },

  inputContainer: {
    padding: "var(--space-lg)",
  },

  inputWrapper: {
    display: "flex",
    gap: "var(--space-md)",
    alignItems: "flex-end",
    marginBottom: "var(--space-md)",
  },

  textarea: {
    flex: 1,
    minHeight: "56px",
    maxHeight: "120px",
    padding: "var(--space-md) var(--space-lg)",
    border: "2px solid var(--surface-3)",
    borderRadius: "var(--radius-xl)",
    fontSize: "0.9375rem",
    fontFamily: "var(--font-body)",
    resize: "none",
    outline: "none",
    transition: "all var(--transition-fast)",
    background: "var(--surface-0)",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },

  sendButton: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    background:
      "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
    color: "white",
    fontSize: "1.25rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all var(--transition-medium)",
    boxShadow: "var(--elevation-2)",
  },

  sendButtonDisabled: {
    background: "var(--surface-3)",
    color: "var(--on-surface-secondary)",
    cursor: "not-allowed",
    boxShadow: "none",
  },

  actionButtons: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-sm)",
    padding: "var(--space-sm) var(--space-md)",
    border: "1px solid var(--surface-3)",
    borderRadius: "var(--radius-lg)",
    background: "var(--surface-0)",
    color: "var(--on-surface-variant)",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  },

  threadInfo: {
    fontSize: "0.75rem",
    color: "var(--on-surface-secondary)",
    padding: "var(--space-sm) var(--space-md)",
    background: "var(--surface-2)",
    borderRadius: "var(--radius-lg)",
  },
};

// Enhanced CSS with content formatting
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }
  .typing-dot:nth-child(3) { animation-delay: 0s; }
  
  /* Content Formatting Styles */
  .search-results-container {
    background: var(--surface-1);
    border: 1px solid var(--surface-3);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin: var(--space-sm) 0;
  }
  
  .search-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--surface-3);
  }
  
  .search-icon {
    font-size: 1.25rem;
  }
  
  .search-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--on-surface);
  }
  
  .search-results {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .search-result-item {
    background: var(--surface-0);
    border: 1px solid var(--surface-3);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    transition: all var(--transition-fast);
  }
  
  .search-result-item:hover {
    box-shadow: var(--elevation-2);
    border-color: var(--primary-300);
  }
  
  .result-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
  }
  
  .result-number {
    background: var(--primary-500);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .result-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--on-surface);
    line-height: 1.4;
  }
  
  .result-content {
    margin: 0 0 var(--space-sm) 0;
    font-size: 0.875rem;
    color: var(--on-surface-variant);
    line-height: 1.5;
  }
  
  .result-link {
    color: var(--primary-600);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    transition: color var(--transition-fast);
  }
  
  .result-link:hover {
    color: var(--primary-700);
    text-decoration: underline;
  }
  
  /* Text Formatting */
  .heading-1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--on-surface);
    margin: var(--space-lg) 0 var(--space-md) 0;
    line-height: 1.3;
  }
  
  .heading-2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--on-surface);
    margin: var(--space-lg) 0 var(--space-sm) 0;
    line-height: 1.3;
  }
  
  .heading-3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--on-surface);
    margin: var(--space-md) 0 var(--space-sm) 0;
    line-height: 1.3;
  }
  
  .list-item {
    margin: var(--space-xs) 0;
    padding-left: var(--space-md);
    color: var(--on-surface);
  }
  
  .numbered-item {
    margin: var(--space-xs) 0;
    padding-left: var(--space-md);
    color: var(--on-surface);
    font-weight: 500;
  }
  
  .inline-code {
    background: var(--surface-2);
    color: var(--primary-700);
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    font-family: var(--font-mono);
    font-size: 0.875em;
    border: 1px solid var(--surface-3);
  }
  
  .link {
    color: var(--primary-600);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--transition-fast);
  }
  
  .link:hover {
    color: var(--primary-700);
    text-decoration: underline;
  }
`;
document.head.appendChild(styleSheet);

export default Chat;
