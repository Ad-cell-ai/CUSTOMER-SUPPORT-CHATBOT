import { body, validationResult } from "express-validator";

export const validateChat = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message cannot be empty")
    .isString()
    .withMessage("Message must be a string"),

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
];