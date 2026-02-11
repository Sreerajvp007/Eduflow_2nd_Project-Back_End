import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    classLevel: {
  type: String,   // 1–12
  required: true
},

    description: {
      type: String,
      maxlength: 500,
    },

    startDate: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String, 
      required: true,
    },

    monthlyFee: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid",
    },

    courseStatus: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    createdBy: {
      type: String,
      enum: ["parent", "admin"],
      default: "parent",
    },
  },
  { timestamps: true }
);



export default mongoose.model("Course", courseSchema);
