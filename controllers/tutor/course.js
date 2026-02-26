import Course from "../../models/Course.js";
import Session from "../../models/Session.js";

export const getNewCoursesForTutor = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const courses = await Course.find({
      tutorId,
      paymentStatus: "paid",
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

    const { status } = req.query;

    const filter = {
      tutorId,
      paymentStatus: "paid",
      "learningPlan.isPublished": true,
      courseStatus: { $in: ["active", "paused", "completed"] },
    };

    if (status && status !== "all") {
      filter.courseStatus = status;
    }

    const courses = await Course.find(filter)
      .populate("studentId", "name grade")
      .populate("parentId", "fullName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      result: courses,
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
    console.log(sessions);

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
      strengths = [],
      improvements = [],
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

    if (Array.isArray(sessions)) {
      await Session.deleteMany({ courseId });

      if (sessions.length > 0) {
        const sessionDocs = sessions.map((s) => ({
          courseId,
          tutorId,
          title: s.title,
          description: s.description,
          sessionDate: s.sessionDate,
          status: "scheduled",
        }));

        await Session.insertMany(sessionDocs);
      }
    }

    const updatedCourse = await Course.findById(courseId)
      .populate("studentId", "name grade")
      .populate("parentId", "name");

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
    console.error(err);
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
