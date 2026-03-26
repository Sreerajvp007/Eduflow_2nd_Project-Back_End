import Joi from "joi";

export const saveProfileInfoValidation = Joi.object({
  bio: Joi.string().max(500).allow(""),
});




export const saveTeachingInfoValidation = Joi.object({
  syllabus: Joi.array()
    .items(Joi.string().valid("STATE", "CBSE", "ICSE"))
    .min(1)
    .required()
    .messages({
      "array.min": "Select at least one syllabus",
      "any.required": "Syllabus is required",
      "any.only": "Invalid syllabus selected",
    }),

  classes: Joi.array()
    .items(Joi.number().min(1).max(12))
    .min(1)
    .required()
    .messages({
      "array.min": "Select at least one class",
      "any.required": "Classes are required",
    }),

  subjects: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      "array.min": "Select at least one subject",
      "any.required": "Subjects are required",
    }),

  availability: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      "array.min": "Select at least one availability slot",
      "any.required": "Availability is required",
    }),

  teachingExperience: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Experience must be a number",
      "number.min": "Experience must be greater than or equal to 0",
      "any.required": "Teaching experience is required",
    }),

  monthlyFee: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Monthly fee must be a number",
      "number.min": "Monthly fee must be greater than or equal to 0",
      "any.required": "Monthly fee is required",
    }),
});

export const saveQualificationsValidation = Joi.object({
  qualifications: Joi.array()
    .items(
      Joi.object({
        title: Joi.string()
          .trim()
          .min(2)
          .required()
          .messages({
            "string.empty": "Degree / Certification name is required",
            "any.required": "Degree / Certification name is required",
          }),

        institute: Joi.string()
          .trim()
          .min(2)
          .required()
          .messages({
            "string.empty": "Institution name is required",
            "any.required": "Institution name is required",
          }),

        year: Joi.number()
          .min(1950)
          .max(new Date().getFullYear())
          .required()
          .messages({
            "number.base": "Year must be a valid number",
            "number.min": "Year must be after 1950",
            "number.max": `Year cannot exceed ${new Date().getFullYear()}`,
            "any.required": "Year is required",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Add at least one qualification",
      "any.required": "Qualifications are required",
    }),
});


export const saveIdVerificationValidation = Joi.object({
  idType: Joi.string()
    .valid("Aadhaar Card", "PAN Card", "Passport", "Driving License")
    .required(),

  idNumber: Joi.when("idType", {
    switch: [
      {
        is: "Aadhaar Card",
        then: Joi.string()
          .pattern(/^\d{12}$/)
          .required()
          .messages({
            "string.pattern.base": "Aadhaar must be 12 digits",
          }),
      },
      {
        is: "PAN Card",
        then: Joi.string()
          .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
          .required()
          .messages({
            "string.pattern.base": "Invalid PAN format",
          }),
      },
      {
        is: "Passport",
        then: Joi.string()
          .pattern(/^[A-Z0-9]{6,9}$/)
          .required()
          .messages({
            "string.pattern.base": "Invalid Passport format",
          }),
      },
      {
        is: "Driving License",
        then: Joi.string()
          .min(6)
          .max(20)
          .required(),
      },
    ],
  }),
});

export const saveBankDetailsValidation = Joi.object({

  accountHolderName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.empty": "Account holder name is required",
      "string.pattern.base": "Name must contain only letters",
    }),

  accountNumber: Joi.string()
    .pattern(/^\d{9,18}$/)
    .required()
    .messages({
      "string.empty": "Account number is required",
      "string.pattern.base": "Account number must be 9-18 digits",
    }),

  ifsc: Joi.string()
    .uppercase()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.empty": "IFSC code is required",
      "string.pattern.base": "Invalid IFSC code",
    }),

  bankName: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "Bank name is required",
    }),


  upiId: Joi.string()
    .pattern(/^[\w.-]+@[\w]+$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base": "Invalid UPI ID",
    }),

});

export const updateProfileValidation = Joi.object({

  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.pattern.base": "Name must contain only letters",
      "string.min": "Name must be at least 3 characters",
    }),

  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base": "Enter valid 10-digit mobile number",
    }),

  teachingExperience: Joi.number()
    .min(0)
    .max(50)
    .required()
    .messages({
      "number.base": "Experience must be a number",
      "number.min": "Experience cannot be negative",
    }),

  monthlyFee: Joi.number()
    .min(0)
    .max(100000)
    .required()
    .messages({
      "number.base": "Fee must be a number",
      "number.min": "Fee cannot be negative",
    }),

});