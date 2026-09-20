import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  console.log("✅ POST /api/chat reached");
  console.log(req.body);

  return res.json({
    success: true,
    response: "Backend is receiving your request!",
  });
});

export default router;