import mongoose from "mongoose";
import Course from "../../models/Course.js";
import TutorReview from "../../models/TutorReview.js";
import Tutor from "../../models/Tutor.js";


export const getMyStudents = async (req, res) => {
  try {
    const tutorId = new mongoose.Types.ObjectId(req.user.id);

    const {
      page = 1,
      limit = 5,
      search = "",
      grade,
      status,
    } = req.query;

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
          parentName: { $first: "$parent.name" },
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

    const {
      page = 1,
      limit = 3,
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const query = {
      tutorId: new mongoose.Types.ObjectId(tutorId),
      studentId: new mongoose.Types.ObjectId(studentId),
    };

    const courses = await Course.find(query)
      .select(
        "subject classLevel timeSlot monthlyFee courseStatus paymentStatus nextPaymentDate"
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


const updateTutorRating = async (tutorId) => {
  const stats = await TutorReview.aggregate([
    {
      $match: {
        tutorId: new mongoose.Types.ObjectId(tutorId),
        isVisible: true,
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        total: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.avgRating || 0;
  const totalReviews = stats[0]?.total || 0;

  await Tutor.findByIdAndUpdate(tutorId, {
    averageRating,
    totalReviews,
  });
};

/* ============================= */
/* 1️⃣ Parent Adds Review        */
/* ============================= */
export const addTutorReview = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { tutorId, rating, review } = req.body;

    const newReview = await TutorReview.create({
      tutorId,
      parentId,
      rating,
      review,
    });

    await updateTutorRating(tutorId);

    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

/* ============================= */
/* 2️⃣ Tutor View Reviews        */
/* ============================= */
export const getTutorReviews = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const page = Number(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const reviews = await TutorReview.find({
      tutorId,
      isVisible: true,
    })
      .populate("parentId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TutorReview.countDocuments({
      tutorId,
      isVisible: true,
    });

    res.status(200).json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ============================= */
/* 3️⃣ Tutor Reply to Review     */
/* ============================= */
export const replyToReview = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({
        message: "Reply cannot be empty",
      });
    }

    const reviewDoc = await TutorReview.findOne({
      _id: reviewId,
      tutorId,
    });

    if (!reviewDoc) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    reviewDoc.reply = reply;
    reviewDoc.repliedAt = new Date();

    await reviewDoc.save();

    res.status(200).json({
      message: "Reply added successfully",
      review: reviewDoc,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ============================= */
/* 4️⃣ Parent Delete Own Review  */
/* ============================= */
export const deleteTutorReview = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { reviewId } = req.params;

    const reviewDoc = await TutorReview.findOneAndDelete({
      _id: reviewId,
      parentId,
    });

    if (!reviewDoc) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await updateTutorRating(reviewDoc.tutorId);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};