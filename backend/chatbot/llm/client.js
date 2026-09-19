import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default ai;
console.log(
  "Gemini Key:",
  process.env.GEMINI_API_KEY?.slice(0, 10)
);