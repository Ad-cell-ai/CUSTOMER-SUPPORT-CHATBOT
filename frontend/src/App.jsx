import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/chat";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) {
      setReply("Please enter a message.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        API_URL,
        {
          message: message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setReply(res.data.response);
      setMessage("");
    } catch (err) {
      console.error("Error:", err);
      setReply(
        err.response?.data?.message ||
        err.message ||
        "Unable to connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="container">
      <h1>🤖 Customer Support Chatbot</h1>

      <input
        type="text"
        placeholder="Ask your question..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />

      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>

      <div className="response">
        <h3>Bot Response</h3>
        <p>{reply}</p>
      </div>
    </div>
  );
}

export default App;