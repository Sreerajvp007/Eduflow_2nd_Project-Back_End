import Joi from "joi";





export const adminLoginValidation = Joi.object({
  userName: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.empty": "Username is required",
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "Password is required",
    }),
});


export const tutorLoginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Enter a valid email",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required",
    }),
});

export const tutorSignupValidation = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Full name is required",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Enter a valid email",
      "string.empty": "Email is required",
    }),

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile must be 10 digits",
      "string.empty": "Mobile number is required",
    }),

  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.empty": "Password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Confirm password is required",
    }),
});


export const sendOtpValidation = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().min(2).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
});

export const verifyOtpValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const resendOtpValidation = Joi.object({
  email: Joi.string().email().required(),
});



export const sendLoginOtpValidation = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyLoginOtpValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const parentSignupValidation = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name must be less than 50 characters",
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Enter a valid email address",
    }),

  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/) 
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base":
        "Enter a valid 10-digit mobile number",
    }),
});


const email = Joi.string().email().required();

const mobile = Joi.string()
  .pattern(/^[6-9]\d{9}$/) // Indian mobile format
  .required()
  .messages({
    "string.pattern.base": "Mobile must be a valid 10-digit Indian number",
  });

const otp = Joi.string()
  .length(6)
  .pattern(/^\d+$/)
  .required()
  .messages({
    "string.length": "OTP must be 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
  });

/**
 * REGISTER FLOW
 */

// Send OTP (register)
export const sendParentOtpSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email,
  mobile,
});

// Verify OTP (register)
export const verifyParentOtpSchema = Joi.object({
  email,
  otp,
});

// Resend OTP (register)
export const resendParentOtpSchema = Joi.object({
  email,
});

/**
 * LOGIN FLOW
 */

// Send OTP (login)
export const sendParentLoginOtpSchema = Joi.object({
  email,
});

// Verify OTP (login)
export const verifyParentLoginOtpSchema = Joi.object({
  email,
  otp,
});

// Resend OTP (login)
export const resendParentLoginOtpSchema = Joi.object({
  email,
});