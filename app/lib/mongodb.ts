import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in environment variables");
  }

  if (mongoose.connection.readyState >= 1) {
    return; //dfbdfdfg
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      ssl: true,
      authSource: "admin",
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};