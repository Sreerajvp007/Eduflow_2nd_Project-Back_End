import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    board: {
      type: String,
      enum: ["STATE", "CBSE", "ICSE"],
      required: true,
    },

    profileImage: String,

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Student", studentSchema);
