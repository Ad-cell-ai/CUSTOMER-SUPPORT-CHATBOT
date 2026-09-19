import { generateResponse } from "../chatbot/llm/generateResponse.js";
export async function getChatbotReply(message, data) {
  try {
    return await generateResponse(message, data);
  } catch (error) {
    console.error("Chatbot service error:", error.message);
    throw error;
  }
}