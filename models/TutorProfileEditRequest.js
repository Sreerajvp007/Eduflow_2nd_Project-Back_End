import mongoose from "mongoose";

const tutorProfileEditRequestSchema = new mongoose.Schema({

tutorId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Tutor",
required:true
},

fullName:String,
mobile:String,
teachingExperience:Number,
monthlyFee:Number,
profileImage:String,

status:{
type:String,
enum:["pending","approved","rejected"],
default:"pending"
},

adminNote:String

},{timestamps:true});

export default mongoose.model(
"TutorProfileEditRequest",
tutorProfileEditRequestSchema
);