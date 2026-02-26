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
} from "../controllers/parent/managestudents.js";
import {
  getParentProfile,
  updateParentProfile,
  deleteParentProfile,
} from "../controllers/parent/parent.js";

import { protect } from "../middlewares/auth.js";
const router = express.Router();

router.get("/students", protect(["parent"]), async (req, res) => {
  try {
    const students = await Student.find({
      parentId: req.user.id,
      status: "active",
    });

    res.json({
      success: true,
      result: students,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});
router.post("/students", protect(["parent"]), addStudentByParent);

router.get(
  "/students/:studentId/subjects",
  protect(["parent"]),
  getSubjectsForStudent,
);
router.get("/tutors", protect(["parent"]), getTutorsForSubject);
router.post("/courses", protect(["parent"]), createCourse);
router.get("/courses", protect(["parent"]), getParentCourses);

router.get("/profile", protect(["parent"]), getParentProfile);
router.put("/profile", protect(["parent"]), updateParentProfile);
router.delete("/profile", protect(["parent"]), deleteParentProfile);
router.put("/students/:studentId", protect(["parent"]), updateStudent);

router.get(
  "/courses/:courseId/overview",
  protect(["parent"]),
  getParentCourseOverview,
);

export default router;
