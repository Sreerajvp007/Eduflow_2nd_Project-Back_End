import Tutor from "../../models/Tutor.js";
import Student from "../../models/Student.js";
import Course from "../../models/Course.js";
import Review  from "../../models/Review.js";
import Report from "../../models/Report.js"
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


export const getAdminReports = async (req, res) => {

  try {

    const {
      page = 1,
      limit = 10,
      search = ""
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    let query = Report.find()

      .populate("parentId", "fullName")

      .populate({
        path: "courseId",
        select: "subject"
      })

      .populate("tutorId", "fullName")

      .sort({ createdAt: -1 });

    let reports = await query.skip(skip).limit(perPage);

    if (search) {

      const s = search.toLowerCase();

      reports = reports.filter((r) => {

        const parent = r.parentId?.fullName?.toLowerCase() || "";
        const subject = r.courseId?.subject?.toLowerCase() || "";

        return parent.includes(s) || subject.includes(s);

      });

    }

    const totalReports = await Report.countDocuments();

    res.json({
      success: true,
      result: {
        reports,
        totalReports,
        totalPages: Math.ceil(totalReports / perPage),
        currentPage
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });

  }
};
export const getAdminReviews = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 7,
      search = "",
      sort = "latest"
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    let query = Review.find()

      .populate("parentId", "fullName")

      .populate("tutorId", "fullName")

      .populate({
        path: "courseId",
        select: "subject studentId",
        populate: {
          path: "studentId",
          select: "name"
        }
      });

    // SORT
    if (sort === "highest") {
      query = query.sort({ rating: -1 });
    } 
    else if (sort === "lowest") {
      query = query.sort({ rating: 1 });
    } 
    else {
      query = query.sort({ createdAt: -1 });
    }

    let reviews = await query.skip(skip).limit(perPage);

    // SEARCH
    if (search) {

      const s = search.toLowerCase();

      reviews = reviews.filter((r) => {

        const parent = r.parentId?.fullName?.toLowerCase() || "";
        const subject = r.courseId?.subject?.toLowerCase() || "";
        const student = r.courseId?.studentId?.name?.toLowerCase() || "";

        return (
          parent.includes(s) ||
          subject.includes(s) ||
          student.includes(s)
        );

      });

    }

    /*
    ======================================
    ADD TUTOR AVG RATING
    ======================================
    */

    const tutorRatings = await Review.aggregate([
      {
        $group: {
          _id: "$tutorId",
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    const ratingMap = {};

    tutorRatings.forEach((t) => {
      ratingMap[t._id.toString()] = Number(t.avgRating.toFixed(1));
    });

    reviews = reviews.map((r) => {

      const tutorId = r.tutorId?._id?.toString();

      return {
        ...r.toObject(),
        tutorId: {
          ...r.tutorId.toObject(),
          avgRating: ratingMap[tutorId] || 0
        }
      };

    });

    const totalReviews = await Review.countDocuments();

    res.json({
      success: true,
      result: {
        reviews,
        totalReviews,
        totalPages: Math.ceil(totalReviews / perPage),
        currentPage
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });

  }
};

