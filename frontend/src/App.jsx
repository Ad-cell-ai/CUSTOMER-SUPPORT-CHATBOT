import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_URL = " https://customer-support-chatbot-gf37.onrender.comchat";

function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to latest message
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

    // Keep cursor in input
    inputRef.current?.focus();

    try {
      const res = await fetch(API_URL, {
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
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Unable to connect to server.",
        },
      ]);
    }

    // Keep cursor in input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  return (
    <div className="chat-container">
      <div className="header">
        Customer Support
      </div>

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