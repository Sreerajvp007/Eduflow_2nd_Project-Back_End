import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  userName: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
  },
  refreshToken: String,
});

export default mongoose.model("Admin", adminSchema);
