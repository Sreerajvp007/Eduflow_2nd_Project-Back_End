


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
      enum: ["active", "blocked", "suspended"],
      default: "active",
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
    default: false
  },
  approvedAt: Date,


    rejectionReason: String,

   
    profileImage: String,
    bio: { type: String, maxlength: 500 },

   
    syllabus: {
      type: String,
      enum: ["STATE", "CBSE", "ICSE"],
    },

    classes: {
  type: [String],
  enum: [
    "Grade 1-4",
    "Grade 5-7",
    "Grade 8-10",
    "Grade 11-12",
  ],
  default: [],
},
 

    subjects: {
  type: [String],
  enum: ["English", "Maths", "Hindi", "Social", "Chemistry"],
  default: [],
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
        verified: { type: Boolean, default: false },
      },
    ],

    
    idVerification: {
      idType: String,
      idNumber: String,
      documentUrl: String,
      verified: { type: Boolean, default: false },
    },

  
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },

   
    lastLogin: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Tutor", tutorSchema);
