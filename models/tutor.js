import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    mobile: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["tutor"],
      default: "tutor",
    },

    refreshToken: { type: String, select: false },

    status: {
      type: String,
      enum: ["pending", "active", "blocked", "suspended"],
      default: "pending",
    },

    onboardingStatus: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
    },

    onboardingStep: {
      type: Number,
      default: 1,
    },

    profileCompletion: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: Date,

    rejectionReason: String,

    profileImage: String,
    bio: { type: String, maxlength: 500 },

    syllabus: {
      type: String,
      enum: ["STATE", "CBSE", "ICSE"],
    },

    subjects: {
      type: [String],
      default: [],
    },
    classes: {
      type: [Number],
      default: [],
    },
    // availability: {
    //   type: [String],
    //   default: [],
    // },
    availability: {
      type: [String],
      default: ["6:00 PM", "7:00 PM", "8:00 PM"],
    },

    teachingExperience: {
      type: Number,
      min: 0,
    },

    hourlyRate: {
      type: Number,
      min: 0,
    },

    qualifications: [
      {
        title: String,
        institute: String,
        year: Number,
        certificateUrl: String,
        // verified: { type: Boolean, default: false },
      },
    ],

    idVerification: {
      idType: String,
      idNumber: String,
      documentUrl: String,
      // verified: { type: Boolean, default: false },
    },

    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },

    lastLogin: Date,
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Tutor", tutorSchema);
