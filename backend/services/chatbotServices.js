import { generateResponse } from "../chatbot/llm/generateResponse.js";

export const getChatbotReply = async (message, data) => {
  try {
    return await generateResponse(message, data);
  } catch (err) {
    console.error("Chatbot Service Error:", err);
    throw err;
  }
};