import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "",
  },
});

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;