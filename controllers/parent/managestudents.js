import Student from "../../models/Student.js";
import Course from "../../models/Course.js";
import Tutor from "../../models/Tutor.js";
import Class from "../../models/Class.js";
import Session from "../../models/Session.js";
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
    console.log(boardSubjects);
    if (!boardSubjects) {
      return res.json({
        success: true,
        result: [],
      });
    }
    console.log(parentId);
    console.log(boardSubjects);
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
      "fullName teachingExperience hourlyRate profileImage availability",
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

export const getParentCourses = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { studentId } = req.query;

    const filter = { parentId };

    if (studentId) {
      filter.studentId = studentId;
    }

    const courses = await Course.find(filter)
      .populate("studentId", "name grade")
      .populate("tutorId", "fullName profileImage")
      .sort({ createdAt: -1 });

    res.json({ success: true, result: courses });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { name, grade, board } = req.body;
    const { studentId } = req.params;
    console.log(grade);

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

    res.json({
      success: true,
      result: {
        course,
        sessions,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course overview",
    });
  }
};
