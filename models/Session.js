import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    sessionDate: {
      type: Date,
      required: true,
    },

    startTime: String,
    endTime: String,

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },

    topicsCovered: String,
    tutorNotes: String,
    homework: String,
    feedbackByStudent: String,
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
