import express from "express";
import Student from "../models/Student.js";
import {
  addStudentByParent,
  getSubjectsForStudent,
  getTutorsForSubject,
  createCourse,
  getParentCourses,
  updateStudent,
  getParentCourseOverview,
  fetchStudent
} from "../controllers/parent/managestudents.js";
import {
  getParentProfile,
  updateParentProfile,
  deleteParentProfile,
  addReview,
  reportTutor
} from "../controllers/parent/parent.js";

import { protect } from "../middlewares/auth.js";
const router = express.Router();

router.get("/students", protect(["parent"]),fetchStudent );
router.post("/students", protect(["parent"]), addStudentByParent);

router.get("/students/:studentId/subjects",protect(["parent"]),getSubjectsForStudent,);
router.get("/tutors", protect(["parent"]), getTutorsForSubject);
router.post("/courses", protect(["parent"]), createCourse);
router.get("/courses", protect(["parent"]), getParentCourses);

router.get("/profile", protect(["parent"]), getParentProfile);
router.put("/profile", protect(["parent"]), updateParentProfile);
router.delete("/profile", protect(["parent"]), deleteParentProfile);
router.put("/students/:studentId", protect(["parent"]), updateStudent);

router.get("/courses/:courseId/overview",protect(["parent"]),getParentCourseOverview,);

router.post("/reviews", protect(["parent"]), addReview);

router.post("/reports", protect(["parent"]), reportTutor);

export default router;
