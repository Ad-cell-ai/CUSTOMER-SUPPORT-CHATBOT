import ai from "./client.js";
import { buildPrompt } from "../utils/formatter.js";

export async function generateResponse(userQuestion, data) {
  const prompt = buildPrompt(userQuestion, data);

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text;
}