import { generateResponse } from "./llm/generateResponse.js";

const reply = await generateResponse(
  "Say hello in one sentence."
);

console.log(reply);