export function buildPrompt(data, userQuestion){

return `
Data:
${JSON.stringify(data)}

Question:
${userQuestion}

Answer only using the data above.
`;
}