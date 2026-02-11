import Course from "../../models/Course.js";
import Parent from "../../models/Parent.js";
import Student from "../../models/Student.js";
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
      search,
      grade,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // 🔹 Grade filter
    if (grade) {
      query.grade = grade;
    }

    // 🔹 Status filter
    if (status) {
      query.status = status;
    }

    // 🔹 Search: student OR parent
  if (search) {
  query.name = { $regex: search, $options: "i" };
}

    const students = await Student.find(query)
      .populate("parentId", "fullName email mobile status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Student.countDocuments(query);

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



export const getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("parentId", "fullName email mobile status");

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

    const allowedStatuses = ["active", "suspended"];

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

    
    if (student.status === status) {
      return res.status(400).json({
        success: false,
        message: `Student already ${status}`,
      });
    }

    student.status = status;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student ${status} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update student status",
    });
  }
};