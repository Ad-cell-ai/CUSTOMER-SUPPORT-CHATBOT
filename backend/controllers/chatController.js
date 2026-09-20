import Product from "../models/Product.js";
import FAQ from "../models/FAQ.js";
import { getChatbotReply } from "../services/chatbotServices.js";
export const chatController = async (req, res) => {
  console.log("✅ chatController reached");
  console.log(req.body);

  try {
    const userMessage = req.body.message.toLowerCase().trim();

    // Fetch products
    const products = await Product.find();

    // Product search
    const product = products.find((p) =>
      userMessage.includes(p.name.toLowerCase())
    );

    if (product) {
      return res.json({
        success: true,
        response: `The price of ${product.name} is ₹${product.price}. It is currently ${
          product.stock > 0
            ? `in stock (${product.stock} available).`
            : "out of stock."
        }`,
      });
    }

    // FAQ search
    const faqs = await FAQ.find();

    const faq = faqs.find((f) => {
      const question = (f.question || "").toLowerCase();
      const category = (f.category || "").toLowerCase();

      return (
        userMessage.includes(question) ||
        question.includes(userMessage) ||
        (category && userMessage.includes(category))
      );
    });

    if (faq) {
      return res.json({
        success: true,
        response: faq.answer,
      });
    }

    // AI fallback
    const relevantData = {
      products: products.map((p) => ({
        name: p.name,
        price: p.price,
        stock: p.stock,
      })),
      faqs: faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
    };

    const llmResponse = await getChatbotReply(
      req.body.message,
      relevantData
    );

    return res.json({
      success: true,
      response: llmResponse,
    });
  } catch (err) {
    console.error("Chat controller error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};