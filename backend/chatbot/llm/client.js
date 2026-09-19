import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
console.log("API Key Loaded:", !!process.env.GEMINI_API_KEY);
export default ai;