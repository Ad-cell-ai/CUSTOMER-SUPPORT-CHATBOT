const response = await fetch("http://localhost:5000/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: "What is the price of iPhone 16?",
  }),
});

const data = await response.json();

console.log(data);