import client from "./client.js";

export async function generateResponse(prompt) {
  try {
    const response = await client.responses.create({
      model: "gpt-5",
      input: prompt,
    });

    return response.output_text;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Sorry, I couldn't process your request.";
  }
}