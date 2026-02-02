import { body } from "express-validator";


export const adminLoginValidation = [
  body("userName").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];


export const tutorSignupValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address"),

  body("mobile")
    .matches(/^[0-9]{7,15}$/)
    .withMessage("Please enter a valid mobile number"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];


export const sendOtpValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("mobile")
    .isMobilePhone("en-IN")
    .withMessage("Valid mobile number is required"),
];


export const verifyOtpValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];


export const resendOtpValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required"),
];


export const sendLoginOtpValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required"),
];

export const verifyLoginOtpValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];









