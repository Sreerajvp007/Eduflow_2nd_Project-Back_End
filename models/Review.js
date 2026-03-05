import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
{
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

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

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  review: {
    type: String,
    trim: true
  }

},
{ timestamps: true }
);

export default mongoose.model("Review", reviewSchema);