
import Product from "../models/Product.js";
import FAQ from "../models/FAQ.js";
import { getChatbotReply } from "../services/chatbotServices.js";

const STOP_WORDS = new Set([
  "what", "is", "are", "the", "a", "an", "of", "for", "to",
  "do", "does", "can", "i", "my", "your", "how", "when",
  "where", "tell", "me", "please", "about", "in", "on",
  "and", "or", "with", "you", "we", "our", "it", "this",
  "that", "be", "would", "could", "show", "find", "get",
  "price", "cost", "much", "buy", "purchase", "stock",
  "available", "specifications", "specification", "specs",
  "details", "features", "discount", "discounts", "offer",
  "offers", "deal", "deals", "check", "give"
]);

const GREETINGS = [
  "hi", "hello", "hey", "good morning",
  "good afternoon", "good evening"
];

const SUPPORT_TERMS = [
  "product", "products", "price", "cost", "stock", "available",
  "buy", "purchase", "order", "delivery", "shipping", "return",
  "refund", "exchange", "warranty", "payment", "discount", "brand",
  "category", "cancel", "support", "help", "account", "invoice",
  "damaged", "broken", "laptop", "phone", "mobile", "headphone",
  "charger", "ram", "storage", "memory", "difference", "explain",
  "technology", "tell", "specifications", "specs", "features"
];

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function findBestProduct(message, products) {
  const query = normalize(message);

  if (!query) return null;

  // First check exact product names and SKUs.
  const exactMatch = products.find((product) => {
    const name = normalize(product.name || "");
    const sku = normalize(product.sku || "");

    return name === query || (sku && sku === query);
  });

  if (exactMatch) return exactMatch;

  // Check whether a complete product name or SKU appears in the question.
  const containedMatch = products.find((product) => {
    const name = normalize(product.name || "");
    const sku = normalize(product.sku || "");

    return (
      (name.length >= 4 && ` ${query} `.includes(` ${name} `)) ||
      (sku.length >= 3 && ` ${query} `.includes(` ${sku} `))
    );
  });

  if (containedMatch) return containedMatch;

  const queryWords = query
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word));

  if (!queryWords.length) return null;

  let bestProduct = null;
  let bestScore = 0;

  for (const product of products) {
    const nameWords = normalize(product.name || "")
      .split(/\s+/)
      .filter(Boolean);

    const searchableWords = normalize([
      product.name || "",
      product.sku || "",
      product.brand || "",
      product.category || "",
      ...(Array.isArray(product.keywords) ? product.keywords : [])
    ].join(" ")).split(/\s+/).filter(Boolean);

    const nameMatches = queryWords.filter(
      (word) => nameWords.includes(word)
    ).length;

    const allMatches = queryWords.filter(
      (word) => searchableWords.includes(word)
    ).length;

    const score =
      (nameMatches * 2 + allMatches) / (queryWords.length * 3);

    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestScore >= 0.5 ? bestProduct : null;
}

function getMatchScore(message, text = "") {
  const words = (value) =>
    new Set(
      normalize(value)
        .split(/\s+/)
        .filter(
          (word) => word.length > 2 && !STOP_WORDS.has(word)
        )
    );

  const queryWords = words(message);
  const targetWords = words(text);

  if (!queryWords.size || !targetWords.size) return 0;

  const overlap = [...queryWords].filter(
    (word) => targetWords.has(word)
  ).length;

  return overlap / Math.sqrt(queryWords.size * targetWords.size);
}

function isSupportRelated(message) {
  const words = normalize(message).split(" ");

  return SUPPORT_TERMS.some((term) => words.includes(term));
}

function isProductListingQuestion(message) {
  const normalized = normalize(message);

  return [
    "products",
    "all products",
    "available products",
    "show products",
    "list products",
    "what do you sell"
  ].some((term) => normalized.includes(term));
}

function getProductPriceResponse(product) {
  const discount = Number(product.discount || 0);
  const originalPrice = Number(product.price);
  const price = originalPrice * (1 - discount / 100);

  return `${product.name} (${product.brand || "Generic"}) costs ₹${price.toFixed(2)}. ` +
    (discount > 0 ? `The listed discount is ${discount}%. ` : "") +
    (Number(product.stock) > 0
      ? `It is in stock (${product.stock} available).`
      : "It is currently out of stock.");
}

export const chatController = async (req, res) => {
  try {
    const originalMessage = req.body?.message;

    if (
      typeof originalMessage !== "string" ||
      !originalMessage.trim()
    ) {
      return res.status(400).json({
        success: false,
        response: "Please enter a question so I can help you."
      });
    }

    const userMessage = normalize(originalMessage);

    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .filter(
            (item) =>
              item &&
              (item.sender === "user" || item.sender === "bot") &&
              typeof item.text === "string"
          )
          .slice(-10)
      : [];

    if (GREETINGS.includes(userMessage)) {
      return res.json({
        success: true,
        response:
          "Hello! 👋 Welcome to Customer Support. How can I help you today?"
      });
    }

    const [products, faqs] = await Promise.all([
      Product.find({ isActive: true })
        .select(
          "sku name category brand price discount rating stock description keywords"
        )
        .lean(),
      FAQ.find()
        .select("question answer category keywords")
        .lean()
    ]);

    // Find the product mentioned earlier in the conversation.
    const followUpText = normalize(originalMessage);

    const isSpecsFollowUp =
      /\b(specification|specifications|specs|features|details|description)\b/
        .test(followUpText);

    const isDiscountFollowUp =
      /\b(discount|discounts|offer|offers|deal|deals)\b/
        .test(followUpText);

    const isSimilarFollowUp =
      /\b(similar|related|alternatives|alternative)\b/
        .test(followUpText);

    const isPriceFollowUp =
      /\b(price|cost|much|buy|purchase)\b/.test(followUpText) &&
      /\b(that|this|it|its|product|one)\b/.test(followUpText);

    const isProductFollowUp =
      isSpecsFollowUp ||
      isDiscountFollowUp ||
      isSimilarFollowUp ||
      isPriceFollowUp;

    let contextProduct = null;

    if (isProductFollowUp && history.length) {
      for (const pastMessage of [...history].reverse()) {
        const pastText = normalize(pastMessage.text);

        contextProduct = products.find((product) => {
          const name = normalize(product.name || "");
          const sku = normalize(product.sku || "");

          return (
            (name && pastText.includes(name)) ||
            (sku && pastText.includes(sku))
          );
        });

        if (contextProduct) break;
      }
    }

    if (contextProduct && isPriceFollowUp) {
      return res.json({
        success: true,
        response: getProductPriceResponse(contextProduct)
      });
    }

    if (contextProduct && isSpecsFollowUp) {
      return res.json({
        success: true,
        response:
          `${contextProduct.name} specifications:\n` +
          `Brand: ${contextProduct.brand || "Generic"}\n` +
          `Category: ${contextProduct.category || "Not specified"}\n` +
          `Description: ${contextProduct.description || "No further specifications are listed in the catalog."}\n` +
          `Rating: ${contextProduct.rating ?? "Not rated"}/5\n` +
          `Availability: ${
            contextProduct.stock > 0
              ? `In stock (${contextProduct.stock} available)`
              : "Out of stock"
          }`
      });
    }

    if (contextProduct && isDiscountFollowUp) {
      const discount = Number(contextProduct.discount || 0);
      const originalPrice = Number(contextProduct.price);
      const finalPrice = originalPrice * (1 - discount / 100);

      return res.json({
        success: true,
        response: discount > 0
          ? `${contextProduct.name} currently has a ${discount}% discount. The price after discount is ₹${finalPrice.toFixed(2)} (original price ₹${originalPrice.toFixed(2)}).`
          : `${contextProduct.name} has no discount listed right now. Its current price is ₹${originalPrice.toFixed(2)}.`
      });
    }

    if (contextProduct && isSimilarFollowUp) {
      const similarProducts = products
        .filter(
          (product) =>
            String(product._id) !== String(contextProduct._id) &&
            product.stock > 0 &&
            product.category === contextProduct.category
        )
        .slice(0, 5);

      return res.json({
        success: true,
        response: similarProducts.length
          ? `Products similar to ${contextProduct.name}:\n` +
            similarProducts
              .map((product) => {
                const price =
                  Number(product.price) *
                  (1 - Number(product.discount || 0) / 100);

                return `${product.name} — ₹${price.toFixed(2)}`;
              })
              .join("\n")
          : `I couldn't find other in-stock products in the same category as ${contextProduct.name}.`
      });
    }

    // Search FAQs.
    let bestFaq = null;
    let bestFaqScore = 0;

    for (const faq of faqs) {
      const searchableText = [
        faq.question || "",
        faq.category || "",
        ...(Array.isArray(faq.keywords) ? faq.keywords : [])
      ].join(" ");

      const score = getMatchScore(originalMessage, searchableText);

      if (score > bestFaqScore) {
        bestFaqScore = score;
        bestFaq = faq;
      }
    }

    if (userMessage.includes("frequently asked questions")) {
      if (faqs.length === 0) {
        return res.json({
          success: true,
          response: "No FAQs are available right now."
        });
      }

      const faqList = faqs
        .map(
          (faq, index) => `${index + 1}. ${faq.question}\n${faq.answer}`
        )
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
        (product) => Number(product.stock) > 0
      );

      if (availableProducts.length === 0) {
        return res.json({
          success: true,
          response: "No products are currently in stock."
        });
      }

      const productList = availableProducts
        .slice(0, 10)
        .map((product) => {
          const price =
            Number(product.price) *
            (1 - Number(product.discount || 0) / 100);

          return `${product.name} - ₹${price.toFixed(2)}`;
        })
        .join("\n");

      return res.json({
        success: true,
        response: `Here are some available products:\n${productList}`
      });
    }

    // Match product questions against the database.
    const matchedProduct = findBestProduct(originalMessage, products);

    if (matchedProduct) {
      return res.json({
        success: true,
        response: getProductPriceResponse(matchedProduct)
      });
    }

    const looksLikeProductCode = /\b[A-Z]{2,}\d{3,}\b/i.test(
      originalMessage
    );

    if (looksLikeProductCode) {
      return res.json({
        success: true,
        response:
          "Sorry, I couldn't find a product with that code. Please check the SKU and try again."
      });
    }

    if (!isSupportRelated(originalMessage)) {
      return res.json({
        success: true,
        response:
          "I'm here to help with products and customer-support questions. Please ask me about our products, prices, availability, orders, or support policies."
      });
    }

    // Use AI for general support questions not answered by the database.
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
      response:
        "Sorry, I'm having trouble right now. Please try again shortly."
    });
  }
};
