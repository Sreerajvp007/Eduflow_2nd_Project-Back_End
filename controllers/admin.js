import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Parent from "../models/Parent.js";
import Review from "../models/Review.js";
import Report from "../models/Report.js";
import Class from "../models/Class.js";
import PlatformSettings from "../models/PlatformSettings.js";
import Payment from "../models/payment.js";
import TutorProfileEditRequest from "../models/TutorProfileEditRequest.js";

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
    const { page = 1, limit = 10, search = "" } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    let query = Report.find()

      .populate("parentId", "fullName email mobile")

      .populate({
        path: "courseId",
        select: "subject",
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
        currentPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

export const markReportSolved = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "solved" },
      { new: true },
    )
      .populate("parentId", "fullName email mobile")
      .populate("tutorId", "fullName")
      .populate({
        path: "courseId",
        select: "subject",
      });

    res.json({
      success: true,
      result: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update report",
    });
  }
};

export const getAdminReviews = async (req, res) => {
  try {
    const { page = 1, limit = 7, search = "", sort = "latest" } = req.query;

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
          select: "name",
        },
      });

    if (sort === "highest") {
      query = query.sort({ rating: -1 });
    } else if (sort === "lowest") {
      query = query.sort({ rating: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    let reviews = await query.skip(skip).limit(perPage);

    if (search) {
      const s = search.toLowerCase();

      reviews = reviews.filter((r) => {
        const parent = r.parentId?.fullName?.toLowerCase() || "";
        const subject = r.courseId?.subject?.toLowerCase() || "";
        const student = r.courseId?.studentId?.name?.toLowerCase() || "";

        return parent.includes(s) || subject.includes(s) || student.includes(s);
      });
    }

    const tutorRatings = await Review.aggregate([
      {
        $group: {
          _id: "$tutorId",
          avgRating: { $avg: "$rating" },
        },
      },
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
          avgRating: ratingMap[tutorId] || 0,
        },
      };
    });

    const totalReviews = await Review.countDocuments();

    res.json({
      success: true,
      result: {
        reviews,
        totalReviews,
        totalPages: Math.ceil(totalReviews / perPage),
        currentPage,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

//classes
export const createClass = async (req, res) => {
  try {
    const { classGrade } = req.body;

    if (!classGrade) {
      return res.status(400).json({
        success: false,
        message: "Class grade is required",
      });
    }

    const exists = await Class.findOne({ classGrade });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Class already exists",
      });
    }

    const newClass = await Class.create({ classGrade });

    res.status(201).json({
      success: true,
      result: newClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create class",
    });
  }
};

export const updateSubjectsForBoard = async (req, res) => {
  try {
    const { classId } = req.params;
    const { board, subjects } = req.body;

    const allowedBoards = ["STATE", "CBSE", "ICSE"];

    if (!allowedBoards.includes(board)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board",
      });
    }

    if (!Array.isArray(subjects)) {
      return res.status(400).json({
        success: false,
        message: "Subjects must be an array",
      });
    }

    const classDoc = await Class.findById(classId);

    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    classDoc.subjectsByBoard[board] = subjects.map((s) => ({
      name: s.trim(),
    }));

    await classDoc.save();

    res.status(200).json({
      success: true,
      message: "Subjects updated successfully",
      result: classDoc.subjectsByBoard[board],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update subjects",
    });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ classGrade: 1 });

    res.status(200).json({
      success: true,
      result: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
    });
  }
};

export const getClassDetails = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);

    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      result: classDoc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch class",
    });
  }
};

export const deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete class",
    });
  }
};

// courses
export const getRecentCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("parentId", "fullName email")
      .populate("studentId", "name")
      .populate("tutorId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      result: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent courses",
    });
  }
};

export const listStudents = async (req, res) => {
  try {
    const {
      search = "",
      grade = "",
      status = "",
      page = 1,
      limit = 2,
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const query = {};

    if (grade) query.grade = grade;
    if (status) query.status = status;

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const students = await Student.find(query)
      .populate("parentId", "fullName email mobile status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      result: students,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

export const getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "parentId",
      "fullName email mobile status",
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      result: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch student details",
    });
  }
};

export const updateParentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "blocked"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    parent.status = status;
    await parent.save();

    res.status(200).json({
      success: true,
      message: `Parent ${status} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update parent status",
    });
  }
};

export const updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["active", "blocked"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student status",
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.status = status;
    await student.save();

    const updatedStudent = await Student.findById(id).populate(
      "parentId",
      "fullName email mobile status",
    );

    res.status(200).json({
      success: true,
      message: `Student ${status} successfully`,
      result: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update student status",
    });
  }
};

//tutors
export const getPendingTutors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;

    const skip = (page - 1) * limit;

    const query = {
      onboardingStatus: "submitted",
      isApproved: false,
    };

    const total = await Tutor.countDocuments(query);

    const tutors = await Tutor.find(query)
      .select("fullName profileImage email subjects createdAt onboardingStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      result: tutors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending tutors",
    });
  }
};

export const getTutorDetails = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    res.status(200).json({
      success: true,
      result: tutor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor details",
    });
  }
};
export const approveTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    if (tutor.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Tutor already approved",
      });
    }

    tutor.status = "active";
    tutor.onboardingStatus = "approved";
    tutor.isApproved = true;
    tutor.approvedAt = new Date();
    tutor.rejectionReason = null;

    await tutor.save();

    return res.status(200).json({
      success: true,
      message: "Tutor approved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve tutor",
    });
  }
};

export const rejectTutor = async (req, res) => {
  try {
    const { reason } = req.body;

    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    tutor.onboardingStatus = "rejected";
    tutor.isApproved = false;
    tutor.rejectionReason = reason || "Not specified";

    await tutor.save();

    res.status(200).json({
      success: true,
      message: "Tutor rejected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject tutor",
    });
  }
};

export const listTutors = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      subject = "",
      page = 1,
      limit = 2,
    } = req.query;

    const query = {};

    if (status) query.status = status;

    if (subject) {
      query.subjects = { $in: [subject] };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { subjects: { $regex: search, $options: "i" } },
      ];
    }

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const tutors = await Tutor.find(query)
      .select(
        "fullName email subjects status onboardingStatus rating profileImage mobile monthlyFee",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    const total = await Tutor.countDocuments(query);

    res.status(200).json({
      success: true,
      result: tutors,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutors",
    });
  }
};

export const updateTutorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "suspended", "blocked"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor status",
      });
    }

    const tutor = await Tutor.findById(id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    if (tutor.status === status) {
      return res.status(400).json({
        success: false,
        message: `Tutor already ${status}`,
      });
    }

    tutor.status = status;
    await tutor.save();

    const updatedTutor = await Tutor.findById(id);

    res.status(200).json({
      success: true,
      message: `Tutor ${status} successfully`,
      result: updatedTutor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update tutor status",
    });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const revenue = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenue[0]?.totalRevenue || 0;

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const purchases = await Course.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          courses: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const subjectDemand = await Course.aggregate([
      {
        $group: {
          _id: "$subject",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const topSubject = subjectDemand[0]?._id || "None";

    const tutorSubjects = await Tutor.aggregate([
      { $unwind: "$subjects" },
      {
        $group: {
          _id: "$subjects",
          count: { $sum: 1 },
        },
      },
    ]);

    const avgRating = await Tutor.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$averageRating" },
        },
      },
    ]);

    res.json({
      success: true,
      result: {
        totalRevenue,
        monthlyRevenue,
        purchases,
        subjectDemand,
        tutorSubjects,
        avgTutorRating: avgRating[0]?.avgRating?.toFixed(1) || 0,
        topSubject,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
    });
  }
};

//

export const approveProfileEdit = async (req, res) => {
  const { requestId } = req.params;

  const request = await TutorProfileEditRequest.findById(requestId);

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  const tutor = await Tutor.findById(request.tutorId);

  if (!tutor) {
    return res.status(404).json({ message: "Tutor not found" });
  }

  // update tutor profile
  tutor.fullName = request.fullName;
  tutor.mobile = request.mobile;
  tutor.teachingExperience = request.teachingExperience;
  tutor.monthlyFee = request.monthlyFee;

  if (request.profileImage) {
    tutor.profileImage = request.profileImage;
  }

  await tutor.save();

  request.status = "approved";
  await request.save();

  res.json({
    success: true,
    message: "Profile update approved",
  });
};

export const rejectProfileEdit = async (req, res) => {
  const { requestId } = req.params;

  const request = await TutorProfileEditRequest.findById(requestId);

  request.status = "rejected";

  await request.save();

  res.json({
    success: true,
    message: "Request rejected",
  });
};

export const getProfileEditRequests = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const requests = await TutorProfileEditRequest.find({ status: "pending" })
      .populate(
        "tutorId",
        "fullName profileImage mobile teachingExperience monthlyFee",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TutorProfileEditRequest.countDocuments({
      status: "pending",
    });

    res.json({
      success: true,
      result: requests,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile edit requests",
    });
  }
};

export const getSettings = async (req, res) => {
  const settings = await PlatformSettings.findOne();

  res.json({
    success: true,
    result: settings,
  });
};

export const updateSettings = async (req, res) => {
  const { adminCommission } = req.body;

  const tutorCommission = 100 - adminCommission;

  const settings = await PlatformSettings.findOneAndUpdate(
    {},
    {
      adminCommission,
      tutorCommission,
    },
    { new: true },
  );

  res.json({
    success: true,
    result: settings,
  });
};
