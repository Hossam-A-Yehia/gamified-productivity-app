import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Redis from "ioredis";
import dotenv from "dotenv";
import User from "./models/User";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gamified_prod";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// MongoDB Connection
async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected`);
  } catch (err) {
    console.error("MongoDB connection failed:", (err as Error).message);
    process.exit(1);
  }
}
// Redis Connection
const redis = new Redis(REDIS_URL);
redis.on("connect", () => console.log("Redis connected"));
redis.on("error", err => console.error(" Redis error:", err.message));

// Routes
app.get("/api/ping", (_, res) => res.json({ message: "pong 🏓" }));

app.get("/api/users", async (_, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.get("/api/health", (_, res) => {
  res.json({
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    redis: redis.status,
  });
});

// Start Server
async function start() {
  await connectMongo();
  app.listen(PORT, () => console.log(`🚀 Server ready at http://localhost:${PORT}`));
}

start();
