import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected");
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}