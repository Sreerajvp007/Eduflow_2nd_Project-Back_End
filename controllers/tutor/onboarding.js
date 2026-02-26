import Tutor from "../../models/Tutor.js";
import { calculateProfileCompletion } from "../../utils/calculateCompletion.js";
import Class from "../../models/Class.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

export const saveProfileInfo = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user.id);
    if (!tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Tutor not found" });
    }

    if (tutor.onboardingStatus === "submitted") {
      return res.status(403).json({
        success: false,
        message: "Profile already submitted",
      });
    }

    const { bio } = req.body;
    tutor.bio = bio;

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "tutors/profileImages",
      );
      tutor.profileImage = result.secure_url;
    }

    tutor.onboardingStep = Math.max(tutor.onboardingStep, 2);
    tutor.profileCompletion = calculateProfileCompletion(tutor);

    await tutor.save();

    res.json({ success: true, result: tutor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveTeachingInfo = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    let { syllabus, classes, subjects, teachingExperience, hourlyRate } =
      req.body;

    if (classes && !Array.isArray(classes)) {
      classes = [classes];
    }

    if (subjects && !Array.isArray(subjects)) {
      subjects = [subjects];
    }

    tutor.syllabus = syllabus || tutor.syllabus;
    tutor.classes = classes || [];
    tutor.subjects = subjects || [];

    tutor.teachingExperience = teachingExperience
      ? Number(teachingExperience)
      : 0;

    tutor.hourlyRate = hourlyRate ? Number(hourlyRate) : 0;

    tutor.onboardingStep = Math.max(tutor.onboardingStep, 3);
    tutor.profileCompletion = calculateProfileCompletion(tutor);

    await tutor.save();

    res.json({
      success: true,
      message: "Teaching information saved",
      result: tutor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const saveQualifications = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const files = req.files || [];
    const bodyQualifications = req.body.qualifications || [];

    const qualificationsArray = Array.isArray(bodyQualifications)
      ? bodyQualifications
      : [bodyQualifications];

    const qualifications = qualificationsArray.map((q) => ({
      title: q.title || "",
      institute: q.institute || "",
      year: q.year ? Number(q.year) : null,
      certificateUrl: "",
      verified: false,
    }));

    for (const file of files) {
      const match = file.fieldname.match(
        /qualifications\[(\d+)\]\[certificate\]/,
      );

      if (match) {
        const index = Number(match[1]);

        if (!qualifications[index]) continue;

        const uploaded = await uploadToCloudinary(
          file.buffer,
          "tutor/qualifications",
        );

        qualifications[index].certificateUrl = uploaded?.secure_url || "";
      }
    }

    const tutor = await Tutor.findByIdAndUpdate(
      tutorId,
      {
        qualifications,
        onboardingStep: 4,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      result: tutor,
    });
  } catch (error) {
    console.error("Qualification Save Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save qualifications",
      error: error.message,
    });
  }
};

export const saveIdVerification = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user.id);
    if (!tutor) {
      return res
        .status(404)
        .json({ success: false, message: "Tutor not found" });
    }

    const { idType, idNumber } = req.body;

    let documentUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "tutors/idDocuments",
      );

      documentUrl = result.secure_url;
    }

    tutor.idVerification = {
      idType,
      idNumber,
      documentUrl,
      verified: false,
    };

    tutor.onboardingStep = 5;
    tutor.profileCompletion = 100;
    tutor.onboardingStatus = "submitted";

    await tutor.save();

    res.json({ success: true, result: tutor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOnboardingStatus = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user.id);
    res.json({ success: true, result: tutor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeachingMeta = async (req, res) => {
  try {
    const classes = await Class.find().lean();

    res.json({
      success: true,
      result: classes.map((c) => ({
        classGrade: c.classGrade,
        subjectsByBoard: c.subjectsByBoard,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
