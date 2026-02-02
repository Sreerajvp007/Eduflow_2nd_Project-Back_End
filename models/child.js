import mongoose from 'mongoose';

const childSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true
    },

    name: String,

    grade: String,

    medium: {
      type: String,
      enum: ["English", "Malayalam"]
    },

    photo: String
  },
  { timestamps: true }
);

export default mongoose.model("Child", childSchema);
