import express from "express";
const router = express.Router();
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


router.get("/tutors/pending", getPendingTutors);
router.get("/tutors/:id", getTutorDetails);
router.patch("/tutors/:id/approve", approveTutor);
router.patch("/tutors/:id/reject", rejectTutor);
router.get("/parents/courses/recent", getRecentCourses);
router.get("/tutors", listTutors);
router.patch("/tutors/:id/status", updateTutorStatus);

router.get("/courses/recent", getRecentCourses);
router.get("/students", listStudents);
router.get("/students/:id", getStudentDetails);
router.patch("/parent/:id/status", updateParentStatus);
router.put("/students/:id/status", updateStudentStatus);

router.post("/classes", createClass);
router.get("/classes", getAllClasses);
router.get("/classes/:id", getClassDetails);
router.delete("/classes/:id", deleteClass);
router.patch("/classes/:classId/subjects", updateSubjectsForBoard);

router.get("/dashboard/stats", getAdminDashboardStats);

export default router;
