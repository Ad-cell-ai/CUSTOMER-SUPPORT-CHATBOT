
import Product from "../models/Product.js";
import FAQ from "../models/FAQ.js";
import { getChatbotReply } from "../services/chatbotServices.js";

const STOP_WORDS = new Set([
  "what", "is", "are", "the", "a", "an", "of", "for", "to",
  "do", "does", "can", "i", "my", "your", "how", "when",
  "where", "tell", "me", "please", "about", "in", "on",
  "and", "or", "with", "you", "we", "our", "it", "this",
  "that", "be", "would", "could", "show", "find", "get"
]);

const GREETINGS = [
  "hi", "hello", "hey", "good morning",
  "good afternoon", "good evening"
];

const SUPPORT_TERMS = [
  "product", "price", "cost", "stock", "available",
  "buy", "purchase", "order", "delivery", "shipping",
  "return", "refund", "exchange", "warranty", "payment",
  "discount", "brand", "category", "cancel", "support",
  "help", "account", "invoice", "damaged", "broken",
  "laptop", "phone", "mobile", "headphone", "charger",
  "ram", "storage", "memory", "difference", "explain", "technology", "tell"
];

function normalize(text = "") {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function getMatchScore(message, text = "") {
  const words = (value) =>
    new Set(
      normalize(value)
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    );

  const queryWords = words(message);
  const targetWords = words(text);

  if (!queryWords.size || !targetWords.size) return 0;

  const overlap = [...queryWords].filter((word) => targetWords.has(word)).length;
  return overlap / Math.sqrt(queryWords.size * targetWords.size);
}

function isSupportRelated(message) {
  const normalized = normalize(message);
  return SUPPORT_TERMS.some((term) =>
    normalized.split(" ").includes(term)
  );
}

function isProductListingQuestion(message) {
  const normalized = normalize(message);

  const listingTerms = [
    "products",
    "all products",
    "available products",
    "show products",
    "list products",
    "what do you sell"
  ];

  return listingTerms.some((term) =>
    normalized.includes(term)
  );
}


export const chatController = async (req, res) => {
  try {
    const originalMessage = req.body?.message;

    if (typeof originalMessage !== "string" || !originalMessage.trim()) {
      return res.status(400).json({
        success: false,
        response: "Please enter a question so I can help you."
      });
    }

    const userMessage = normalize(originalMessage);
    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .filter((item) => item && (item.sender === "user" || item.sender === "bot") && typeof item.text === "string")
          .slice(-10)
      : [];

    if (GREETINGS.includes(userMessage)) {
      return res.json({
        success: true,
        response: "Hello! 👋 Welcome to Customer Support. How can I help you today?"
      });
    }

    const [products, faqs] = await Promise.all([
      Product.find({ isActive: true })
        .select("sku name category brand price discount rating stock description keywords")
        .lean(),
      FAQ.find().select("question answer category keywords").lean()
    ]);

    // Identify the product mentioned in the recent conversation for contextual follow-ups.
    const followUpText = normalize(originalMessage);
    const isSpecsFollowUp = /\b(specification|specifications|specs|features|details|description)\b/.test(followUpText);
    const isDiscountFollowUp = /\b(discount|discounts|offer|offers|deal|deals)\b/.test(followUpText);
    const isSimilarFollowUp = /\b(similar|related|alternatives|alternative)\b/.test(followUpText);
    const isProductFollowUp = isSpecsFollowUp || isDiscountFollowUp || isSimilarFollowUp;
    let contextProduct = null;


      if (isProductFollowUp && history.length) {
        const recentMessages = [...history].reverse();

        for (const pastMessage of recentMessages) {
          const pastNormalized = normalize(pastMessage.text);

          contextProduct = products.find((product) => {
            const productName = normalize(product.name);
            const sku = normalize(product.sku || "");

            // Match the complete product name or SKU in the conversation.
            if (sku && pastNormalized.includes(sku)) return true;
            if (productName && pastNormalized.includes(productName)) return true;

            return false;
          });

          if (contextProduct) break;
        }
  }

    if (contextProduct && isSpecsFollowUp) {
      return res.json({
        success: true,
        response: `${contextProduct.name} specifications:
` +
          `Brand: ${contextProduct.brand || "Generic"}
` +
          `Category: ${contextProduct.category || "Not specified"}
` +
          `Description: ${contextProduct.description || "No further specifications are listed in the catalog."}
` +
          `Rating: ${contextProduct.rating ?? "Not rated"}/5
` +
          `Availability: ${contextProduct.stock > 0 ? `In stock (${contextProduct.stock} available)` : "Out of stock"}`
      });
    }

    if (contextProduct && isDiscountFollowUp) {
      const discount = Number(contextProduct.discount || 0);
      const finalPrice = contextProduct.price * (1 - discount / 100);
      return res.json({
        success: true,
        response: discount > 0
          ? `${contextProduct.name} currently has a ${discount}% discount. The price after discount is ₹${finalPrice.toFixed(2)} (original price ₹${Number(contextProduct.price).toFixed(2)}).`
          : `${contextProduct.name} has no discount listed right now. Its current price is ₹${Number(contextProduct.price).toFixed(2)}.`
      });
    }

    if (contextProduct && isSimilarFollowUp) {
      const similarProducts = products
        .filter((product) => product._id.toString() !== contextProduct._id.toString() && product.stock > 0 && product.category === contextProduct.category)
        .slice(0, 5);
      return res.json({
        success: true,
        response: similarProducts.length
          ? `Products similar to ${contextProduct.name}:\n` + similarProducts.map((product) => `${product.name} — ₹${(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}`).join("\n")
          : `I couldn't find other in-stock products in the same category as ${contextProduct.name}.`
      });
    }

    // 1. Search FAQs first.
    let bestFaq = null;
    let bestFaqScore = 0;

    for (const faq of faqs) {
      const searchableText = [
        faq.question || "",
        faq.category || "",
        ...(faq.keywords || [])
      ].join(" ");

      const score = getMatchScore(originalMessage, searchableText);

      if (score > bestFaqScore) {
        bestFaqScore = score;
        bestFaq = faq;
      }
    }

    if (normalize(originalMessage).includes("frequently asked questions")) {
      if (faqs.length === 0) {
        return res.json({
          success: true,
          response: "No FAQs are available right now."
        });
      }

      const faqList = faqs
        .map((faq, index) => `${index + 1}. ${faq.question}\n${faq.answer}`)
        .join("\n\n");

      return res.json({
        success: true,
        response: `Here are our frequently asked questions:\n\n${faqList}`
      });
    }

    if (bestFaq && bestFaqScore >= 0.45) {
      return res.json({
        success: true,
        response: bestFaq.answer
      });
    }

    if (isProductListingQuestion(originalMessage)) {
      const availableProducts = products.filter(
        (product) => product.stock > 0
      );

      if (availableProducts.length === 0) {
        return res.json({
          success: true,
          response: "No products are currently in stock."
        });
      }

      const productList = availableProducts
        .slice(0, 10)
        .map((product) =>
          `${product.name} - ₹${(
            product.price *
            (1 - (product.discount || 0) / 100)
          ).toFixed(2)}`
        )
        .join("\n");

      return res.json({
        success: true,
        response: `Here are some available products:\n${productList}`
      });
    }

    
    
    const queryWords = normalize(originalMessage)
      .split(/\s+/)
      .filter((word) => word.length > 1 && !STOP_WORDS.has(word));

    const exactProduct = products.find((product) => {
      const productWords = normalize(product.name).split(/\s+/);

      return queryWords.some((word) =>
        productWords.includes(word)
      ) &&
      productWords.some((word) => queryWords.includes(word));
    });

    if (
      exactProduct &&
      /\b(price|cost|much|buy|purchase)\b/i.test(originalMessage)
    ) {
      const price =
        exactProduct.price * (1 - (exactProduct.discount || 0) / 100);

      return res.json({
        success: true,
        response: `${exactProduct.name} costs ₹${price.toFixed(2)}. ${
          exactProduct.stock > 0
            ? `It is in stock (${exactProduct.stock} available).`
            : "It is currently out of stock."
        }`
      });
  }



    // 2. Search products.
    let bestProduct = null;
    let bestProductScore = 0;

    for (const product of products) {
      const searchableText = [
        product.sku || "",
        product.name || "",
        product.category || "",
        product.brand || "",
        product.description || "",
        ...(product.keywords || [])
      ].join(" ");

      const score = getMatchScore(originalMessage, searchableText);

      if (score > bestProductScore) {
        bestProductScore = score;
        bestProduct = product;
      }
    }

    if (bestProduct && bestProductScore >= 0.45) {
      const discountedPrice =
        bestProduct.price * (1 - (bestProduct.discount || 0) / 100);

      return res.json({
        success: true,
        response:
          `${bestProduct.name} (${bestProduct.brand || "Generic"}) costs ₹${discountedPrice.toFixed(2)} ` +
          `and is ${bestProduct.stock > 0
            ? `in stock (${bestProduct.stock} available)`
            : "currently out of stock"}.` +
          `${bestProduct.discount > 0 ? ` The listed discount is ${bestProduct.discount}%.` : ""}`
      });
    }

    // 3. Don't use AI for obviously unrelated questions.
    const looksLikeProductCode = /\b[A-Z]{2,}\d{3,}\b/i.test(originalMessage);

    if (looksLikeProductCode && !exactProduct) {
      return res.json({
        success: true,
        response: "Sorry, I couldn't find a product with that code. Please check the SKU and try again."
      });
    }

    // 4. Don't use AI for unrelated questions.
    if (!isSupportRelated(originalMessage) && !bestProduct && !exactProduct) {
      return res.json({
        success: true,
        response: "I'm here to help with products and customer-support questions. Please ask me about our products, prices, availability, orders, or support policies."
      });
  }

    // 5. Use Gemini only for relevant questions not answered by the database.
    const aiResponse = await getChatbotReply(originalMessage, {
      faqs: [],
      products: []
    });

    return res.json({
      success: true,
      response: aiResponse
    });

  } catch (err) {
    console.error("Chat Controller Error:", err);

    return res.status(500).json({
      success: false,
      response: "Sorry, I'm having trouble right now. Please try again shortly."
    });
  }
};
