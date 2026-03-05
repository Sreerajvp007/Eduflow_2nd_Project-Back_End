import express from "express";
import { protect } from "../middlewares/auth.js";
import { uploadProfileImage, uploadDocuments } from "../middlewares/upload.js";
import validate from "../middlewares/validate.js";

import {
  saveProfileInfo,
  saveTeachingInfo,
  saveQualifications,
  saveIdVerification,
  getOnboardingStatus,
  getTeachingMeta,
} from "../controllers/tutor/onboarding.js";

import {
  getNewCoursesForTutor,
  getTutorManagedCourses,
  saveLearningPlan,
  getTutorCourseById,
  markCourseAsCompleted,
} from "../controllers/tutor/course.js";


import { getMyStudents,getStudentCourses,getTutorReviews} from "../controllers/tutor/tutor.js";
import { getSchedule,createSession } from "../controllers/tutor/shedule.js";

import {
  saveProfileInfoValidation,
  saveTeachingInfoValidation,
  saveQualificationsValidation,
  saveIdVerificationValidation,

} from "../validations/tutor.js";


const router = express.Router();

router.put(
  "/onboarding/profile",
  protect(["tutor"]),
  uploadProfileImage.single("profileImage"),
  validate(saveProfileInfoValidation),
  saveProfileInfo,
);

router.put(
  "/onboarding/teaching",
  protect(["tutor"]),
  validate(saveTeachingInfoValidation),
  saveTeachingInfo,
);

router.put(
  "/onboarding/qualifications",
  protect(["tutor"]),
  uploadDocuments.any(),
  validate(saveQualificationsValidation),
  saveQualifications,
);

router.put("/onboarding/id-verification",
  protect(["tutor"]),
  uploadDocuments.single("document"),
  validate(saveIdVerificationValidation),
  saveIdVerification,
);

router.get("/onboarding/status", protect(["tutor"]), getOnboardingStatus);

router.get("/onboarding/teaching-meta", getTeachingMeta);

router.get("/new-courses", protect(["tutor"]), getNewCoursesForTutor);

router.get("/courses", protect(["tutor"]), getTutorManagedCourses);

router.get("/courses/:courseId",protect(["tutor"]),getTutorCourseById,);

router.put("/courses/:courseId/learning-plan",protect(["tutor"]),saveLearningPlan,);

router.patch("/courses/:courseId/complete",protect(["tutor"]),markCourseAsCompleted,);


router.get("/my-students", protect(["tutor"]), getMyStudents);
router.get(
  "/students/:studentId/courses",
  protect(["tutor"]),
  getStudentCourses
);

router.get("/schedule", protect(["tutor"]), getSchedule);

router.post("/session", protect(["tutor"]), createSession);

router.get(
"/reviews",
protect(["tutor"]),
getTutorReviews
);

// 
// router.post("/", addTutorReview);

// // Parent deletes own review
// router.delete("/:reviewId",  deleteTutorReview);

// // Tutor views reviews
// router.get("/tutor",  getTutorReviews);

// // Tutor replies
// router.patch("/:reviewId/reply",  replyToReview);

export default router;
