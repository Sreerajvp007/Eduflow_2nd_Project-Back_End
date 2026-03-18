import mongoose from "mongoose";

const tutorReviewSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    reply: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    repliedAt: {
      type: Date,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


tutorReviewSchema.index(
  { tutorId: 1, parentId: 1 },
  { unique: true }
);

export default mongoose.model("TutorReview", tutorReviewSchema);