import Product from "../models/Product.js";
import FAQ from "../models/FAQ.js";
import { getChatbotReply } from "../services/chatbotServices.js";

// Match score function
function getScore(message, text = "") {
  const msgWords = message
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const textWords = text.toLowerCase().split(/\s+/);

  let score = 0;

  for (const word of msgWords) {
    if (textWords.includes(word)) {
      score += 2;
    } else if (text.toLowerCase().includes(word)) {
      score += 1;
    }
  }

  return score;
}

export const chatController = async (req, res) => {
  try {
    const userMessage = req.body.message.toLowerCase().trim();

    // Fetch data
    const products = await Product.find();
    const faqs = await FAQ.find();

    // ==========================
    // Product Search
    // ==========================

    let bestProduct = null;
    let bestProductScore = 0;

    for (const product of products) {
      const score =
        getScore(userMessage, product.name || "") +
        getScore(userMessage, product.description || "") +
        getScore(userMessage, (product.keywords || []).join(" "));

      if (score > bestProductScore) {
        bestProductScore = score;
        bestProduct = product;
      }
    }

    if (bestProductScore >= 4) {
      return res.json({
        success: true,
        response: `The price of ${bestProduct.name} is ₹${bestProduct.price}. ${
          bestProduct.stock > 0
            ? `It is currently in stock (${bestProduct.stock} available).`
            : "It is currently out of stock."
        }`,
      });
    }

    // ==========================
    // FAQ Search
    // ==========================

    let bestFaq = null;
    let bestFaqScore = 0;

    for (const faq of faqs) {
      const score =
        getScore(userMessage, faq.question || "") +
        getScore(userMessage, faq.category || "") +
        getScore(userMessage, (faq.keywords || []).join(" "));

      if (score > bestFaqScore) {
        bestFaqScore = score;
        bestFaq = faq;
      }
    }

    if (bestFaqScore >= 4) {
      return res.json({
        success: true,
        response: bestFaq.answer,
      });
    }

    // ==========================
    // AI Fallback
    // ==========================

    const relevantData = {
      products: products.map((p) => ({
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description,
      })),
      faqs: faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
    };

    const aiResponse = await getChatbotReply(
      req.body.message,
      relevantData
    );

    return res.json({
      success: true,
      response: aiResponse,
    });

  } catch (err) {
    console.error("Chat Controller Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};