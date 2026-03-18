import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Course from "../models/course.js";
import Payment from "../models/payment.js";
import Student from "../models/student.js";
import TutorWallet from "../models/tutorWallet.js";
import Tutor from "../models/tutor.js";
import PayoutRequest from "../models/payoutRequest.js";
import axios from "axios";
import { getCommission } from "../utils/getCommission.js";

// parent-payments
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error("ORDER ERROR:", error);

    res.status(500).json({
      message: "Order creation failed",
    });
  }
};

export const verifyFirstPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseData,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment fields",
      });
    }

    const existingPayment = await Payment.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already processed",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    const student = await Student.findById(courseData.studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Calculate next payment from course start date
    const startDate = new Date(courseData.startDate);

    const nextMonth = new Date(startDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const course = await Course.create({
      parentId: req.user.id,
      studentId: courseData.studentId,
      tutorId: courseData.tutorId,
      subject: courseData.subject,
      classLevel: student.grade,
      startDate: courseData.startDate,
      timeSlot: courseData.timeSlot,
      monthlyFee: courseData.monthlyFee,
      nextPaymentDate: nextMonth,
      paymentStatus: "paid",
      courseStatus: "active",
      createdBy: "parent",
    });

    await Tutor.updateOne(
      {
        _id: courseData.tutorId,
        "availability.time": courseData.timeSlot,
      },
      {
        $set: { "availability.$.status": "booked" },
      },
    );

    // const adminCommission = courseData.monthlyFee * 0.2;
    // const tutorEarning = courseData.monthlyFee - adminCommission;
    const adminPercent = await getCommission();

    const adminCommission = (courseData.monthlyFee * adminPercent) / 100;

    const tutorEarning = courseData.monthlyFee - adminCommission;

    await Payment.create({
      courseId: course._id,
      parentId: req.user.id,
      tutorId: courseData.tutorId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      billingMonth: new Date(),
      amount: courseData.monthlyFee,
      status: "paid",
      adminCommission,
      tutorEarning,
      dueDate: nextMonth,
      earningReleased: false,
    });

    res.json({
      success: true,
      message: "Payment verified and course created",
      course,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};

export const verifyNextPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;

    const existingPayment = await Payment.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already processed",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const now = new Date();

    const baseDate =
      now > course.nextPaymentDate ? now : course.nextPaymentDate;

    const nextMonth = new Date(baseDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // const adminCommission = course.monthlyFee * 0.2;
    // const tutorEarning = course.monthlyFee - adminCommission;
    const adminPercent = await getCommission();

    const adminCommission = (courseData.monthlyFee * adminPercent) / 100;

    const tutorEarning = courseData.monthlyFee - adminCommission;

    await Payment.create({
      courseId,
      parentId: req.user.id,
      tutorId: course.tutorId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      billingMonth: new Date(),
      amount: course.monthlyFee,
      status: "paid",
      adminCommission,
      tutorEarning,
      dueDate: nextMonth,
      earningReleased: false,
    });

    course.nextPaymentDate = nextMonth;
    course.paymentStatus = "paid";
    course.courseStatus = "active";

    await course.save();

    res.json({
      success: true,
      message: "Next payment verified",
    });
  } catch (error) {
    console.error("NEXT PAYMENT ERROR:", error);

    res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};

export const getParentPayments = async (req, res) => {
  try {
    const parentId = req.user.id;

    const { studentId, page = 1, search, status, month } = req.query;

    const limit = 5;
    const skip = (page - 1) * limit;

    let filter = { parentId };

    if (studentId) {
      const courses = await Course.find({
        parentId,
        studentId,
      }).select("_id");

      const courseIds = courses.map((c) => c._id);
      filter.courseId = { $in: courseIds };
    }

    if (status) {
      filter.status = status;
    }

    if (month) {
      const start = new Date(month);
      const end = new Date(month);

      end.setMonth(end.getMonth() + 1);

      filter.billingMonth = {
        $gte: start,
        $lt: end,
      };
    }

    let payments = await Payment.find(filter)
      .populate({
        path: "courseId",
        select: "subject tutorId studentId",
        populate: {
          path: "tutorId",
          select: "fullName profileImage",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (search) {
      const term = search.toLowerCase();

      payments = payments.filter(
        (p) =>
          p.courseId?.subject?.toLowerCase().includes(term) ||
          p.courseId?.tutorId?.fullName?.toLowerCase().includes(term),
      );
    }

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
};

//admin-Paymentspage
export const getAdminRevenueStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$adminCommission" },
          totalTutorEarnings: { $sum: "$tutorEarning" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const payoutAgg = await PayoutRequest.aggregate([
      {
        $match: { status: "pending" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const result = stats[0] || {
      totalRevenue: 0,
      totalTutorEarnings: 0,
      totalTransactions: 0,
    };

    res.json({
      success: true,
      result: {
        totalRevenue: result.totalRevenue,
        totalTutorEarnings: result.totalTutorEarnings,
        pendingPayout: payoutAgg[0]?.total || 0,
        totalTransactions: result.totalTransactions,
        platformProfit: result.totalRevenue,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch stats",
    });
  }
};

export const getTutorPayoutRequests = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const status = req.query.status;

    const skip = (page - 1) * limit;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const requests = await PayoutRequest.find(filter)
      .populate("tutorId", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PayoutRequest.countDocuments(filter);

    res.json({
      success: true,
      result: requests,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch payout requests",
    });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },

      { $unwind: "$course" },

      {
        $lookup: {
          from: "students",
          localField: "course.studentId",
          foreignField: "_id",
          as: "student",
        },
      },

      { $unwind: "$student" },

      {
        $lookup: {
          from: "parents",
          localField: "course.parentId",
          foreignField: "_id",
          as: "parent",
        },
      },

      { $unwind: "$parent" },

      {
        $project: {
          amount: 1,
          tutorEarning: 1,
          adminCommission: 1,
          createdAt: 1,

          subject: "$course.subject",

          studentName: "$student.name",

          parentName: "$parent.fullName",
        },
      },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          payments: [{ $skip: skip }, { $limit: limit }],

          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Payment.aggregate(pipeline);

    const payments = result[0].payments;

    const total = result[0].totalCount[0]?.count || 0;

    res.json({
      success: true,

      result: payments,

      currentPage: page,

      totalPages: Math.ceil(total / limit),

      total,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch admin payments",
    });
  }
};
export const saveTutorBankDetails = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const { accountHolderName, accountNumber, ifsc, bankName, upiId } =
      req.body;

    if (!accountHolderName || !accountNumber || !ifsc) {
      return res.status(400).json({
        message: "All bank fields are required",
      });
    }

    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    const contact = await axios.post(
      "https://api.razorpay.com/v1/contacts",
      {
        name: tutor.fullName,
        email: tutor.email,
        contact: tutor.mobile,
        type: "vendor",
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_SECRET,
        },
      },
    );

    const fundAccount = await axios.post(
      "https://api.razorpay.com/v1/fund_accounts",
      {
        contact_id: contact.data.id,
        account_type: "bank_account",
        bank_account: {
          name: accountHolderName,
          ifsc: ifsc,
          account_number: accountNumber,
        },
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_SECRET,
        },
      },
    );

    tutor.bankDetails = {
      accountHolderName,
      accountNumber,
      ifsc,
      bankName,
      upiId,

      razorpayContactId: contact.data.id,
      razorpayFundAccountId: fundAccount.data.id,

      isVerified: true,
    };

    await tutor.save();

    res.json({
      success: true,
      message: "Bank details verified successfully",
    });
  } catch (err) {
    console.error("BANK ERROR:", err.response?.data || err);

    res.status(500).json({
      message: "Failed to save bank details",
    });
  }
};

export const createRazorpayFundAccount = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const tutor = await Tutor.findById(tutorId);

    const contact = await axios.post(
      "https://api.razorpay.com/v1/contacts",
      {
        name: tutor.fullName,
        email: tutor.email,
        contact: tutor.mobile,
        type: "vendor",
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_SECRET,
        },
      },
    );

    const fundAccount = await axios.post(
      "https://api.razorpay.com/v1/fund_accounts",
      {
        contact_id: contact.data.id,
        account_type: "bank_account",
        bank_account: {
          name: tutor.bankDetails.accountHolderName,
          ifsc: tutor.bankDetails.ifsc,
          account_number: tutor.bankDetails.accountNumber,
        },
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_SECRET,
        },
      },
    );

    tutor.bankDetails.razorpayContactId = contact.data.id;
    tutor.bankDetails.razorpayFundAccountId = fundAccount.data.id;

    await tutor.save();

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Fund account creation failed",
    });
  }
};
export const markPayoutPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const payout = await PayoutRequest.findById(id).populate("tutorId");

    if (!payout) {
      return res.status(404).json({
        message: "Payout request not found",
      });
    }

    if (payout.status === "paid") {
      return res.status(400).json({
        message: "Payout already completed",
      });
    }

    const tutor = payout.tutorId;

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    payout.status = "paid";
    payout.razorpayPayoutId = "dev_payout_" + Date.now();

    await payout.save();

    const wallet = await TutorWallet.findOne({
      tutorId: tutor._id,
    });

    if (wallet) {
      wallet.walletBalance -= payout.amount;
      wallet.totalWithdrawn += payout.amount;

      await wallet.save();
    }

    res.json({
      success: true,
      message: "Payout completed (dev mode)",
      payout,
    });
  } catch (err) {
    console.error("PAYOUT ERROR:", err);

    res.status(500).json({
      message: "Failed to process payout",
    });
  }
};

export const getTutorBankDetails = async (req, res) => {
  const tutor = await Tutor.findById(req.user.id).select("bankDetails");

  res.json({
    success: true,
    result: tutor.bankDetails,
  });
};
