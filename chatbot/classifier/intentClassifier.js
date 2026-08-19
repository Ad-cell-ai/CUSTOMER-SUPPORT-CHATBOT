export function classifyIntent(message) {

    message = message.toLowerCase();

    if(message.includes("price"))
        return "product_price";

    if(message.includes("stock"))
        return "product_availability";

    if(message.includes("order"))
        return "order_status";

    if(message.includes("return"))
        return "return_policy";

    return "unknown";
}