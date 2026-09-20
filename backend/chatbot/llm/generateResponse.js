import ai from "./client.js";

export async function generateResponse(userMessage, data) {
  try {
    const systemPrompt = `
You are a helpful and friendly customer support assistant.

Rules:

1. If the user asks about products, prices, stock, FAQs, shipping, returns, or any company-related information, answer ONLY using the provided data.

2. If the answer is not available in the provided data but the user asks a general question (for example: "Hello", "Who are you?", "What is AI?", "Tell me a joke", "How are you?"), answer normally using your own knowledge.

3. Never make up product prices, stock, or company policies that are not present in the provided data.

4. Keep responses short, polite, and helpful.

Available Data:
${JSON.stringify(data, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${systemPrompt}\n\nUser: ${userMessage}`,
    });

    return (
      response.text ||
      "I'm sorry, I couldn't process your request."
    );

  } catch (error) {
    console.error("LLM generation error:", error);

    return `LLM Error: ${error.message}`;
  }
}