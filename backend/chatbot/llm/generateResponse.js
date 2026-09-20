import ai from "./client.js";

export async function generateResponse(userMessage, data) {
  const systemPrompt = `
You are a helpful customer support assistant.

Answer the user's question using ONLY the provided data.

If the answer is not available in the data, politely say you don't have that information.

Available Data:
${JSON.stringify(data, null, 2)}
`;

  for (let i = 0; i < 3; i++) {
    try {
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

      // Retry only if Gemini is temporarily overloaded
      if (error.status === 503 && i < 2) {
        console.log(`Retrying... (${i + 1}/3)`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      return `⚠️ AI service is temporarily unavailable. Please try again in a few moments.\n\nError: ${error.message}`;
    }
  }
}