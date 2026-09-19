import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

// Middleware (BEFORE routes and app.listen)
import cors from "cors";

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://Ad-cell-ai.github.io"
  ],
  methods: ["GET", "POST"],
}));

app.use(express.json());

// Database connection
connectDB();

// Routes
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Customer Support Chatbot API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});