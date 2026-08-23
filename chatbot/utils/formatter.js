export function buildPrompt(userQuestion, data) {
  return `
You are an AI customer support assistant.

Answer ONLY using the data below.

Data:
${JSON.stringify(data, null, 2)}

Customer Question:
${userQuestion}

If the answer is not available in the data, reply:
"I couldn't find that information in the database."
`;
}