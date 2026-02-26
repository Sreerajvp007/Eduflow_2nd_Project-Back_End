import express from "express";
const router = express.Router();
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
//   refreshAccessToken,
  refresh,
  parentLogout,
} from "../controllers/auth/auth.js";
import validate from "../middlewares/validate.js";
import {
  tutorSignupValidation,
  sendOtpValidation,
  verifyOtpValidation,
  resendOtpValidation,
  sendLoginOtpValidation,
  verifyLoginOtpValidation,
  adminLoginValidation,
} from "../validations/tutorValidations.js";

router.post("/admin/login", adminLoginValidation, validate, adminLogin);
router.post("/admin/logout", adminLogout);
router.post("/tutor/signup", tutorSignupValidation, validate, tutorSignup);

router.post("/tutor/login", tutorLogin);
router.post("/tutor/logout", tutorLogout);

router.post("/parent/send-otp", sendOtpValidation, validate, sendParentOtp);
router.post("/parent/verify-otp",verifyOtpValidation,validate,verifyParentOtp);
router.post("/parent/resend-otp",resendOtpValidation,validate,resendParentOtp);
router.post("/parent/login/send-otp", sendParentLoginOtp);
router.post("/parent/login/verify-otp",verifyLoginOtpValidation,validate,verifyParentLoginOtp);
router.post("/parent/resend-loginOtp",sendLoginOtpValidation,validate,resendParentLoginOtp);
router.post("/parent/logout", parentLogout);

// router.post("/refresh-token", refreshAccessToken);
router.get("/refresh", refresh);
export default router;
