import express from "express";
import {

  saveProfileInfo,
  saveTeachingInfo,
  saveQualifications,
  saveIdVerification,
  getOnboardingStatus
 
} from "../controllers/tutor/onboarding.js";

import { protect } from "../middlewares/auth.js";

const router = express.Router();



router.put("/onboarding/profile", protect(["tutor"]), saveProfileInfo);
router.put("/onboarding/teaching", protect(["tutor"]), saveTeachingInfo);
router.put("/onboarding/qualifications", protect(["tutor"]), saveQualifications);
router.put("/onboarding/id-verification", protect(["tutor"]), saveIdVerification);
router.get("/onboarding/status",protect(["tutor"]),getOnboardingStatus)
// router.post("/onboarding/submit", protect(["tutor"]), submitForReview);

export default router;
