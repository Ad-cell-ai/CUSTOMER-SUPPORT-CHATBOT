import { generateResponse } from "../../chatbot/llm/generateResponse.js";

export async function getChatbotReply(message, data) {
  try {
    const reply = await generateResponse(message, data);
    return reply;
  } catch (error) {
    console.error("Chatbot service error:", error.message);
    throw error;
  }
}