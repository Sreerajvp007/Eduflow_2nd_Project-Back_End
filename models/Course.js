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
      type: Number,
      required: true,
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

    nextPaymentDate: {
      type: Date,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    courseStatus: {
      type: String,
      enum: ["active", "paused", "completed", "cancelled"],
      default: "active",
    },

    createdBy: {
      type: String,
      enum: ["parent", "admin"],
      default: "parent",
    },

    learningPlan: {
      courseName: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      expectedDuration: {
        type: Number,
      },
      tutorNotes: {
        type: String,
        trim: true,
      },

      strengths: [
        {
          type: String,
          trim: true,
        },
      ],

      improvements: [
        {
          type: String,
          trim: true,
        },
      ],

      isPublished: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true },
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
