import Parent from "../models/Parent.js";
import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Session from "../models/Session.js";
import Class from "../models/Class.js";
import Report from "../models/Report.js";
import Review from "../models/Review.js";
import eventBus from "../utils/eventBus.js";

export const getParentProfile = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id).select("-password");

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    res.json({
      success: true,
      result: parent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateParentProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const parent = await Parent.findById(req.user.id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    parent.fullName = name || parent.name;
    parent.mobile = phone || parent.phone;

    await parent.save();

    res.json({
      success: true,
      result: parent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

export const deleteParentProfile = async (req, res) => {
  try {
    await Parent.findByIdAndUpdate(req.user.id, {
      isDeleted: true,
      refreshToken: null,
    });

    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Profile deleted successfully. Logged out.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

// review&report
export const addReview = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existing = await Review.findOne({
      courseId,
      parentId: req.user.id,
    });

    if (existing) {
      return res.status(400).json({
        message: "You already reviewed this tutor",
      });
    }

    // create review
    const newReview = await Review.create({
      courseId,
      tutorId: course.tutorId,
      parentId: req.user.id,
      rating,
      review,
    });

    // get all tutor reviews
    const reviews = await Review.find({ tutorId: course.tutorId });

    const totalReviews = reviews.length;

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    // update tutor
    await Tutor.findByIdAndUpdate(course.tutorId, {
      averageRating: avgRating,
      totalReviews: totalReviews,
    });

    res.json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add review" });
  }
};

export const reportTutor = async (req, res) => {
  try {
    const { courseId, reason } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const report = await Report.create({
      courseId,
      tutorId: course.tutorId,
      parentId: req.user.id,
      reason,
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Failed to report tutor" });
  }
};

// students
export const fetchStudent = async (req, res) => {
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
};

export const addStudentByParent = async (req, res) => {
  try {
    const parentId = req.user.id;

    const { name, grade, board, photo } = req.body;

    if (!name || !grade || !board) {
      return res.status(400).json({
        success: false,
        message: "Student name and grade are required",
      });
    }

    const student = await Student.create({
      parentId,
      name,
      grade,
      board,
      photo,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      result: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add student",
    });
  }
};

// course-puchase
export const getSubjectsForStudent = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { studentId } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      parentId,
      status: "active",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found or inactive",
      });
    }

    const classDoc = await Class.findOne({
      classGrade: student.grade,
    });

    if (!classDoc) {
      return res.json({
        success: true,
        result: [],
      });
    }

    const boardSubjects = classDoc.subjectsByBoard?.[student.board];

    if (!boardSubjects) {
      return res.json({
        success: true,
        result: [],
      });
    }

    res.json({
      success: true,
      result: boardSubjects.map((s) => s.name),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
};

export const getTutorsForSubject = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { subject, studentId } = req.query;

    if (!subject || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Subject and studentId are required",
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      parentId,
      status: "active",
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "Invalid or suspended student",
      });
    }

    const tutors = await Tutor.find({
      subjects: subject,
      classes: student.grade,
      syllabus: student.board,
      status: "active",
      isApproved: true,
    }).select(
      "fullName teachingExperience hourlyRate profileImage availability monthlyFee",
    );

    res.json({
      success: true,
      result: tutors,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutors",
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const parentId = req.user.id;

    const { studentId, tutorId, subject, startDate, timeSlot, monthlyFee } =
      req.body;

    if (
      !studentId ||
      !tutorId ||
      !subject ||
      !startDate ||
      !timeSlot ||
      !monthlyFee
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      parentId,
      status: "active",
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "Invalid or suspended student",
      });
    }

    const tutor = await Tutor.findOne({
      _id: tutorId,
      status: "active",
      isApproved: true,
      subjects: { $in: [subject] },
      syllabus: student.board,
    });

    if (!tutor || !tutor.availability.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: "Tutor not available for selected slot",
      });
    }

    const formattedStartDate = new Date(startDate);

    const conflict = await Course.findOne({
      tutorId,
      startDate: formattedStartDate,
      timeSlot,
      courseStatus: "active",
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Time slot already booked",
      });
    }

    const nextPaymentDate = new Date(formattedStartDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    const course = await Course.create({
      parentId,
      studentId,
      tutorId,
      subject,
      classLevel: student.grade,
      startDate: formattedStartDate,
      timeSlot,
      monthlyFee,
      nextPaymentDate,
      paymentStatus: "paid",
      courseStatus: "active",
      createdBy: "parent",
    });

    res.status(201).json({
      success: true,
      message: "Course booked successfully",
      result: course,
    });
  } catch (err) {
    console.error("Create Course Error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to create course",
    });
  }
};

// courses
export const getParentCourses = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { studentId, page = 1, limit = 3 } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const filter = { parentId };

    if (studentId) {
      filter.studentId = studentId;
    }

    const total = await Course.countDocuments(filter);

    let courses = await Course.find(filter)
      .populate("studentId", "name grade")
      .populate("tutorId", "fullName profileImage")
      .sort({ createdAt: -1 });

    const statusPriority = {
      active: 1,
      paused: 2,
      completed: 3,
    };

    courses = courses.sort((a, b) => {
      const priorityA = statusPriority[a.courseStatus] || 4;
      const priorityB = statusPriority[b.courseStatus] || 4;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const paginatedCourses = courses.slice(skip, skip + perPage);

    res.json({
      success: true,
      result: paginatedCourses,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
};
export const updateStudent = async (req, res) => {
  try {
    const { name, grade, board } = req.body;
    const { studentId } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      parentId: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (name !== undefined) student.name = name;
    if (grade !== undefined) student.grade = grade;
    if (board !== undefined) student.board = board;

    await student.save();

    res.json({
      success: true,
      result: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};
export const getParentCourseOverview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const parentId = req.user.id;

    const course = await Course.findOne({
      _id: courseId,
      parentId,
    })
      .populate("tutorId", "fullName profileImage")
      .populate("studentId", "name");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const sessions = await Session.find({ courseId }).sort({ sessionDate: 1 });

    const parentReview = await Review.findOne({
      courseId,
      parentId,
    }).select("rating review createdAt");

    res.json({
      success: true,
      result: {
        course,
        sessions,
        parentReview,
      },
    });
  } catch (error) {
    console.error("COURSE OVERVIEW ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch course overview",
    });
  }
};

export const getParentSessions = async (req, res) => {
  try {
    const parentId = req.user.id;

    const status = req.query.status;
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const skip = (page - 1) * limit;

    const parentCourses = await Course.find({ parentId }).select(
      "_id studentId subject timeSlot",
    );

    const courseIds = parentCourses.map((c) => c._id);

    const query = { courseId: { $in: courseIds } };

    if (status) query.status = status;

    const sessions = await Session.find(query)

      .populate({
        path: "courseId",
        select: "subject timeSlot studentId",
        populate: {
          path: "studentId",
          select: "name",
        },
      })

      .populate("tutorId", "fullName profileImage")

      .sort({ sessionDate: 1 })

      .skip(skip)

      .limit(limit);

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      sessions,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch sessions",
    });
  }
};

export const streamParentSessions = (req, res) => {
  console.log("jjjj");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  res.flushHeaders();

  console.log("✅ SSE CONNECTED");

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 20000);

  const handler = (data) => {
    console.log("🔥 EVENT RECEIVED IN SSE");
    send({ type: "SESSION_STARTED", ...data });
  };

  eventBus.on("sessionStarted", handler);

  req.on("close", () => {
    clearInterval(heartbeat);
    eventBus.off("sessionStarted", handler);
  });
};
