import express from "express";
import {

  saveProfileInfo,
  saveTeachingInfo,
  saveQualifications,
  saveIdVerification,
  getOnboardingStatus,
  getTeachingMeta
 
} from "../controllers/tutor/onboarding.js";
import {
  getNewCoursesForTutor,
  getTutorManagedCourses,
  saveLearningPlan,
  getTutorCourseById,
  markCourseAsCompleted
} from "../controllers/tutor/course.js";

import { protect } from "../middlewares/auth.js";
import { uploadProfileImage,uploadDocuments } from "../middlewares/upload.js";

const router = express.Router();





router.put(
  "/onboarding/profile",
  protect(["tutor"]),
  uploadProfileImage.single("profileImage"),
  saveProfileInfo
);

router.put(
  "/onboarding/teaching",
  protect(["tutor"]),
  saveTeachingInfo
);

router.put(
  "/onboarding/qualifications",
  protect(["tutor"]),
  uploadDocuments.any(), 
  saveQualifications
);

router.put(
  "/onboarding/id-verification",
  protect(["tutor"]),
  uploadDocuments.single("document"),
  saveIdVerification
);

router.get(
  "/onboarding/status",
  protect(["tutor"]),
  getOnboardingStatus
);

router.get(
  "/onboarding/teaching-meta",
  getTeachingMeta
);



router.get("/new-courses",protect(["tutor"]),getNewCoursesForTutor);

router.get("/courses",protect(["tutor"]),getTutorManagedCourses);

router.put("/courses/:courseId/learning-plan",protect(["tutor"]),saveLearningPlan);
router.get("/courses/:courseId",protect(["tutor"]),getTutorCourseById);

router.patch("/courses/:courseId/complete",protect(["tutor"]),markCourseAsCompleted);

export default router;
