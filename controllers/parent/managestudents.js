import Student from "../../models/Student";

export const addStudentByParent = async (req, res) => {
  try {
    const parentId = req.user.id; 

    const {
      name,
      grade,
      medium,
      photo,
    } = req.body;

   
    if (!name || !grade) {
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