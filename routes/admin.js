import express from "express";
import validate from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import {
  getAdminDashboardStats,
  getAdminReports,
  getAdminReviews,
  // createClass,
  // updateSubjectsForBoard,
  // getAllClasses,
  // getClassDetails,
  // deleteClass,
  getRecentCourses,
  listStudents,
  getStudentDetails,
  updateParentStatus,
  updateStudentStatus,
  getPendingTutors,
  getTutorDetails,
  approveTutor,
  rejectTutor,
  listTutors,
  updateTutorStatus,
  // getPlatformSettings,
  // updatePlatformSettings,
  getSettings,
  updateSettings,
  getAdminAnalytics,
  markReportSolved,
  getProfileEditRequests,
  approveProfileEdit,
  rejectProfileEdit,
  getParents,
  getParentDetails,
  streamAdminNotifications,
  getFilterLists,
} from "../controllers/admin.js";
import {
  getAdminRevenueStats,
  getTutorPayoutRequests,
  markPayoutPaid,
  getAdminPayments,
} from "../controllers/payment.js";
import { updateTutorStatusValidation } from "../validations/admin.js";

import {
  createClass,
  getAllClasses,
  updateSubjectsForBoard,
  deleteClass,
} from "../controllers/class.js";

const router = express.Router();
router.post("/classes", createClass);
router.get("/classes", getAllClasses);
router.put("/classes/:classId/subjects", updateSubjectsForBoard);
router.delete("/classes/:id", deleteClass);

router.get("/tutors/pending", protect(["admin"]), getPendingTutors);
router.get("/tutors/:id", protect(["admin"]), getTutorDetails);
router.patch("/tutors/:id/approve", protect(["admin"]), approveTutor);
router.patch("/tutors/:id/reject", protect(["admin"]), rejectTutor);
router.get("/tutors", protect(["admin"]), listTutors);
router.patch(
  "/tutors/:id/status",
  validate(updateTutorStatusValidation),
  updateTutorStatus,
);

router.get("/courses/recent", protect(["admin"]), getRecentCourses);
router.get("/students", protect(["admin"]), listStudents);
router.get("/students/:id", protect(["admin"]), getStudentDetails);
// router.patch("/parent/:id/status",protect(["admin"]), updateParentStatus);
router.put("/students/:id/status", protect(["admin"]), updateStudentStatus);

// router.post("/classes",protect(["admin"]), createClass);
// router.get("/classes",protect(["admin"]), getAllClasses);
// router.get("/classes/:id",protect(["admin"]), getClassDetails);
// router.delete("/classes/:id",protect(["admin"]), deleteClass);
// router.patch("/classes/:classId/subjects",protect(["admin"]), updateSubjectsForBoard);

router.get("/dashboard/stats", protect(["admin"]), getAdminDashboardStats);
router.get("/feedback/reviews", protect(["admin"]), getAdminReviews);
router.get("/feedback/reports", protect(["admin"]), getAdminReports);
router.patch(
  "/feedback/reports/:id/solve",
  protect(["admin"]),
  markReportSolved,
);

router.get("/revenue", protect(["admin"]), getAdminRevenueStats);
router.get("/payouts", protect(["admin"]), getTutorPayoutRequests);
router.patch("/payouts/:id/pay", protect(["admin"]), markPayoutPaid);
router.get("/payments", protect(["admin"]), getAdminPayments);

// router.get("/settings", protect(["admin"]), getPlatformSettings);

// router.put("/settings", protect(["admin"]), updatePlatformSettings);
router.get("/analytics", protect(["admin"]), getAdminAnalytics);

router.get(
  "/profile-edit-requests",
  protect(["admin"]),
  getProfileEditRequests,
);

router.patch(
  "/profile-edit/:requestId/approve",
  protect(["admin"]),
  approveProfileEdit,
);

router.patch(
  "/profile-edit/:requestId/reject",
  protect(["admin"]),
  rejectProfileEdit,
);
router.get("/settings", protect(["admin"]), getSettings);

router.put("/settings", protect(["admin"]), updateSettings);

router.get("/parents", protect(["admin"]), getParents);
router.put("/parents/:id/status", protect(["admin"]), updateParentStatus);
router.get("/parents/:id", protect(["admin"]), getParentDetails);
router.get("/notifications/stream", streamAdminNotifications);
router.get("/filter-lists", protect(["admin"]), getFilterLists);

export default router;
