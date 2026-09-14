import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
    console.log("Connected DB:", mongoose.connection.name);
  } catch (error) {
    console.error("Database Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;