import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chat route is working"
  });
});

router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "POST works"
  });
});

export default router;