import express from "express";
import { body } from "express-validator";
import { chatController } from "../controllers/chatController.js";

const router = express.Router();

router.post(
  "/",
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required"),

  chatController
);

export default router;