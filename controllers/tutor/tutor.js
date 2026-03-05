import mongoose from "mongoose";
import Course from "../../models/Course.js";

import Tutor from "../../models/Tutor.js";
import Review from "../../models/Review.js";
import TutorWallet from "../../models/TutorWallet.js";
import Payment from "../../models/Payment.js";
import PayoutRequest from "../../models/PayoutRequest.js";


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


// const updateTutorRating = async (tutorId) => {
//   const stats = await TutorReview.aggregate([
//     {
//       $match: {
//         tutorId: new mongoose.Types.ObjectId(tutorId),
//         isVisible: true,
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         avgRating: { $avg: "$rating" },
//         total: { $sum: 1 },
//       },
//     },
//   ]);

//   const averageRating = stats[0]?.avgRating || 0;
//   const totalReviews = stats[0]?.total || 0;

//   await Tutor.findByIdAndUpdate(tutorId, {
//     averageRating,
//     totalReviews,
//   });
// };

// /* ============================= */
// /* 1️⃣ Parent Adds Review        */
// /* ============================= */
// export const addTutorReview = async (req, res) => {
//   try {
//     const parentId = req.user.id;
//     const { tutorId, rating, review } = req.body;

//     const newReview = await TutorReview.create({
//       tutorId,
//       parentId,
//       rating,
//       review,
//     });

//     await updateTutorRating(tutorId);

//     res.status(201).json({
//       message: "Review added successfully",
//       review: newReview,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// };

// /* ============================= */
// /* 2️⃣ Tutor View Reviews        */
// /* ============================= */
// export const getTutorReviews = async (req, res) => {
//   try {
//     const tutorId = req.user.id;

//     const page = Number(req.query.page) || 1;
//     const limit = 5;
//     const skip = (page - 1) * limit;

//     const reviews = await TutorReview.find({
//       tutorId,
//       isVisible: true,
//     })
//       .populate("parentId", "name")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await TutorReview.countDocuments({
//       tutorId,
//       isVisible: true,
//     });

//     res.status(200).json({
//       reviews,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// /* ============================= */
// /* 3️⃣ Tutor Reply to Review     */
// /* ============================= */
// export const replyToReview = async (req, res) => {
//   try {
//     const tutorId = req.user.id;
//     const { reviewId } = req.params;
//     const { reply } = req.body;

//     if (!reply || reply.trim() === "") {
//       return res.status(400).json({
//         message: "Reply cannot be empty",
//       });
//     }

//     const reviewDoc = await TutorReview.findOne({
//       _id: reviewId,
//       tutorId,
//     });

//     if (!reviewDoc) {
//       return res.status(404).json({
//         message: "Review not found",
//       });
//     }

//     reviewDoc.reply = reply;
//     reviewDoc.repliedAt = new Date();

//     await reviewDoc.save();

//     res.status(200).json({
//       message: "Reply added successfully",
//       review: reviewDoc,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// /* ============================= */
// /* 4️⃣ Parent Delete Own Review  */
// /* ============================= */
// export const deleteTutorReview = async (req, res) => {
//   try {
//     const parentId = req.user.id;
//     const { reviewId } = req.params;

//     const reviewDoc = await TutorReview.findOneAndDelete({
//       _id: reviewId,
//       parentId,
//     });

//     if (!reviewDoc) {
//       return res.status(404).json({
//         message: "Review not found",
//       });
//     }

//     await updateTutorRating(reviewDoc.tutorId);

//     res.status(200).json({
//       message: "Review deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

export const getTutorReviews = async (req, res) => {
  try {

    const tutorId = req.user.id;

    const {
      page = 1,
      limit = 6,
      search = "",
      sort = "latest"
    } = req.query;

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
          select: "name"
        }
      });

    // Sorting
    if (sort === "rating") {
      query = query.sort({ rating: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    let reviews = await query.skip(skip).limit(perPage);

    // Search filter
    if (search) {

      const searchLower = search.toLowerCase();

      reviews = reviews.filter((r) => {

        const parentName =
          r.parentId?.fullName?.toLowerCase() || "";

        const subject =
          r.courseId?.subject?.toLowerCase() || "";

        return (
          parentName.includes(searchLower) ||
          subject.includes(searchLower)
        );

      });
    }

    const totalReviews = await Review.countDocuments({ tutorId });

    const avgRatingAgg = await Review.aggregate([
  {
    $match: {
      tutorId: new mongoose.Types.ObjectId(tutorId)
    }
  },
  {
    $group: {
      _id: null,
      avg: { $avg: "$rating" }
    }
  }
]);

const avgRating = avgRatingAgg.length
  ? avgRatingAgg[0].avg
  : 0;

    res.json({
      success: true,
      result: {
        reviews,
        avgRating: Number(avgRating.toFixed(1)),
        totalReviews,
        totalPages: Math.ceil(totalReviews / perPage),
        currentPage
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });

  }
};

// 


// export const getTutorEarnings = async (req, res) => {
// try {

// const tutorId = req.user.id;

// const wallet = await TutorWallet.findOne({ tutorId });

// const pendingPayout = await PayoutRequest.aggregate([
// {
// $match:{
// tutorId: new mongoose.Types.ObjectId(tutorId),
// status:"pending"
// }
// },
// {
// $group:{
// _id:null,
// total:{$sum:"$amount"}
// }
// }
// ]);

// const pendingAmount = pendingPayout[0]?.total || 0;

// const now = new Date();
// const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

// const monthlyIncomeAgg = await Payment.aggregate([
// {
// $lookup:{
// from:"courses",
// localField:"courseId",
// foreignField:"_id",
// as:"course"
// }
// },
// {$unwind:"$course"},
// {
// $match:{
// "course.tutorId": new mongoose.Types.ObjectId(tutorId),
// createdAt:{ $gte:startOfMonth }
// }
// },
// {
// $group:{
// _id:null,
// total:{$sum:"$tutorEarning"}
// }
// }
// ]);

// const monthlyIncome = monthlyIncomeAgg[0]?.total || 0;

// res.json({
// success:true,
// result:{
// totalEarnings: wallet?.totalEarnings || 0,
// walletBalance: wallet?.walletBalance || 0,
// totalWithdrawn: wallet?.totalWithdrawn || 0,
// pendingAmount,
// monthlyIncome
// }
// });

// } catch (err) {

// console.error(err);

// res.status(500).json({
// message:"Failed to fetch earnings"
// });

// }
// };



export const getTutorEarnings = async (req, res) => {
  try {

    const tutorId = new mongoose.Types.ObjectId(req.user.id);

    const wallet = await TutorWallet.findOne({ tutorId });

    /* TOTAL EARNINGS */

    const totalAgg = await Payment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },

      {
        $match: {
          "course.tutorId": tutorId
        }
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$tutorEarning" }
        }
      }
    ]);

    const totalEarnings = totalAgg[0]?.total || 0;


    /* MONTHLY INCOME */

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyAgg = await Payment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course"
        }
      },

      { $unwind: "$course" },

      {
        $match: {
          "course.tutorId": tutorId,
          createdAt: { $gte: startOfMonth }
        }
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$tutorEarning" }
        }
      }
    ]);

    const monthlyIncome = monthlyAgg[0]?.total || 0;


    /* PENDING PAYOUT */

    const pendingAgg = await PayoutRequest.aggregate([
      {
        $match: {
          tutorId,
          status: "pending"
        }
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const pendingAmount = pendingAgg[0]?.total || 0;


    res.json({
      success: true,
      result: {
        totalEarnings,
        monthlyIncome,
        walletBalance: wallet?.walletBalance || 0,
        totalWithdrawn: wallet?.totalWithdrawn || 0,
        pendingAmount
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch earnings"
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
          as: "course"
        }
      },
      { $unwind: "$course" },

      {
        $match: {
          "course.tutorId": new mongoose.Types.ObjectId(tutorId)
        }
      },

      /* STUDENT */

      {
        $lookup: {
          from: "students",
          localField: "course.studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },

      /* PARENT (from student.parentId) */

      {
        $lookup: {
          from: "parents",
          localField: "student.parentId",
          foreignField: "_id",
          as: "parent"
        }
      },
      { $unwind: "$parent" },

      {
        $project: {
          tutorEarning: 1,
          createdAt: 1,

          courseId: "$course._id",
          subject: "$course.subject",

          studentName: "$student.name",

          parentName: "$parent.fullName"   // THIS WILL FIX YOUR UI
        }
      },

      { $sort: { createdAt: -1 } },

      { $skip: skip },

      { $limit: limit }

    ]);

    const totalAgg = await Payment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $match: {
          "course.tutorId": new mongoose.Types.ObjectId(tutorId)
        }
      },
      { $count: "total" }
    ]);

    const total = totalAgg[0]?.total || 0;

    res.json({
      success: true,
      result: payments,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch history"
    });

  }
};


export const requestPayout = async (req,res)=>{
try{

const tutorId = req.user.id;
const { amount, method, notes } = req.body;

if(amount <= 0){
return res.status(400).json({
message:"Invalid payout amount"
});
}

const wallet = await TutorWallet.findOne({ tutorId });

if(!wallet || wallet.walletBalance < amount){
return res.status(400).json({
message:"Insufficient wallet balance"
});
}

const payout = await PayoutRequest.create({
tutorId,
amount,
method,
notes
});

res.json({
success:true,
message:"Payout request submitted",
payout
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to request payout"
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