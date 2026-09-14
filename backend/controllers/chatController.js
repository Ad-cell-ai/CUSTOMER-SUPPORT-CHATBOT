import { validationResult } from "express-validator";
import Product from "../models/Product.js";
import FAQ from "../models/FAQ.js";

export const chatController = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userMessage = req.body.message.toLowerCase().trim();

    // ---------- PRODUCT SEARCH ----------
    const products = await Product.find();

    const product = products.find((p) =>
      userMessage.includes(p.name.toLowerCase())
    );

    if (product) {
      return res.json({
        success: true,
        response: `The price of ${product.name} is ₹${product.price}. It is currently ${
          product.stock > 0 ? `in stock (${product.stock} available).` : "out of stock."
        }`,
      });
    }

    // ---------- FAQ SEARCH ----------
    const faqs = await FAQ.find();

    const faq = faqs.find((f) => {
      const question = f.question.toLowerCase();

      return (
        userMessage.includes(question) ||
        question.includes(userMessage) ||
        userMessage.includes(f.category.toLowerCase())
      );
    });

    if (faq) {
      return res.json({
        success: true,
        response: faq.answer,
      });
    }

    return res.json({
      success: false,
      response: "Sorry, I couldn't find the requested information.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};