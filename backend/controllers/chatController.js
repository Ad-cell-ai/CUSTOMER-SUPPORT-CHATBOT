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
    console.log("User Message:", userMessage);

    // Fetch products
   const products = await Product.find();

    console.log("User Message:", userMessage);
    console.log("Products Count:", products.length);
    console.log("Products:", products);
    console.log("Collection:", Product.collection.name);

    products.forEach((p) => {
      console.log(
        p.name.toLowerCase(),
        userMessage.includes(p.name.toLowerCase())
      );
    });

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