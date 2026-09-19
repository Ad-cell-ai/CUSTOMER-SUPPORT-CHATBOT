import ai from "./client.js";

export async function generateResponse(userMessage, data) {
  try {
    const systemPrompt = `
You are a helpful customer support assistant.

Answer the user's question using ONLY the provided data.

If the answer is not available in the data, politely say you don't have that information.

Available Data:
${JSON.stringify(data, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nUser: ${userMessage}`,
    });

    return (
      response.text ||
      "I couldn't process your request. Please try again."
    );
  }catch (error) {
  console.error("LLM generation error:", error);

  return `LLM Error: ${error.message}`;
}
}