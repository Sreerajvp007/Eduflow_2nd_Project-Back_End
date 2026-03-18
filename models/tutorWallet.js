import mongoose from "mongoose";

const tutorWalletSchema = new mongoose.Schema(
{
  tutorId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Tutor",
    required:true,
    unique:true
  },

  totalEarnings:{
    type:Number,
    default:0
  },

  walletBalance:{
    type:Number,
    default:0
  },

  totalWithdrawn:{
    type:Number,
    default:0
  }

},
{timestamps:true}
);

export default mongoose.model("TutorWallet", tutorWalletSchema);