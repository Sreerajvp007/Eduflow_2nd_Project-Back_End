
import Tutor from "../../models/Tutor.js";
import { calculateProfileCompletion } from "../../utils/calculateCompletion.js";



export const saveProfileInfo = async (req, res) => {
    
    
  const tutor = await Tutor.findById(req.user.id);
  console.log("hii")

  if (tutor.onboardingStatus === "submitted") {
    return res.status(403).json({
      success: false,
      message: "Profile already submitted for review",
    });
  }

  const { bio, profileImage } = req.body;

  tutor.bio = bio;
  tutor.profileImage = profileImage;
  tutor.onboardingStep = Math.max(tutor.onboardingStep, 2);
  tutor.profileCompletion = calculateProfileCompletion(tutor);

  await tutor.save();

  res.json({
    success: true,
    message: "Profile information saved",
    result: tutor,
  });
};



export const saveTeachingInfo = async (req, res) => {
  const tutor = await Tutor.findById(req.user.id);
  console.log(req.user.Id);
  const {
    syllabus,
    classes,
    subjects,
    teachingExperience,
    hourlyRate,
  } = req.body;

  tutor.syllabus = syllabus;
  tutor.classes = classes;
  tutor.subjects = subjects;
  tutor.teachingExperience = teachingExperience;
  tutor.hourlyRate = hourlyRate;

  tutor.onboardingStep = Math.max(tutor.onboardingStep, 3);
  tutor.profileCompletion = calculateProfileCompletion(tutor);

  await tutor.save();

  res.json({
    success: true,
    message: "Teaching information saved",
    result: tutor,
  });
};



export const saveQualifications = async (req, res) => {
  const tutor = await Tutor.findById(req.user.id);

  tutor.qualifications = req.body.qualifications;
  tutor.onboardingStep = Math.max(tutor.onboardingStep, 4);
  tutor.profileCompletion = calculateProfileCompletion(tutor);

  await tutor.save();

  res.json({
    success: true,
    message: "Qualifications saved",
    result: tutor,
  });
};








export const saveIdVerification = async (req, res) => {

  
  const tutor = await Tutor.findById(req.user.id);
  tutor.idVerification = req.body;
 
  if (tutor.profileCompletion < 70) {
    return res.status(400).json({
      success: false,
      message: "Please complete all onboarding steps",
    });
  }

  tutor.onboardingStep = 5;
  tutor.profileCompletion = calculateProfileCompletion(tutor);
  



  

  tutor.onboardingStatus = "submitted";
  tutor.profileCompletion = 100;

  await tutor.save();

  res.json({
    success: true,
    message: "Profile submitted for admin review",
    result: tutor,
  });
};

export const getOnboardingStatus = async (req, res) => {
    console.log(req.user)
    console.log("hii")
  const tutor = await Tutor.findById(req.user.id);
   
  res.json({
    success: true,
    result: tutor,
  });
};
