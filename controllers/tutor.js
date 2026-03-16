import mongoose from "mongoose";
import Course from "../models/Course.js";
import Session from "../models/Session.js";
import Tutor from "../models/Tutor.js";
import Review from "../models/Review.js";
import TutorWallet from "../models/TutorWallet.js";
import Payment from "../models/Payment.js";
import PayoutRequest from "../models/PayoutRequest.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import TutorProfileEditRequest from "../models/TutorProfileEditRequest.js";

// students
export const getMyStudents = async (req, res) => {
  try {
    const tutorId = new mongoose.Types.ObjectId(req.user.id);

    const { page = 1, limit = 1, search = "", grade, status } = req.query;

    const skip = (page - 1) * limit;

    const matchStage = {
      tutorId,
    };

    const pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },

      {
        $lookup: {
          from: "parents",
          localField: "parentId",
          foreignField: "_id",
          as: "parent",
        },
      },
      { $unwind: "$parent" },

      {
        $match: {
          ...(search && {
            $or: [
              { "student.name": { $regex: search, $options: "i" } },
              { "parent.name": { $regex: search, $options: "i" } },
            ],
          }),
          ...(grade && { "student.grade": Number(grade) }),
          ...(status && { "student.status": status }),
        },
      },

      {
        $group: {
          _id: "$student._id",
          studentName: { $first: "$student.name" },
          grade: { $first: "$student.grade" },
          parentName: { $first: "$parent.fullName" },
          mobile: { $first: "$parent.mobile" },
          status: { $first: "$student.status" },
        },
      },
    ];

    const totalResult = await Course.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);

    const students = await Course.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      result: students,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
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

export const getStudentCourses = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { studentId } = req.params;

    const { page = 1, limit = 3 } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const query = {
      tutorId: new mongoose.Types.ObjectId(tutorId),
      studentId: new mongoose.Types.ObjectId(studentId),
    };

    const courses = await Course.find(query)
      .select(
        "subject classLevel timeSlot monthlyFee courseStatus paymentStatus nextPaymentDate",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      result: courses,
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
      message: "Failed to fetch student courses",
    });
  }
};

// reviews

export const getTutorReviews = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const { page = 1, limit = 6, search = "", sort = "latest" } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    let query = Review.find({ tutorId })

      .populate("parentId", "fullName email")

      .populate({
        path: "courseId",
        select: "subject studentId",
        populate: {
          path: "studentId",
          select: "name",
        },
      });

    if (sort === "rating") {
      query = query.sort({ rating: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    let reviews = await query.skip(skip).limit(perPage);

    if (search) {
      const searchLower = search.toLowerCase();

      reviews = reviews.filter((r) => {
        const parentName = r.parentId?.fullName?.toLowerCase() || "";

        const subject = r.courseId?.subject?.toLowerCase() || "";

        return (
          parentName.includes(searchLower) || subject.includes(searchLower)
        );
      });
    }

    const totalReviews = await Review.countDocuments({ tutorId });

    const avgRatingAgg = await Review.aggregate([
      {
        $match: {
          tutorId: new mongoose.Types.ObjectId(tutorId),
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
        },
      },
    ]);

    const avgRating = avgRatingAgg.length ? avgRatingAgg[0].avg : 0;

    res.json({
      success: true,
      result: {
        reviews,
        avgRating: Number(avgRating.toFixed(1)),
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
export const getTutorEarnings = async (req, res) => {
  try {
    const tutorId = new mongoose.Types.ObjectId(req.user.id);

    const wallet = await TutorWallet.findOne({ tutorId });

    const tutor = await Tutor.findById(tutorId).select("bankDetails");

    const hasBankDetails =
      tutor?.bankDetails?.accountNumber || tutor?.bankDetails?.upiId;

    const totalAgg = await Payment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },

      {
        $match: {
          "course.tutorId": tutorId,
          earningReleased: true,
        },
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$tutorEarning" },
        },
      },
    ]);

    const totalEarnings = totalAgg[0]?.total || 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyAgg = await Payment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },

      { $unwind: "$course" },

      {
        $match: {
          "course.tutorId": tutorId,
          createdAt: { $gte: startOfMonth },
          earningReleased: true,
        },
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$tutorEarning" },
        },
      },
    ]);

    const monthlyIncome = monthlyAgg[0]?.total || 0;

    const pendingAgg = await PayoutRequest.aggregate([
      {
        $match: {
          tutorId,
          status: "pending",
        },
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const pendingAmount = pendingAgg[0]?.total || 0;

    res.json({
      success: true,
      result: {
        totalEarnings,
        monthlyIncome,
        walletBalance: wallet?.walletBalance || 0,
        totalWithdrawn: wallet?.totalWithdrawn || 0,
        pendingAmount,
        hasBankDetails: !!hasBankDetails,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch earnings",
    });
  }
};

export const getTutorPaymentHistory = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const page = Number(req.query.page) || 4;
    const limit = 6;
    const skip = (page - 1) * limit;

    const payments = await Payment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },

      {
        $match: {
          "course.tutorId": new mongoose.Types.ObjectId(tutorId),
        },
      },

      {
        $lookup: {
          from: "students",
          localField: "course.studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },

      {
        $lookup: {
          from: "parents",
          localField: "student.parentId",
          foreignField: "_id",
          as: "parent",
        },
      },
      { $unwind: "$parent" },

      {
        $project: {
          tutorEarning: 1,
          createdAt: 1,

          courseId: "$course._id",
          subject: "$course.subject",

          studentName: "$student.name",

          parentName: "$parent.fullName",
        },
      },

      { $sort: { createdAt: -1 } },

      { $skip: skip },

      { $limit: limit },
    ]);

    const totalAgg = await Payment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $match: {
          "course.tutorId": new mongoose.Types.ObjectId(tutorId),
        },
      },
      { $count: "total" },
    ]);

    const total = totalAgg[0]?.total || 0;

    res.json({
      success: true,
      result: payments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};

export const requestPayout = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { amount, method, notes } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid payout amount",
      });
    }

    const tutor = await Tutor.findById(tutorId);

    if (!tutor.bankDetails?.razorpayFundAccountId) {
      return res.status(400).json({
        message: "Please add bank details first",
      });
    }

    const wallet = await TutorWallet.findOne({ tutorId });

    if (!wallet || wallet.walletBalance < amount) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
      });
    }

    const payout = await PayoutRequest.create({
      tutorId,
      amount,
      method,
      notes,
    });

    res.json({
      success: true,
      message: "Payout request submitted",
      payout,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to request payout",
    });
  }
};

export const getTutorPayouts = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const payouts = await PayoutRequest.find({ tutorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PayoutRequest.countDocuments({ tutorId });

    res.json({
      success: true,
      result: payouts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch payouts",
    });
  }
};

// courses
export const getNewCoursesForTutor = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const courses = await Course.find({
      tutorId,
      // paymentStatus: "paid",
      "learningPlan.isPublished": false,
      courseStatus: "active",
    })
      .populate("studentId", "name grade")
      .populate("parentId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      result: courses,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch new courses",
    });
  }
};

export const getTutorManagedCourses = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const { page = 1, limit = 1, search = "", status = "all" } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const filter = {
      tutorId,
      paymentStatus: "paid",
      "learningPlan.isPublished": true,
      courseStatus: { $in: ["active", "paused", "completed"] },
    };

    if (status !== "all") {
      filter.courseStatus = status;
    }

    if (search) {
      filter.$or = [{ subject: { $regex: search, $options: "i" } }];
    }

    const courses = await Course.find(filter)
      .populate("studentId", "name grade")
      .populate("parentId", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      result: courses,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch tutor courses",
    });
  }
};

export const getTutorCourseById = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      tutorId,
    })
      .populate("studentId", "name grade")
      .populate("parentId", "fullName");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const sessions = await Session.find({
      courseId: course._id,
    }).sort({ sessionDate: 1 });

    res.json({
      success: true,
      result: {
        ...course.toObject(),
        sessions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch course",
    });
  }
};

export const getTutorCourses = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const courses = await Course.find({
      tutorId,
      paymentStatus: "paid",
      courseStatus: "active",
    })
      .populate("studentId", "name grade")
      .populate("parentId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      result: courses,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
};

export const saveLearningPlan = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { courseId } = req.params;

    const {
      courseName,
      description,
      expectedDuration,
      sessions = [],
      tutorNotes,
      strengths,
      improvements,
      isPublished,
    } = req.body;

    const course = await Course.findOne({
      _id: courseId,
      tutorId,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    course.learningPlan = {
      courseName,
      description,
      expectedDuration,
      tutorNotes,
      strengths,
      improvements,
      isPublished: isPublished ?? course.learningPlan?.isPublished ?? false,
    };

    await course.save();

    const existingSessions = await Session.find({ courseId });

    const existingIds = existingSessions.map((s) => s._id.toString());

    const incomingIds = sessions
      .filter((s) => s._id)
      .map((s) => s._id.toString());

    const sessionsToDelete = existingIds.filter(
      (id) => !incomingIds.includes(id),
    );

    if (sessionsToDelete.length > 0) {
      await Session.deleteMany({
        _id: { $in: sessionsToDelete },
      });
    }

    for (const s of sessions) {
      if (s._id) {
        await Session.findByIdAndUpdate(
          s._id,
          {
            title: s.title,
            description: s.description,
            sessionDate: s.sessionDate,
          },
          { new: true },
        );
      } else {
        const sessionId = new mongoose.Types.ObjectId();

        await Session.create({
          _id: sessionId,
          courseId,
          tutorId,
          studentId: course.studentId,
          title: s.title,
          description: s.description,
          sessionDate: s.sessionDate,
          status: "scheduled",
          channelName: `session_${sessionId}`,
        });
      }
    }

    const updatedCourse = await Course.findById(courseId)
      .populate("studentId", "name grade")
      .populate("parentId", "fullName");

    const updatedSessions = await Session.find({ courseId }).sort({
      sessionDate: 1,
    });

    res.json({
      success: true,
      message: "Learning plan saved successfully",
      result: {
        ...updatedCourse.toObject(),
        sessions: updatedSessions,
      },
    });
  } catch (err) {
    console.error("SAVE LEARNING PLAN ERROR:", err);

    res.status(500).json({
      message: "Failed to save learning plan",
    });
  }
};

export const markCourseAsCompleted = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      tutorId,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    course.courseStatus = "completed";
    await course.save();

    await Tutor.updateOne(
      {
        _id: tutorId,
        "availability.time": course.timeSlot,
      },
      {
        $set: { "availability.$.status": "available" },
      },
    );

    const updatedCourse = await Course.findById(courseId)
      .populate("studentId", "name grade")
      .populate("parentId", "name");

    res.json({
      success: true,
      result: updatedCourse,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update course status",
    });
  }
};

export const getTutorSessions = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const page = Number(req.query.page) || 1;
    const limit = 10;

    const status = req.query.status;
    const search = req.query.search || "";

    const query = { tutorId };

    // if (status) query.status = status;
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const sessions = await Session.find(query)
      .populate("courseId", "subject timeSlot")
      .populate("studentId", "name")
      .sort({ sessionDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      sessions,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

export const createSession = async (req, res) => {
  try {
    const { courseId, studentId, title, description, sessionDate, startTime } =
      req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message:
          "Parent has not completed payment for the next month. Session cannot be scheduled.",
      });
    }

    const exists = await Session.findOne({
      tutorId: req.user.id,
      sessionDate,
      startTime,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This time slot already has a session.",
      });
    }

    const sessionId = new mongoose.Types.ObjectId();

    const session = await Session.create({
      _id: sessionId,
      tutorId: req.user.id,
      courseId,
      studentId,
      title,
      description,
      sessionDate,
      startTime,
      status: "scheduled",
      channelName: `session_${sessionId}`,
    });

    res.json({
      success: true,
      result: session,
    });
  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    session.status = "live";
    session.actualStart = new Date();

    await session.save();

    res.json({
      success: true,
      result: session,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to start session",
    });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    console.log(session);
    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    session.status = "completed";
    session.actualEnd = new Date();

    await session.save();

    res.json({
      success: true,
      result: session,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to end session",
    });
  }
};

export const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.status = "cancelled";

    await session.save();

    res.json({
      success: true,
      message: "Session cancelled",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    await session.deleteOne();

    res.json({
      success: true,
      message: "Session deleted permanently",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// availability
export const getTutorAvailability = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user.id).select(
      "availability subjects",
    );

    res.json({
      success: true,
      result: {
        availability: tutor.availability,
        subjects: tutor.subjects,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const addAvailabilitySlot = async (req, res) => {
  try {
    const { time } = req.body;

    const tutor = await Tutor.findById(req.user.id);

    const exists = tutor.availability.find((slot) => slot.time === time);

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Slot already exists",
      });
    }

    tutor.availability.push({
      time,
      status: "available",
    });

    await tutor.save();

    res.json({
      success: true,
      result: tutor.availability,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const blockAvailabilitySlot = async (req, res) => {
  try {
    const { time } = req.body;

    const tutor = await Tutor.findById(req.user.id);

    const slot = tutor.availability.find((s) => s.time === time);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    slot.status = "blocked";

    await tutor.save();

    res.json({
      success: true,
      result: tutor.availability,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const unblockAvailabilitySlot = async (req, res) => {
  try {
    const { time } = req.body;

    const tutor = await Tutor.findById(req.user.id);

    const slot = tutor.availability.find((s) => s.time === time);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    slot.status = "available";

    await tutor.save();

    res.json({
      success: true,
      result: tutor.availability,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getTutorStudents = async (req, res) => {
  try {
    const courses = await Course.find({
      tutorId: req.user.id,
      courseStatus: "active",
    })
      .populate("studentId", "name")
      .select("studentId subject");

    const studentsMap = {};

    courses.forEach((course) => {
      const id = course.studentId._id.toString();

      if (!studentsMap[id]) {
        studentsMap[id] = {
          studentId: id,
          name: course.studentId.name,
          subjects: [],
        };
      }

      studentsMap[id].subjects.push({
        subject: course.subject,
        courseId: course._id,
      });
    });

    res.json({
      success: true,
      result: Object.values(studentsMap),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true },
    );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.json({
      success: true,
      result: session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update session",
    });
  }
};

export const getTutorProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user.id).select(
      "-password -refreshToken",
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    res.json({
      success: true,
      result: tutor,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

export const submitProfileEditRequest = async (req, res) => {
  try {
    console.log("hello");
    const tutorId = req.user.id;

    const { fullName, mobile, teachingExperience, monthlyFee } = req.body;

    let profileImage;

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "tutor_profiles",
      );

      profileImage = result.secure_url;
    }

    const request = await TutorProfileEditRequest.create({
      tutorId,
      fullName,
      mobile,
      teachingExperience,
      monthlyFee,
      profileImage,
      status: "pending",
    });

    res.json({
      success: true,
      message: "Profile update request submitted for admin approval",
      result: request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to submit request",
    });
  }
};

export const getProfileEditRequestStatus = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const request = await TutorProfileEditRequest.findOne({
      tutorId,
      status: "pending",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      result: request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch request status",
    });
  }
};

export const getTutorDashboard = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const newCourses = await Course.countDocuments({
      tutorId,
      courseStatus: "pending",
    });

    const activeCourses = await Course.countDocuments({
      tutorId,
      paymentStatus: "paid",
      courseStatus: "active",
    });

    const upcomingSessions = await Session.countDocuments({
      tutorId,
      status: "scheduled",
    });

    const ratingResult = await Review.aggregate([
      {
        $match: {
          tutorId: new mongoose.Types.ObjectId(tutorId),
        },
      },
      {
        $group: {
          _id: "$tutorId",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const rating = ratingResult.length
      ? Number(ratingResult[0].avgRating.toFixed(1))
      : 0;

    res.json({
      newCourses,
      activeCourses,
      upcomingSessions,
      rating,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};
