import Tutor from "../../models/Tutor.js";
import Student from "../../models/Student.js";
import Course from "../../models/Course.js";
import Review  from "../../models/Review.js";
import Report from "../../models/Report.js";
import Payment from "../../models/Payment.js";
import PayoutRequest from "../../models/PayoutRequest.js";
import TutorWallet from "../../models/TutorWallet.js"
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const totalTutors = await Tutor.countDocuments({
      isApproved: true,
    });

    const pendingTutors = await Tutor.countDocuments({
      onboardingStatus: "submitted",
      isApproved: false,
    });

    const totalPurchases = await Course.countDocuments();

    const activeCourses = await Course.countDocuments({
      courseStatus: "active",
    });

    res.status(200).json({
      success: true,
      result: {
        totalStudents,
        totalTutors,
        pendingTutors,
        totalPurchases,
        activeCourses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};


export const getAdminReports = async (req, res) => {

  try {

    const {
      page = 1,
      limit = 10,
      search = ""
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    let query = Report.find()

      .populate("parentId", "fullName")

      .populate({
        path: "courseId",
        select: "subject"
      })

      .populate("tutorId", "fullName")

      .sort({ createdAt: -1 });

    let reports = await query.skip(skip).limit(perPage);

    if (search) {

      const s = search.toLowerCase();

      reports = reports.filter((r) => {

        const parent = r.parentId?.fullName?.toLowerCase() || "";
        const subject = r.courseId?.subject?.toLowerCase() || "";

        return parent.includes(s) || subject.includes(s);

      });

    }

    const totalReports = await Report.countDocuments();

    res.json({
      success: true,
      result: {
        reports,
        totalReports,
        totalPages: Math.ceil(totalReports / perPage),
        currentPage
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });

  }
};
export const getAdminReviews = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 7,
      search = "",
      sort = "latest"
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    let query = Review.find()

      .populate("parentId", "fullName")

      .populate("tutorId", "fullName")

      .populate({
        path: "courseId",
        select: "subject studentId",
        populate: {
          path: "studentId",
          select: "name"
        }
      });

    // SORT
    if (sort === "highest") {
      query = query.sort({ rating: -1 });
    } 
    else if (sort === "lowest") {
      query = query.sort({ rating: 1 });
    } 
    else {
      query = query.sort({ createdAt: -1 });
    }

    let reviews = await query.skip(skip).limit(perPage);

    // SEARCH
    if (search) {

      const s = search.toLowerCase();

      reviews = reviews.filter((r) => {

        const parent = r.parentId?.fullName?.toLowerCase() || "";
        const subject = r.courseId?.subject?.toLowerCase() || "";
        const student = r.courseId?.studentId?.name?.toLowerCase() || "";

        return (
          parent.includes(s) ||
          subject.includes(s) ||
          student.includes(s)
        );

      });

    }

    /*
    ======================================
    ADD TUTOR AVG RATING
    ======================================
    */

    const tutorRatings = await Review.aggregate([
      {
        $group: {
          _id: "$tutorId",
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    const ratingMap = {};

    tutorRatings.forEach((t) => {
      ratingMap[t._id.toString()] = Number(t.avgRating.toFixed(1));
    });

    reviews = reviews.map((r) => {

      const tutorId = r.tutorId?._id?.toString();

      return {
        ...r.toObject(),
        tutorId: {
          ...r.tutorId.toObject(),
          avgRating: ratingMap[tutorId] || 0
        }
      };

    });

    const totalReviews = await Review.countDocuments();

    res.json({
      success: true,
      result: {
        reviews,
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
export const getAdminRevenueStats = async (req,res)=>{
try{

const stats = await Payment.aggregate([
{
$group:{
_id:null,
totalRevenue:{ $sum:"$adminCommission" },
totalTutorEarnings:{ $sum:"$tutorEarning" },
totalTransactions:{ $sum:1 }
}
}
]);

const payoutAgg = await PayoutRequest.aggregate([
{
$match:{ status:"pending" }
},
{
$group:{
_id:null,
total:{ $sum:"$amount" }
}
}
]);

const result = stats[0] || {
totalRevenue:0,
totalTutorEarnings:0,
totalTransactions:0
};

res.json({
success:true,
result:{
totalRevenue: result.totalRevenue,
totalTutorEarnings: result.totalTutorEarnings,
pendingPayout: payoutAgg[0]?.total || 0,
totalTransactions: result.totalTransactions,
platformProfit: result.totalRevenue
}
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch stats"
});

}
};




export const getTutorPayoutRequests = async (req,res)=>{
try{

const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 5;
const status = req.query.status;

const skip = (page-1) * limit;

const filter = {};

if(status && status !== "all"){
filter.status = status;
}

const requests = await PayoutRequest.find(filter)
.populate("tutorId","fullName email")
.sort({createdAt:-1})
.skip(skip)
.limit(limit);

const total = await PayoutRequest.countDocuments(filter);

res.json({
success:true,
result:requests,
currentPage:page,
totalPages:Math.ceil(total/limit),
total
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch payout requests"
});

}
};


export const markPayoutPaid = async (req,res)=>{
try{

const { id } = req.params;

const payout = await PayoutRequest.findById(id);

if(!payout){
return res.status(404).json({
message:"Request not found"
});
}

if(payout.status === "paid"){
return res.status(400).json({
message:"Already paid"
});
}

payout.status = "paid";

await payout.save();

/* update tutor wallet */

const wallet = await TutorWallet.findOne({
tutorId:payout.tutorId
});

if(wallet){

wallet.walletBalance -= payout.amount;
wallet.totalWithdrawn += payout.amount;

await wallet.save();

}

res.json({
success:true,
message:"Payout marked as paid"
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to update payout"
});

}
};


export const getAdminPayments = async (req,res)=>{

try{

const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 5;

const skip = (page-1) * limit;

/*
-------------------------------------
MAIN DATA PIPELINE
-------------------------------------
*/

const pipeline = [

{
$lookup:{
from:"courses",
localField:"courseId",
foreignField:"_id",
as:"course"
}
},

{$unwind:"$course"},

{
$lookup:{
from:"students",
localField:"course.studentId",
foreignField:"_id",
as:"student"
}
},

{$unwind:"$student"},

{
$lookup:{
from:"parents",
localField:"course.parentId",
foreignField:"_id",
as:"parent"
}
},

{$unwind:"$parent"},

{
$project:{
amount:1,
tutorEarning:1,
adminCommission:1,
createdAt:1,

subject:"$course.subject",

studentName:"$student.name",

parentName:"$parent.fullName"
}
},

{$sort:{createdAt:-1}},

{
$facet:{

payments:[
{$skip:skip},
{$limit:limit}
],

totalCount:[
{$count:"count"}
]

}

}

];


/*
-------------------------------------
EXECUTE PIPELINE
-------------------------------------
*/

const result = await Payment.aggregate(pipeline);

const payments = result[0].payments;

const total = result[0].totalCount[0]?.count || 0;

res.json({

success:true,

result:payments,

currentPage:page,

totalPages:Math.ceil(total/limit),

total

});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch admin payments"
});

}

};
