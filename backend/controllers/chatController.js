import { validationResult } from "express-validator";
import Product from "../models/Product.js";
import FAQ from "../models/FAQ.js";

export const chatController = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userMessage = req.body.message.toLowerCase();

    const products = await Product.find();

    const product = products.find(p =>
      userMessage.includes(p.name.toLowerCase())
    );

    if (product) {
      return res.json({
        success: true,
        response: product
      });
    }

    const faqs = await FAQ.find();

    const faq = faqs.find(f =>
      userMessage.includes(f.question.toLowerCase().replace("?", ""))
    );

    if (faq) {
      return res.json({
        success: true,
        response: faq.answer
      });
    }

    return res.json({
      success: false,
      response: "Sorry, I couldn't find the requested information."
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};