import express from "express";
import { chatController } from "../controllers/chatController.js";
import { validateChat } from "../middleware/validateChat.js";

const router = express.Router();

router.post("/", validateChat, chatController);

export default router;