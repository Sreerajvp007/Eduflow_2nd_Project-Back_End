import express from 'express';
import { addStudentByParent,getSubjectsForStudent,getTutorsForSubject,createCourse,getParentCourses } from '../controllers/parent/managestudents.js';

const router =express.Router();


router.post("/students",addStudentByParent);
router.get("/students/:studentId/subjects",getSubjectsForStudent);
router.get("/tutors",getTutorsForSubject);
router.post("/courses",createCourse);
router.get("/courses",getParentCourses);

export default router;