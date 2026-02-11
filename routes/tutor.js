import express from "express";
import {

  saveProfileInfo,
  saveTeachingInfo,
  saveQualifications,
  saveIdVerification,
  getOnboardingStatus,
  getTeachingMeta
 
} from "../controllers/tutor/onboarding.js";

import { protect } from "../middlewares/auth.js";
import { uploadProfileImage,uploadDocuments } from "../middlewares/upload.js";

const router = express.Router();



// router.put("/onboarding/profile", protect(["tutor"]), saveProfileInfo);
router.put("/onboarding/teaching", protect(["tutor"]), saveTeachingInfo);
// router.put("/onboarding/qualifications", protect(["tutor"]), saveQualifications);
// router.put("/onboarding/id-verification", protect(["tutor"]), saveIdVerification);
router.get("/onboarding/status",protect(["tutor"]),getOnboardingStatus)
// router.post("/onboarding/submit", protect(["tutor"]), submitForReview);
router.get("/onboarding/meta",getTeachingMeta);
router.put(
  "/onboarding/profile",
  protect(["tutor"]),
  uploadProfileImage.single("profileImage"), // ✅
  saveProfileInfo
);
// router.put(
//   "/onboarding/qualifications",
//   protect(["tutor"]),
//   uploadDocuments.any(), // ✅
//   saveQualifications
// );

router.put(
  "/onboarding/id-verification",
  protect(["tutor"]),
  uploadDocuments.single("document"), // ✅
  saveIdVerification
);
router.put(
  "/onboarding/qualifications",
   protect(["tutor"]),
  (req, res, next) => {
    console.log("🟢 BEFORE multer");
    next();
  },
  uploadDocuments.any(),
  (req, res, next) => {
    console.log("🟢 AFTER multer");
    console.log("🟢 multer req.files:", req.files);
    next();
  },
  saveQualifications
);
export default router;
