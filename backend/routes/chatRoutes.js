import express from "express";
import { body, validationResult } from "express-validator";
import { chatController } from "../controllers/chatController.js";

const router = express.Router();

router.post(
  "/",
  body("message")
    .trim()
    .notEmpty().withMessage("Message cannot be empty")
    .isString().withMessage("Message must be a string"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
  chatController
);

export default router;