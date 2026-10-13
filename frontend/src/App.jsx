import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = "https://customer-support-chatbot-gf37.onrender.com/api/chat";

const suggestions = [
  { icon: "▦", label: "Browse available products", prompt: "Show me available products" },
  { icon: "₹", label: "Ask about a price", prompt: "How can I check the price of a product?" },
  { icon: "✓", label: "Check stock availability", prompt: "How can I check if a product is in stock?" },
  { icon: "?", label: "Common questions", prompt: "What are the most common customer support questions?" },
];

function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendMessage(text = question) {
    const userQuestion = text.trim();
    if (!userQuestion || isLoading) return;

    setErrorMessage("");
    setQuestion("");
    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuestion }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.response || "I couldn't find a response. Please try asking another way." },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setErrorMessage("I couldn't reach the support service. Check your connection and try again.");
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry — I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function startNewChat() {
    if (isLoading) return;
    setMessages([]);
    setQuestion("");
    setErrorMessage("");
    inputRef.current?.focus();
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-mark-face">••</span>
            <span className="brand-mark-dot" />
          </div>
          <div>
            <div className="brand-name">Support<span>Bot</span></div>
            <div className="brand-caption">Customer support, made simple</div>
          </div>
        </div>

        <div className="sidebar-section-label">YOUR ASSISTANT</div>
        <button className="sidebar-link active" type="button" onClick={startNewChat}>
          <span className="nav-icon">✳</span>
          <span>Chat with us</span>
          <span className="nav-active-dot" />
        </button>

        <div className="sidebar-divider" />
        <div className="sidebar-section-label">QUICK TOPICS</div>
        <div className="topic-list">
          <button type="button" className="topic-link" onClick={() => sendMessage("Show me available products")}><span>▦</span> Product information</button>
          <button type="button" className="topic-link" onClick={() => sendMessage("How do I check a product's price?")}><span>₹</span> Pricing questions</button>
          <button type="button" className="topic-link" onClick={() => sendMessage("How can I check stock availability?")}><span>✓</span> Stock availability</button>
          <button type="button" className="topic-link" onClick={() => sendMessage("Tell me about frequently asked questions")}><span>?</span> FAQs & help</button>
        </div>

        <div className="sidebar-bottom-card">
          <div className="support-orb"><span>✦</span></div>
          <div className="support-card-title">Here to help, anytime.</div>
          <p>Ask a question in your own words and we’ll do our best to help.</p>
          <div className="online-line"><span /> Support assistant online</div>
        </div>

        <div className="sidebar-footer">Simple answers. Better support.</div>
      </aside>

      <section className="chat-workspace">
        <header className="topbar">
          <div className="topbar-status">
            <div className="status-indicator"><span /></div>
            <div>
              <div className="topbar-title">Customer Support</div>
              <div className="topbar-subtitle">{isLoading ? "Preparing a response…" : "We’re here to help"}</div>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="secure-note"><span className="sparkle">✧</span> AI-powered assistance</div>
            <button className="new-chat-button" type="button" onClick={startNewChat} disabled={isLoading}>
              <span>＋</span> New chat
            </button>
          </div>
        </header>

        <div className={`conversation ${messages.length === 0 ? "conversation-empty" : ""}`}>
          {messages.length === 0 ? (
            <div className="welcome-content">
              <div className="welcome-eyebrow"><span className="eyebrow-dot" /> YOUR SUPPORT ASSISTANT</div>
              <div className="welcome-avatar"><span className="bot-antenna" /><span className="bot-eyes">••</span><span className="bot-smile" /></div>
              <h1>Hi there. How can we <span>help you today?</span></h1>
              <p className="welcome-description">Get quick answers about products, prices, availability, and more.</p>

              <div className="suggestion-grid">
                {suggestions.map((item) => (
                  <button className="suggestion-card" key={item.label} type="button" onClick={() => sendMessage(item.prompt)} disabled={isLoading}>
                    <span className="suggestion-icon">{item.icon}</span>
                    <span className="suggestion-label">{item.label}</span>
                    <span className="suggestion-arrow">↗</span>
                  </button>
                ))}
              </div>
              <div className="welcome-footnote"><span>✦</span> Ask anything to get started — no account needed.</div>
            </div>
          ) : (
            <div className="message-list">
              <div className="conversation-date"><span /> Conversation started <span /></div>
              {messages.map((msg, index) => (
                <div className={`message-row ${msg.sender}`} key={`${msg.sender}-${index}`}>
                  {msg.sender === "bot" && <div className="message-avatar" aria-hidden="true"><span>✦</span></div>}
                  <div className="message-content">
                    <div className="message-sender">{msg.sender === "user" ? "You" : "SupportBot"}</div>
                    <div className="message-bubble">{msg.text}</div>
                  </div>
                  {msg.sender === "user" && <div className="user-avatar" aria-hidden="true">Y</div>}
                </div>
              ))}
              {isLoading && (
                <div className="message-row bot">
                  <div className="message-avatar" aria-hidden="true"><span>✦</span></div>
                  <div className="message-content">
                    <div className="message-sender">SupportBot <span className="typing-label">is thinking</span></div>
                    <div className="message-bubble typing-bubble" aria-label="Assistant is typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <footer className="composer-wrap">
          {errorMessage && <div className="error-note" role="status">{errorMessage}</div>}
          <form className="composer" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={question}
              placeholder="Type your question here…"
              onChange={(event) => setQuestion(event.target.value)}
              aria-label="Type your question"
              disabled={isLoading}
            />
            <span className="composer-hint">↵</span>
            <button className="send-button" type="submit" aria-label="Send message" disabled={!question.trim() || isLoading}>
              {isLoading ? <span className="send-spinner" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h14M12 5.5l6.5 6.5-6.5 6.5" /></svg>}
            </button>
          </form>
          <div className="composer-caption">SupportBot can make mistakes. Please verify important information.</div>
        </footer>
      </section>
    </main>
  );
}

export default App;
