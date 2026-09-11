import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js"; // adjust if your filename is different

dotenv.config();

console.log(process.env.MONGODB_URI);
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); 

connectDB();

const app = express();

app.use(express.json());

// Routes
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Customer Support Chatbot API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});