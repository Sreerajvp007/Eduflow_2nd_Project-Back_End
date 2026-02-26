import Tutor from "../../models/Tutor.js";
import Student from "../../models/Student.js";
import Course from "../../models/Course.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const totalTutors = await Tutor.countDocuments({
      isApproved: true,
    });

    const pendingTutors = await Tutor.countDocuments({
      onboardingStatus: "submitted",
      isApproved: false,
    });

    const totalPurchases = await Course.countDocuments();

    const activeCourses = await Course.countDocuments({
      courseStatus: "active",
    });

    res.status(200).json({
      success: true,
      result: {
        totalStudents,
        totalTutors,
        pendingTutors,
        totalPurchases,
        activeCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};
