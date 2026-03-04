import Tutor from "../../models/Tutor.js";
import Course from "../../models/Course.js";
import Session from "../../models/Session.js";

export const getSchedule = async (req, res) => {
  try {
    const tutorId = req.user.id;
   
    const tutor = await Tutor.findById(tutorId)
      .select("availability");

    const courses = await Course.find({
      tutorId,
      courseStatus: "active",
    }).populate("studentId", "name");
  

    const sessions = await Session.find({ tutorId });

    res.json({
      availability: tutor.availability,
      courses,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schedule" });
  }
};

export const createSession = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const {
      courseId,
      sessionDate,
      startTime,
      endTime,
      title,
      description,
    } = req.body;

    const course = await Course.findOne({
      _id: courseId,
      tutorId,
      courseStatus: "active",
    });

    if (!course)
      return res.status(400).json({ message: "Invalid course" });

    if (course.timeSlot !== startTime)
      return res
        .status(400)
        .json({ message: "Slot belongs to another student" });

    const session = await Session.create({
      tutorId,
      courseId,
      studentId: course.studentId,
      sessionDate,
      startTime,
      endTime,
      title,
      description,
    });

    res.status(201).json(session);
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ message: "Session already exists" });

    res.status(500).json({ message: "Failed to create session" });
  }
};