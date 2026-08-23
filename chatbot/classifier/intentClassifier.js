export function classifyIntent(message) {
  const text = message.toLowerCase();

  if (text.includes("price")) return "product_price";
  if (text.includes("stock")) return "product_stock";
  if (text.includes("order")) return "order_status";
  if (text.includes("return")) return "return_policy";

  return "unknown";
}