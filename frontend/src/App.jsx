import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Focus input when app loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    if (!question.trim()) return;

    const userQuestion = question.trim();

    // Show user message immediately
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userQuestion,
      },
    ]);

    // Clear input
    setQuestion("");

    // Keep cursor in textbox
    inputRef.current?.focus();

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userQuestion,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.response || "No response received.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Unable to connect to server.",
        },
      ]);
    }

    // Focus input again after response
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="header">
        Customer Support
      </div>

      {/* Chat Messages */}
      <div className="chat-body">
        {messages.length === 0 && (
          <div className="welcome-message">
            👋 Hi! Ask me anything about our products or services.
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender}`}
          >
            {msg.text}
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="input-area">
        <input
          ref={inputRef}
          type="text"
          value={question}
          placeholder="Type your question..."
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default App;