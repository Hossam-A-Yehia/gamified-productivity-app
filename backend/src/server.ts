import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ test route
app.get("/api/ping", (req: Request, res: Response) => {
  res.json({ message: "pong 🏓" });
});

// ✅ start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
