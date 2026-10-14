import ai from "./client.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export async function generateResponse(userMessage, data) {
  const systemPrompt = `
You are a helpful AI customer support assistant.

Rules:
1. First, use the provided database if the answer exists there.
2. If the database does not contain the answer, answer using your own general knowledge.
3. Never invent product prices, stock, order status, or customer details.
4. Keep answers short, accurate, and friendly.

Available Data:
${JSON.stringify(data, null, 2)}
`;

  for (let i = 0; i < 3; i++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `${systemPrompt}\n\nUser: ${userMessage}`,
      });

      return (
        response.text ||
        "I'm sorry, I couldn't process your request."
      );
    } catch (error) {
      console.error("LLM generation error:", error);

      
      if (
        error.status === 429 ||
        error.message?.includes("quota") ||
        error.message?.includes("rate limit")
      ) {
        return "⚠️ AI token limit reached. Please try again later.";
      }


      // Retry only if Gemini is temporarily overloaded
      if (error.status === 503 && i < 2) {
        console.log(`Retrying... (${i + 1}/3)`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      return "⚠️ AI service is temporarily unavailable. Please try again later.";
    }
  }
}
