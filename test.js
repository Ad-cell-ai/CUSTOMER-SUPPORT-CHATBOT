import { generateResponse } from "./chatbot/llm/generateResponse.js";

const product = {
  name: "iPhone 16",
  price: "₹79,900",
  stock: "In Stock",
  warranty: "1 Year"
};

const reply = await generateResponse(
  "What is the price of iPhone 16?",
  product
);

console.log(reply);