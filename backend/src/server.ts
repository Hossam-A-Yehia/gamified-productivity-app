import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Note: cookie-parser needs to be installed first
// import cookieParser from "cookie-parser";
import { connectMongoDB } from "./config/database";
import { connectRedis } from "./config/redis";
import authRoutes from "./routes/auth";
import { errorHandler, notFound } from "./middlewares/errorHandler";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middlewares (commented out until packages are installed)
// app.use(helmet());

// Rate limiting (commented out until packages are installed)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: "Too many requests from this IP, please try again later."
//   }
// });
// app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:3000", // React default port
    "http://localhost:5173", // Vite default port
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing middleware (commented out until cookie-parser is installed)
// app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);

// Health check and basic routes
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

// Root route
app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "🎮 Gamified Productivity App API",
    version: "1.0.0",
    documentation: "/api/docs"
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start Server
async function startServer() {
  try {
    // Connect to databases
    await connectMongoDB();
    await connectRedis();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
