// models/Class.js
import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const classSchema = new mongoose.Schema(
  {
    classGrade: {
      type: String,
      required: true,
      unique: true, 
    },

    subjectsByBoard: {
      STATE: { type: [subjectSchema], default: [] },
      CBSE: { type: [subjectSchema], default: [] },
      ICSE: { type: [subjectSchema], default: [] },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
