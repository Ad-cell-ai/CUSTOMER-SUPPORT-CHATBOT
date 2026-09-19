import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
  "https://customer-support-chatbot-gf37.onrender.com/api/chat";

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
        { message },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setReply(res.data.response);
      setMessage("");
    } catch (err) {
      console.error(err);

      setReply(
        err.response?.data?.response ||
          err.response?.data?.message ||
          err.message ||
          "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="container">
      <h1>
  🤖 <span>Customer Support Chatbot</span>
</h1>

      <input
        type="text"
        placeholder="Ask your question..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
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