import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  level: Number,
  points: Number,
  streak: Number,
});

export default mongoose.model("User", userSchema);
