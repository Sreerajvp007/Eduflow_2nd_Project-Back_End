import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
{
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true
  },

  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    required: true
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  reason: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["pending","reviewed","resolved"],
    default: "pending"
  }

},
{ timestamps: true }
);

export default mongoose.model("Report", reportSchema);