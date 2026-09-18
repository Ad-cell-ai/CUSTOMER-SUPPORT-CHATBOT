import { useState } from "react";
import axios from "axios";
import "./App.css";

// Replace this with your Render backend URL
const API_URL ="https://customer-support-chatbot-gf37.onrender.com/api/chat";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
  try {
    const res = await axios.post(
      "https://customer-support-chatbot-gf37.onrender.com/api/chat",
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
  } catch (err) {
    console.log(err);
    console.log(err.response);
    console.log(err.message);

    setReply(err.message);
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
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <div className="response">
        <h3>Bot Response</h3>
        <p>{reply}</p>
      </div>
    </div>
  );
}

export default App;