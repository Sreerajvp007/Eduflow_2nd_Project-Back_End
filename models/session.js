
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
{
  courseId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course",
    required:true
  },

  tutorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Tutor",
    required:true
  },

  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Student"
  },

  title:{
    type:String,
    required:true
  },

  description:String,

  sessionDate:{
    type:Date,
    required:true
  },

  startTime:String,
  endTime:String,

  channelName:{
    type:String,
    required:true,
    unique:true
  },

  status:{
    type:String,
    enum:["scheduled","live","completed","cancelled"],
    default:"scheduled"
  },

  actualStart:Date,
  actualEnd:Date,

  topicsCovered:String,
  tutorNotes:String,
  homework:String,
  feedbackByStudent:String

},
{timestamps:true}
);

export default mongoose.model("Session",sessionSchema);