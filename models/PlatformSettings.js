import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema({

  adminCommission: {
    type: Number,
    default: 20
  },

  tutorCommission: {
    type: Number,
    default: 80
  }

},{timestamps:true});

export default mongoose.model(
  "PlatformSettings",
  platformSettingsSchema
);