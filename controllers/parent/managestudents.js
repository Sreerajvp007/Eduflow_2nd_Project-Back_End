import Student from "../../models/Student.js";
import Course from "../../models/Course.js";
import Tutor from "../../models/Tutor.js";
import Class from "../../models/Class.js";
export const addStudentByParent = async (req, res) => {
  try {
    // const parentId = req.user.id; this is to follow not in body

    const {
      name,
      grade,
      board,
      photo,
      parentId    
    } = req.body;

   
    if (!name || !grade || ! board) {
      return res.status(400).json({
        success: false,
        message: "Student name and grade are required",
      });
    }

    const student = await Student.create({
      parentId,
      name,
      grade,
      medium,
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
    // const parentId = req.user.id;
    const {parentId} =req.body;
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

    const boardSubjects =
  classDoc.subjectsByBoard?.[student.board];
  console.log(boardSubjects)
    if (!boardSubjects) {
      return res.json({
        success: true,
        result: [],
      });
    }

    res.json({
      success: true,
      result: boardSubjects.map(s => s.name),
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
    // const parentId = req.user.id;
      const {parentId} =req.body;
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
      classes: student.grade,        // ✅ DIRECT MATCH
      syllabus: student.board,      // ✅ BOARD MATCH
      status: "active",
      isApproved: true,
    }).select(
      "fullName teachingExperience hourlyRate profileImage availability"
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
    // const parentId = req.user.id;

    const {
      studentId,
      tutorId,
      subject,
      startDate,
      timeSlot,
      monthlyFee,
      parentId
    } = req.body;
 
    // Validate student
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

    // Validate tutor
    const tutor = await Tutor.findOne({
      _id: tutorId,
      status: "active",
      isApproved: true,
      subjects: subject,
      syllabus: student.board
    });

    if (!tutor || !tutor.availability.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: "Tutor not available for selected slot",
      });
    }
   
    // Prevent double booking
    const conflict = await Course.findOne({
      tutorId,
      startDate: new Date(startDate),
      timeSlot,
      courseStatus: "active",
    });
  
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Time slot already booked",
      });
    }
  
    const course = await Course.create({
      parentId,
      studentId,
      tutorId,
      subject,
      classLevel: student.grade, 
      startDate,
      timeSlot,
      monthlyFee,
      paymentStatus: "paid",
    });

    res.status(201).json({
      success: true,
      message: "Course booked successfully",
      result: course,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};
export const getParentCourses = async (req, res) => {
  try {
    // const parentId = req.user.id;
    const {parentId} =req.body
  
    const courses = await Course.find({ parentId })
      .populate("studentId", "name grade")
      .populate("tutorId", "fullName profileImage");

    res.json({ success: true, result: courses });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};
