import express from 'express';
const router =express.Router();
import { getPendingTutors,getTutorDetails,approveTutor,rejectTutor,listTutors,updateTutorStatus } from '../controllers/admin/manageTutors.js';
import { getRecentCourses,listStudents,getStudentDetails,updateParentStatus,updateStudentStatus } from '../controllers/admin/manageParnets.js';

router.get("/tutors/pending", getPendingTutors);
router.get("/tutors/:id", getTutorDetails);
router.patch("/tutors/:id/approve", approveTutor);
router.patch("/tutors/:id/reject",rejectTutor);
router.get("/parents/courses/recent",getRecentCourses);
router.get("/tutors",listTutors);
router.get("/tutors/:id/status",updateTutorStatus);

router.get("/courses/recent",getRecentCourses);
router.get("/students", listStudents);
router.get("/students/:id", getStudentDetails);
router.patch("/parent/:id/status",updateParentStatus);
router.patch("/students/:id/status",updateStudentStatus);




export default router;