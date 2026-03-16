import Class from "../models/Class.js";

export const createClass = async (req, res) => {
  try {
    const { classGrade } = req.body;

    if (!classGrade) {
      return res.status(400).json({
        success: false,
        message: "Class grade required",
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

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ classGrade: 1 });

    res.json({
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

    res.json({
      success: true,
      message: "Subjects updated",
      result: classDoc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update subjects",
    });
  }
};

export const deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Class deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
