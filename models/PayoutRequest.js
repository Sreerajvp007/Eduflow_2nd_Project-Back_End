import mongoose from "mongoose";

const payoutRequestSchema = new mongoose.Schema(
{
  tutorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Tutor",
    required:true
  },

  amount:{
    type:Number,
    required:true
  },

  method:{
    type:String,
    enum:["bank","upi","wallet"],
    required:true
  },

  notes:{
    type:String
  },

  status:{
    type:String,
    enum:["pending","approved","paid","rejected"],
    default:"pending"
  }

},
{timestamps:true}
);

export default mongoose.model("PayoutRequest",payoutRequestSchema);