import Joi from "joi";

export const updateParentProfileValidation = Joi.object({
  fullName: Joi.string().min(2).max(50),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
});