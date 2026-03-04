import Joi from "joi";

export const updateTutorStatusValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "active", "blocked", "suspended")
    .required(),
});

export const createClassValidation = Joi.object({
  classGrade: Joi.number().min(1).max(12).required(),
});