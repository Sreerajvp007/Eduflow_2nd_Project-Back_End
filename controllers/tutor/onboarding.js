
import Tutor from "../../models/Tutor.js";
import { calculateProfileCompletion } from "../../utils/calculateCompletion.js";
import Class from '../../models/Class.js'

// original
// export const saveProfileInfo = async (req, res) => {
    
    
//   const tutor = await Tutor.findById(req.user.id);
//   console.log("hii")

//   if (tutor.onboardingStatus === "submitted") {
//     return res.status(403).json({
//       success: false,
//       message: "Profile already submitted for review",
//     });
//   }

//   const { bio, profileImage } = req.body;

//   tutor.bio = bio;
//   tutor.profileImage = profileImage;
//   tutor.onboardingStep = Math.max(tutor.onboardingStep, 2);
//   tutor.profileCompletion = calculateProfileCompletion(tutor);

//   await tutor.save();

//   res.json({
//     success: true,
//     message: "Profile information saved",
//     result: tutor,
//   });
// };


export const saveProfileInfo = async (req, res) => {
  const tutor = await Tutor.findById(req.user.id);

  if (tutor.onboardingStatus === "submitted") {
    return res.status(403).json({
      success: false,
      message: "Profile already submitted",
    });
  }

  const { bio } = req.body;

  if (req.file) {
    tutor.profileImage = req.file.path; // ✅ Cloudinary URL
  }

  tutor.bio = bio;
  tutor.onboardingStep = Math.max(tutor.onboardingStep, 2);
  tutor.profileCompletion = calculateProfileCompletion(tutor);

  await tutor.save();

  res.json({
    success: true,
    result: tutor,
  });
};





export const saveTeachingInfo = async (req, res) => {
  console.log("req.uasdadadasdasser.id")
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



// export const saveQualifications = async (req, res) => {
//   const tutor = await Tutor.findById(req.user.id);

//   tutor.qualifications = req.body.qualifications;
//   tutor.onboardingStep = Math.max(tutor.onboardingStep, 4);
//   tutor.profileCompletion = calculateProfileCompletion(tutor);

//   await tutor.save();

//   res.json({
//     success: true,
//     message: "Qualifications saved",
//     result: tutor,
//   });
// };








// export const saveIdVerification = async (req, res) => {

  
//   const tutor = await Tutor.findById(req.user.id);
//   tutor.idVerification = req.body;
 
//   if (tutor.profileCompletion < 70) {
//     return res.status(400).json({
//       success: false,
//       message: "Please complete all onboarding steps",
//     });
//   }

//   tutor.onboardingStep = 5;
//   tutor.profileCompletion = calculateProfileCompletion(tutor);
  



  

//   tutor.onboardingStatus = "submitted";
//   tutor.profileCompletion = 100;

//   await tutor.save();

//   res.json({
//     success: true,
//     message: "Profile submitted for admin review",
//     result: tutor,
//   });
// };


export const saveQualifications = async (req, res) => {
  try {
    console.log("🔥 saveQualifications hit");
    console.log("FILES:", req.files);

    const tutor = await Tutor.findById(req.user.id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const qualificationsBody = req.body.qualifications || [];

    // Map index → cloudinary url
    const filesMap = {};

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        console.log("FILE RECEIVED:", file);

        const match = file.fieldname.match(
          /qualifications\[(\d+)\]\[certificate\]/
        );

        if (match) {
          const index = match[1];

          // 🔥 THIS IS THE FIX
          filesMap[index] =
            file.path || file.secure_url || "";
        }
      });
    }

    const qualifications = qualificationsBody.map((q, index) => ({
      title: q.title,
      institute: q.institute,
      year: Number(q.year),
      certificateUrl: filesMap[index] || "",
      verified: false,
    }));

    tutor.qualifications = qualifications;
    tutor.onboardingStep = Math.max(tutor.onboardingStep, 4);
    tutor.profileCompletion = 60;

    await tutor.save();

    return res.json({
      success: true,
      result: tutor,
    });
  } catch (error) {
    console.error("❌ saveQualifications ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const saveIdVerification = async (req, res) => {
  const tutor = await Tutor.findById(req.user.id);

  const { idType, idNumber } = req.body;

  tutor.idVerification = {
    idType,
    idNumber,
    documentUrl: req.file?.path, // ✅ Cloudinary URL
    verified: false,
  };

  tutor.onboardingStep = 5;
  tutor.profileCompletion = 100;
  tutor.onboardingStatus = "submitted";

  await tutor.save();

  res.json({
    success: true,
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



export const getTeachingMeta = async (req, res) => {
  const classes = await Class.find().lean();

  res.json({
    success: true,
    result: classes.map(c => ({
      classGrade: c.classGrade,
      subjectsByBoard: c.subjectsByBoard,
    })),
  });
};
