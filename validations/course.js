import Joi from "joi";

export const createCourseValidation = Joi.object({
  studentId: Joi.string().hex().length(24).required(),
  tutorId: Joi.string().hex().length(24).required(),

  subject: Joi.string().min(2).required(),

  classLevel: Joi.number().min(1).max(12).required(),

  startDate: Joi.date().required(),

  timeSlot: Joi.string().required(),

  monthlyFee: Joi.number().min(0).required(),

  nextPaymentDate: Joi.date().required(),
});