import Product from "../models/Product.js";
import FAQ from "../models/FAQ.js";
import { getChatbotReply } from "../services/chatbotServices.js";

// Ignore common words
const STOP_WORDS = [
  "what",
  "is",
  "are",
  "the",
  "a",
  "an",
  "of",
  "for",
  "to",
  "do",
  "does",
  "can",
  "i",
  "my",
  "your",
  "how",
  "when",
  "where",
  "tell",
  "me",
  "please",
  "about"
];

// Greeting words
const GREETINGS = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening"
];

// Match score function
function getScore(message, text = "") {
  const msgWords = message
    .toLowerCase()
    .split(/\W+/)
    .filter(
      (word) =>
        word.length > 2 &&
        !STOP_WORDS.includes(word)
    );

  const target = text.toLowerCase();

  let score = 0;

  for (const word of msgWords) {
    if (target.includes(word)) {
      score += 3;
    }
  }

  return score;
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

    // Intent Detection
    const isProductQuery =
      /price|cost|buy|stock|available|phone|laptop|mobile|product|iphone|samsung|pixel|oneplus/i.test(
        userMessage
      );

    const isFaqQuery =
      /return|refund|privacy|policy|delivery|shipping|cancel|payment|support|account|warranty|exchange|track|order/i.test(
        userMessage
      );

    // ------------------------
    // PRODUCT SEARCH
    // ------------------------

    if (isProductQuery) {
      let bestProduct = null;
      let bestScore = 0;

      for (const product of products) {
        const score =
          getScore(userMessage, product.name || "") +
          getScore(userMessage, product.description || "") +
          getScore(
            userMessage,
            (product.keywords || []).join(" ")
          );

        if (score > bestScore) {
          bestScore = score;
          bestProduct = product;
        }
      }

      if (bestProduct && bestScore >= 3) {
        return res.json({
          success: true,
          response: `The price of ${bestProduct.name} is ₹${bestProduct.price}. ${
            bestProduct.stock > 0
              ? `It is currently in stock (${bestProduct.stock} available).`
              : "It is currently out of stock."
          }`
        });
      }
    }

    // ------------------------
    // FAQ SEARCH
    // ------------------------

    if (isFaqQuery) {
      let bestFaq = null;
      let bestScore = 0;

      for (const faq of faqs) {
        const score =
          getScore(userMessage, faq.question || "") +
          getScore(userMessage, faq.category || "") +
          getScore(
            userMessage,
            (faq.keywords || []).join(" ")
          );

        if (score > bestScore) {
          bestScore = score;
          bestFaq = faq;
        }
      }

      if (bestFaq && bestScore >= 3) {
        return res.json({
          success: true,
          response: bestFaq.answer
        });
      }
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