import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true
    },

    mobile: {
      type: String,
      required: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    },

    refreshToken: {
      type: String,
      select: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Parent", parentSchema);
