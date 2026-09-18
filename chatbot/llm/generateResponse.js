import ai from "./client.js";

export async function generateResponse(userMessage, data) {
  try {
    const systemPrompt = `You are a helpful customer support assistant. Answer the following question based on the provided data. If the information is not available, say so clearly.

Data:
${JSON.stringify(data, null, 2)}`;

    const model = ai.generativeModel("gemini-1.5-flash");
    
    const response = await model.generateContent({
      systemInstruction: systemPrompt,
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    });

    const textContent = response.response.candidates[0]?.content?.parts[0]?.text;
    
    if (!textContent) {
      return "I couldn't process that request. Please try again.";
    }

    return textContent;
  } catch (error) {
    console.error("LLM generation error:", error.message);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}