import express from "express";
import {
  adminLogin,
  adminLogout,
  tutorSignup,
  tutorLogin,
  tutorLogout,
  sendParentOtp,
  verifyParentOtp,
  resendParentOtp,
  sendParentLoginOtp,
  verifyParentLoginOtp,
  resendParentLoginOtp,
  refresh,
  parentLogout,
} from "../controllers/auth/auth.js";

import validate from "../middlewares/validate.js";

import {
  adminLoginValidation,
  tutorSignupValidation,
  tutorLoginValidation,
} from "../validations/auth.js";

const router = express.Router();

router.post("/admin/login", validate(adminLoginValidation), adminLogin);

router.post("/admin/logout", adminLogout);

router.post("/tutor/signup", validate(tutorSignupValidation), tutorSignup);

router.post("/tutor/login", validate(tutorLoginValidation), tutorLogin);
router.post("/tutor/logout", tutorLogout);

router.post("/parent/send-otp", sendParentOtp);

router.post("/parent/verify-otp", verifyParentOtp);

router.post("/parent/resend-otp", resendParentOtp);

router.post("/parent/login/send-otp", sendParentLoginOtp);

router.post("/parent/login/verify-otp", verifyParentLoginOtp);

router.post("/parent/resend-loginOtp", resendParentLoginOtp);

router.post("/parent/logout", parentLogout);

router.get("/refresh", refresh);

export default router;
