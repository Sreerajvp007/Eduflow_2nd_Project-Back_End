

import mongoose from "mongoose";

const payoutRequestSchema = new mongoose.Schema({

tutorId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Tutor"
},

amount:Number,

method:String,

notes:String,

status:{
type:String,
enum:["pending","processing","paid","failed"],
default:"pending"
},

razorpayPayoutId:String

},{timestamps:true})

export default mongoose.model("PayoutRequest",payoutRequestSchema);