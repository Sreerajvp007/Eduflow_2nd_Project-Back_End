// import mongoose from 'mongoose';

// const studentSchema = new mongoose.Schema(
//   {
//     parentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Parent",
//       required: true
//     },

//     name: String,

//     grade: String,

//     medium: {
//       type: String,
//       enum: ["English", "Malayalam"]
//     },

//     photo: String,
//     status: {
//   type: String,
//   enum: ["active", "suspended"],
//   default: "active"
// }

//   },
  
//   { timestamps: true }
// );

// export default mongoose.model("Student", studentSchema);
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    grade: {
      type: String,
      required: true
    },

    board: {
      type: String,
      enum: ["STATE", "CBSE", "ICSE"],
      required: true
    },

    profileImage: String,

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
