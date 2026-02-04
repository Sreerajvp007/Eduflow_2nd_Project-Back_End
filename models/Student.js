import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
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

    photo: String,
    status: {
  type: String,
  enum: ["active", "suspended"],
  default: "active"
}

  },
  
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
