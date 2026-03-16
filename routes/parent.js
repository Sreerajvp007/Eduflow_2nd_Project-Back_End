import express from "express";
import { protect } from "../middlewares/auth.js";
import { checkParentDeleted } from "../middlewares/checkParentDeleted.js";
import {
  getParentProfile,
  updateParentProfile,
  deleteParentProfile,
  addReview,
  reportTutor,
  addStudentByParent,
  getSubjectsForStudent,
  getTutorsForSubject,
  createCourse,
  getParentCourses,
  updateStudent,
  getParentCourseOverview,
  fetchStudent,
  getParentSessions
} from "../controllers/parent.js";
import {
  updateParentSchema,
  updateStudentSchema,
  addStudentSchema
} from "../validations/parent.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

// router.use(protect(["parent"]));
// router.use(checkParentDeleted);

router.get("/students", protect(["parent"]),fetchStudent );
router.post("/students", protect(["parent"]),validate(addStudentSchema), addStudentByParent);
router.get("/profile", protect(["parent"]), getParentProfile);
router.put(
  "/profile",
  protect(["parent"]),
  validate(updateParentSchema),
  updateParentProfile
);
router.delete("/profile", protect(["parent"]), deleteParentProfile);
router.put(
  "/students/:studentId",
  protect(["parent"]),
  validate(updateStudentSchema),
  updateStudent
);


// course purchasing
router.get("/students/:studentId/subjects",protect(["parent"]),getSubjectsForStudent,);
router.get("/tutors", protect(["parent"]), getTutorsForSubject);
router.post("/courses", protect(["parent"]), createCourse);

router.get("/courses", protect(["parent"]), getParentCourses);
router.get("/courses/:courseId/overview",protect(["parent"]),getParentCourseOverview);

router.post("/reviews", protect(["parent"]), addReview);
router.post("/reports", protect(["parent"]), reportTutor);

router.get("/sessions", protect(["parent"]), getParentSessions);

export default router;
