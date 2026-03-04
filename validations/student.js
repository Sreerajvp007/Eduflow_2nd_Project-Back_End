import Joi from "joi";

export const addStudentValidation = Joi.object({
  name: Joi.string().min(2).required(),

  grade: Joi.number()
    .min(1)
    .max(12)
    .required(),

  board: Joi.string()
    .valid("STATE", "CBSE", "ICSE")
    .required(),
});