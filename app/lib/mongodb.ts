import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

export const connectDB = async () => {

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {

    await mongoose.connect(MONGODB_URI, {
      ssl: true, // Enforce SSL
      authSource: "admin", // Specify auth source if needed
    });

    console.log("MongoDB Connected");

  } catch (error) {

    console.error("MongoDB connection error:", error);

    throw error;

  }

};