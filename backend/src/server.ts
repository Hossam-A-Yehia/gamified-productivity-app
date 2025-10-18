import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from "express";
import cors from "cors";
import { connectMongoDB } from "./config/database";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import achievementRoutes from "./routes/achievements";
import leaderboardRoutes from "./routes/leaderboard";
import challengeRoutes from "./routes/challenges";
import { errorHandler, notFound } from "./middlewares/errorHandler";


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware to ensure database connection for each request
app.use(async (req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/challenges", challengeRoutes);

app.get("/api/ping", (_, res) => {
  res.json({ 
    success: true,
    message: "pong 🏓",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (_, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

app.use(notFound);
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
