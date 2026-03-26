import express from "express";
import validate from "../middlewares/validate.js";


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
} from "../controllers/auth.js";

import {
  adminLoginValidation,
  tutorSignupValidation,
  tutorLoginValidation,
   sendParentOtpSchema,
  verifyParentOtpSchema,
  resendParentOtpSchema,
  sendParentLoginOtpSchema,
  verifyParentLoginOtpSchema,
  resendParentLoginOtpSchema,

} from "../validations/auth.js";


const router = express.Router();

router.post("/admin/login", validate(adminLoginValidation), adminLogin);
router.post("/admin/logout", adminLogout);

router.post("/tutor/signup", validate(tutorSignupValidation), tutorSignup);
router.post("/tutor/login", validate(tutorLoginValidation), tutorLogin);
router.post("/tutor/logout", tutorLogout);

router.post("/parent/send-otp",validate(sendParentOtpSchema), sendParentOtp);
router.post("/parent/verify-otp",verifyParentOtp);
router.post("/parent/resend-otp",  resendParentOtp);
router.post("/parent/login/send-otp",validate(sendParentLoginOtpSchema), sendParentLoginOtp);
router.post("/parent/login/verify-otp",  validate(verifyParentLoginOtpSchema),verifyParentLoginOtp);
router.post("/parent/login/resend-otp", validate(resendParentLoginOtpSchema), resendParentLoginOtp);
router.post("/parent/logout", parentLogout);

router.get("/refresh", refresh);

export default router;
