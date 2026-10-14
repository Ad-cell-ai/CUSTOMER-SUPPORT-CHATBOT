import Product from "../models/Product.js";
import FAQ from "../models/FAQ.js";
import { getChatbotReply } from "../services/chatbotServices.js";

const STOP_WORDS = new Set([
  "what", "is", "are", "the", "a", "an", "of", "for", "to", "do",
  "does", "can", "i", "my", "your", "how", "when", "where", "tell",
  "me", "please", "about", "in", "on", "and", "or", "with", "you",
  "we", "our", "it", "this", "that", "be", "does", "would", "could"
]);

// Greeting words
const GREETINGS = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening"
];

function getMatchScore(message, text = "") {
  const words = (value) =>
    new Set(
      value
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    );

  const queryWords = words(message);
  const targetWords = words(text);

  if (!queryWords.size || !targetWords.size) return 0;

  const overlap = [...queryWords].filter((word) => targetWords.has(word)).length;
  return overlap / Math.sqrt(queryWords.size * targetWords.size);
}

export const chatController = async (req, res) => {
  try {
    const userMessage = req.body.message.toLowerCase().trim();

    // Greeting
    if (GREETINGS.includes(userMessage)) {
      return res.json({
        success: true,
        response:
          "Hello! 👋 Welcome to Customer Support. How can I help you today?"
      });
    }

    // Fetch data
    const products = await Product.find();
    const faqs = await FAQ.find();

    // Search FAQ records directly, without requiring a hard-coded intent word.
    let bestFaq = null;
    let bestFaqScore = 0;

    for (const faq of faqs) {
      const searchableText = [
        faq.question || "",
        faq.category || "",
        ...(faq.keywords || [])
      ].join(" ");
      const score = getMatchScore(userMessage, searchableText);

      if (score > bestFaqScore) {
        bestFaqScore = score;
        bestFaq = faq;
      }
    }

    if (bestFaq && bestFaqScore >= 0.45) {
      return res.json({ success: true, response: bestFaq.answer });
    }

    // Search product records when the question identifies a product.
    let bestProduct = null;
    let bestProductScore = 0;

    for (const product of products) {
      const searchableText = [
        product.name || "",
        product.description || "",
        ...(product.keywords || [])
      ].join(" ");
      const score = getMatchScore(userMessage, searchableText);

      if (score > bestProductScore) {
        bestProductScore = score;
        bestProduct = product;
      }
    }

    if (bestProduct && bestProductScore >= 0.45) {
      return res.json({
        success: true,
        response: `The price of ${bestProduct.name} is ₹${bestProduct.price}. ${
          bestProduct.stock > 0
            ? `It is currently in stock (${bestProduct.stock} available).`
            : "It is currently out of stock."
        }`
      });
    }

    // ------------------------
    // GEMINI FALLBACK
    // ------------------------

    const relevantData = {
      products: products.map((p) => ({
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description
      })),
      faqs: faqs.map((f) => ({
        question: f.question,
        answer: f.answer
      }))
    };

    const aiResponse = await getChatbotReply(
      req.body.message,
      relevantData
    );

    return res.json({
      success: true,
      response: aiResponse
    });

  } catch (err) {
    console.error("Chat Controller Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
