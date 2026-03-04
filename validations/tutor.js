import Joi from "joi";

export const saveProfileInfoValidation = Joi.object({
  bio: Joi.string().max(500).allow(""),
});



export const saveTeachingInfoValidation = Joi.object({
  syllabus: Joi.string()
    .valid("STATE", "CBSE", "ICSE")
    .required()
    .messages({
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

//   availability: Joi.array()
//     .items(Joi.string())
//     .min(1)
//     .required()
//     .messages({
//       "array.min": "Select at least one availability slot",
//       "any.required": "Availability is required",
//     }),

  teachingExperience: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Experience must be a number",
      "number.min": "Experience must be greater than or equal to 0",
      "any.required": "Teaching experience is required",
    }),

  hourlyRate: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Hourly rate must be a number",
      "number.min": "Hourly rate must be greater than or equal to 0",
      "any.required": "Hourly rate is required",
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