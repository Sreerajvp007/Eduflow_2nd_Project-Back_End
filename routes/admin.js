

import express from "express";
import {
  getPendingTutors,
  getTutorDetails,
  approveTutor,
  rejectTutor,
  listTutors,
  updateTutorStatus,
} from "../controllers/admin/manageTutors.js";

import {
  getRecentCourses,
  listStudents,
  getStudentDetails,
  updateParentStatus,
  updateStudentStatus,
} from "../controllers/admin/manageParnets.js";

import {
  createClass,
  updateSubjectsForBoard,
  getAllClasses,
  getClassDetails,
  deleteClass,
} from "../controllers/admin/manageClassesSubs.js";

import { getAdminDashboardStats } from "../controllers/admin/admin.js";

import validate from "../middlewares/validate.js";
import {
  updateTutorStatusValidation,
  createClassValidation,
} from "../validations/admin.js";

import Joi from "joi";

const router = express.Router();

const idParamValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const classIdParamValidation = Joi.object({
  classId: Joi.string().hex().length(24).required(),
});



router.get("/tutors/pending", getPendingTutors);

router.get("/tutors/:id",validate(idParamValidation, "params"),getTutorDetails,);

router.patch("/tutors/:id/approve",validate(idParamValidation, "params"),approveTutor,);

router.patch("/tutors/:id/reject",validate(idParamValidation, "params"),rejectTutor,);

router.get("/tutors", listTutors);

router.patch("/tutors/:id/status",validate(idParamValidation, "params"),validate(updateTutorStatusValidation),updateTutorStatus,);



router.get("/courses/recent", getRecentCourses);



router.get("/students", listStudents);

router.get("/students/:id",validate(idParamValidation, "params"),getStudentDetails,);

router.patch("/parent/:id/status",validate(idParamValidation, "params"),updateParentStatus,);

router.put("/students/:id/status",validate(idParamValidation, "params"),updateStudentStatus,);



router.post("/classes", validate(createClassValidation), createClass);

router.get("/classes", getAllClasses);

router.get("/classes/:id",validate(idParamValidation, "params"),getClassDetails,);

router.delete("/classes/:id",validate(idParamValidation, "params"),deleteClass,);

router.patch("/classes/:classId/subjects",validate(classIdParamValidation, "params"),updateSubjectsForBoard,);



router.get("/dashboard/stats", getAdminDashboardStats);

export default router;
