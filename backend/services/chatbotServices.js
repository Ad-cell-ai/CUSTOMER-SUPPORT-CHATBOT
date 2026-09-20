import { generateResponse } from "../chatbot/llm/generateResponse.js";

export const getChatbotReply = async (message, data) => {
  try {
    return await generateResponse(message, data);
  }catch (err) {
  console.error("Fetch Error:", err);

  setMessages((prev) => [
    ...prev,
    {
      sender: "bot",
      text: err.message,
    },
  ]);
}
};