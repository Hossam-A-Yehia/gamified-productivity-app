import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Redis from "ioredis";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/gamified_prod";
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

let redisClient: Redis | null = null;

async function connectMongoWithRetry(retries = 10, delayMs = 2000): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err: any) {
    console.error("MongoDB connection failed. Retries left:", retries, err);
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
      return connectMongoWithRetry(retries - 1, delayMs);
    }
    throw err;
  }
}

async function startServer() {
  await connectMongoWithRetry();

  redisClient = new Redis(REDIS_URL);
  redisClient.on("connect", () => console.log("✅ Connected to Redis"));
  redisClient.on("error", (e: Error) => console.error("Redis error", e));

  app.get("/api/ping", (req, res) => res.json({ message: "pong 🏓" }));
  app.get("/api/health", (req, res) => {
    const mongoState = mongoose.connection.readyState; 
    const redisStatus = redisClient?.status || "unknown";
    res.json({ mongoState, redisStatus });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err: Error) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
