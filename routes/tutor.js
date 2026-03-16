import express from "express";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import { uploadProfileImage, uploadDocuments } from "../middlewares/upload.js";

import {
  saveProfileInfo,
  saveTeachingInfo,
  saveQualifications,
  saveIdVerification,
  getOnboardingStatus,
  getTeachingMeta,
} from "../controllers/onboarding.js";

import {
  getMyStudents,
  getStudentCourses,
  getTutorReviews,
  getTutorEarnings,
  getTutorPaymentHistory,
  requestPayout,
  getTutorPayouts,
  getNewCoursesForTutor,
  getTutorManagedCourses,
  saveLearningPlan,
  getTutorCourseById,
  markCourseAsCompleted,
  getTutorAvailability,
  addAvailabilitySlot,
  blockAvailabilitySlot,
  unblockAvailabilitySlot,
  getTutorStudents,
  createSession,
  getTutorSessions,
  cancelSession,
  deleteSession,
  updateSessionStatus,
  startSession,
  endSession,
  getTutorProfile,
  submitProfileEditRequest,
  getProfileEditRequestStatus,
  getTutorDashboard,
} from "../controllers/tutor.js";

import {
  saveProfileInfoValidation,
  saveTeachingInfoValidation,
  saveQualificationsValidation,
  saveIdVerificationValidation,
} from "../validations/tutor.js";
import {
  saveTutorBankDetails,
  createRazorpayFundAccount,
  getTutorBankDetails,
} from "../controllers/payment.js";

const router = express.Router();

// onboarding
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
router.put(
  "/onboarding/id-verification",
  protect(["tutor"]),
  uploadDocuments.single("document"),
  validate(saveIdVerificationValidation),
  saveIdVerification,
);
router.get("/onboarding/status", protect(["tutor"]), getOnboardingStatus);
router.get("/onboarding/teaching-meta", getTeachingMeta);

router.get("/new-courses", protect(["tutor"]), getNewCoursesForTutor);
router.get("/courses", protect(["tutor"]), getTutorManagedCourses);
router.get("/courses/:courseId", protect(["tutor"]), getTutorCourseById);
router.put(
  "/courses/:courseId/learning-plan",
  protect(["tutor"]),
  saveLearningPlan,
);
router.patch(
  "/courses/:courseId/complete",
  protect(["tutor"]),
  markCourseAsCompleted,
);
router.get("/my-students", protect(["tutor"]), getMyStudents);
router.get(
  "/students/:studentId/courses",
  protect(["tutor"]),
  getStudentCourses,
);
router.get("/reviews", protect(["tutor"]), getTutorReviews);

router.get("/earnings", protect(["tutor"]), getTutorEarnings);
router.get("/earnings/history", protect(["tutor"]), getTutorPaymentHistory);
router.post("/earnings/request", protect(["tutor"]), requestPayout);
router.get("/payouts", protect(["tutor"]), getTutorPayouts);

// SESSIONS
router.get("/sessions", protect(["tutor"]), getTutorSessions);
router.post("/sessions/create", protect(["tutor"]), createSession);
router.patch("/sessions/:id/cancel", protect(["tutor"]), cancelSession);
router.delete("/sessions/:id", protect(["tutor"]), deleteSession);
router.patch(
  "/session/:sessionId/status",
  protect(["tutor"]),
  updateSessionStatus,
);

router.put("/sessions/start/:id", protect(["tutor"]), startSession);

router.put("/sessions/end/:id", protect(["tutor"]), endSession);

router.get("/availability", protect(["tutor"]), getTutorAvailability);
router.post("/availability/add", protect(["tutor"]), addAvailabilitySlot);
router.post("/availability/block", protect(["tutor"]), blockAvailabilitySlot);
router.post(
  "/availability/unblock",
  protect(["tutor"]),
  unblockAvailabilitySlot,
);
router.get("/students", protect(["tutor"]), getTutorStudents);

router.post("/bank-details", protect(["tutor"]), saveTutorBankDetails);

router.post(
  "/bank-details/verify",
  protect(["tutor"]),
  createRazorpayFundAccount,
);
router.get("/bank-details", protect(["tutor"]), getTutorBankDetails);

router.get("/profile", protect(["tutor"]), getTutorProfile);
router.get(
  "/profile-edit-request",
  protect(["tutor"]),
  getProfileEditRequestStatus,
);
router.post(
  "/profile-edit-request",
  protect(["tutor"]),
  uploadProfileImage.single("profileImage"),
  submitProfileEditRequest,
);
router.get("/dashboard", protect(["tutor"]), getTutorDashboard);
export default router;
