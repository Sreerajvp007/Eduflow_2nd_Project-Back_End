import razorpay from "../../config/razorpay.js";
import crypto from "crypto";
import Course from "../../models/Course.js";
import Payment from "../../models/payment.js";
import Student from "../../models/Student.js";
import TutorWallet from "../../models/TutorWallet.js";


// =============================
// CREATE RAZORPAY ORDER
// =============================
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
      message: "Order creation failed"
    });

  }
};



// =============================
// VERIFY FIRST PAYMENT
// =============================
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
        message: "Missing payment fields"
      });

    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {

      return res.status(400).json({
        message: "Payment verification failed"
      });

    }

    const student = await Student.findById(courseData.studentId);

    if (!student) {

      return res.status(404).json({
        message: "Student not found"
      });

    }


    // DEVELOPMENT BILLING (5 MINUTES)
    const nextMonth = new Date();
    nextMonth.setMinutes(nextMonth.getMinutes() + 5);


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


    const adminCommission = courseData.monthlyFee * 0.2;
    const tutorEarning = courseData.monthlyFee - adminCommission;


    await Payment.create({

      courseId: course._id,
      parentId: req.user.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      billingMonth: new Date(),
      amount: courseData.monthlyFee,
      status: "paid",
      adminCommission,
      tutorEarning,
      dueDate: nextMonth,

    });


    // 🔹 UPDATE TUTOR WALLET
    await TutorWallet.findOneAndUpdate(

      { tutorId: courseData.tutorId },

      {
        $inc: {
          walletBalance: tutorEarning,
          totalEarnings: tutorEarning
        }
      },

      { upsert: true }

    );


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



// =============================
// VERIFY NEXT PAYMENT
// =============================
export const verifyNextPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;


    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {

      return res.status(400).json({
        message: "Payment verification failed"
      });

    }


    const course = await Course.findById(courseId);

    if (!course) {

      return res.status(404).json({
        message: "Course not found"
      });

    }


    const now = new Date();

    const baseDate =
      now > course.nextPaymentDate
        ? now
        : course.nextPaymentDate;

    const nextMonth = new Date(baseDate);
    nextMonth.setMinutes(nextMonth.getMinutes() + 5);


    const adminCommission = course.monthlyFee * 0.2;
    const tutorEarning = course.monthlyFee - adminCommission;


    await Payment.create({

      courseId,
      parentId: req.user.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      billingMonth: new Date(),
      amount: course.monthlyFee,
      status: "paid",
      adminCommission,
      tutorEarning,
      dueDate: nextMonth,

    });


    // 🔹 UPDATE TUTOR WALLET
    await TutorWallet.findOneAndUpdate(

      { tutorId: course.tutorId },

      {
        $inc: {
          walletBalance: tutorEarning,
          totalEarnings: tutorEarning
        }
      },

      { upsert: true }

    );


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



// import razorpay from "../../config/razorpay.js";
// import crypto from "crypto";
// import Course from "../../models/Course.js";
// import Payment from "../../models/payment.js";
// import Student from "../../models/Student.js";


// // =============================
// // CREATE RAZORPAY ORDER
// // =============================
// export const createOrder = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     const options = {
//       amount: amount * 100, // convert to paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     res.json(order);
//   } catch (error) {
//     console.error("ORDER ERROR:", error);
//     res.status(500).json({ message: "Order creation failed" });
//   }
// };



// // =============================
// // VERIFY FIRST PAYMENT
// // =============================
// export const verifyFirstPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       courseData,
//     } = req.body;

//     console.log("VERIFY BODY:", req.body);

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ message: "Missing payment fields" });
//     }

//     // 🔹 Verify Razorpay signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: "Payment verification failed" });
//     }

//     // 🔹 Get student to determine classLevel
//    const student = await Student.findById(courseData.studentId);

// if (!student) {
//   return res.status(404).json({ message: "Student not found" });
// }


// // PRODUCTION (monthly billing)
// // const startDate = new Date(courseData.startDate);
// // const nextMonth = new Date(startDate);
// // nextMonth.setMonth(nextMonth.getMonth() + 1);


// // DEVELOPMENT (5 minute billing for testing)
// const nextMonth = new Date();
// nextMonth.setMinutes(nextMonth.getMinutes() + 5);

// const course = await Course.create({
//   parentId: req.user.id,
//   studentId: courseData.studentId,
//   tutorId: courseData.tutorId,
//   subject: courseData.subject,
//   classLevel: student.grade,
//   startDate: courseData.startDate,
//   timeSlot: courseData.timeSlot,
//   monthlyFee: courseData.monthlyFee,
//   nextPaymentDate: nextMonth,
//   paymentStatus: "paid",
//   courseStatus: "active",
//   createdBy: "parent",
// });
//     // 🔹 Calculate earnings
//     const adminCommission = courseData.monthlyFee * 0.2;
//     const tutorEarning = courseData.monthlyFee - adminCommission;

//     // 🔹 Save payment record
//     await Payment.create({
//       courseId: course._id,
//       parentId: req.user.id,
//       razorpayOrderId: razorpay_order_id,
//       razorpayPaymentId: razorpay_payment_id,
//       razorpaySignature: razorpay_signature,
//       billingMonth: new Date(),
//       amount: courseData.monthlyFee,
//       status: "paid",
//       adminCommission,
//       tutorEarning,
//       dueDate: nextMonth,
//     });

//     res.json({
//       success: true,
//       message: "Payment verified and course created",
//       course,
//     });

//   } catch (error) {
//     console.error("VERIFY PAYMENT ERROR:", error);

//     res.status(500).json({
//       message: "Verification failed",
//       error: error.message,
//     });
//   }
// };



// // =============================
// // VERIFY NEXT PAYMENT
// // =============================
// export const verifyNextPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       courseId,
//     } = req.body;

//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: "Payment verification failed" });
//     }

//    const course = await Course.findById(courseId);

// if (!course) {
//   return res.status(404).json({ message: "Course not found" });
// }

// /* IMPORTANT
// next payment should be calculated from
// previous due date, not today
// */
// // ---------- PRODUCTION (monthly billing) ----------

// // const now = new Date();

// // const baseDate =
// //   now > course.nextPaymentDate
// //     ? now
// //     : course.nextPaymentDate;

// // const nextMonth = new Date(baseDate);
// // nextMonth.setMonth(nextMonth.getMonth() + 1);

// // ---------- DEVELOPMENT (5 minute billing for testing) ----------

// const now = new Date();

// const baseDate =
//   now > course.nextPaymentDate
//     ? now
//     : course.nextPaymentDate;

// const nextMonth = new Date(baseDate);
// nextMonth.setMinutes(nextMonth.getMinutes() + 5);

// const adminCommission = course.monthlyFee * 0.2;
// const tutorEarning = course.monthlyFee - adminCommission;

// await Payment.create({
//   courseId,
//   parentId: req.user.id,
//   razorpayOrderId: razorpay_order_id,
//   razorpayPaymentId: razorpay_payment_id,
//   razorpaySignature: razorpay_signature,
//   billingMonth: new Date(),
//   amount: course.monthlyFee,
//   status: "paid",
//   adminCommission,
//   tutorEarning,
//   dueDate: nextMonth,
// });

// course.nextPaymentDate = nextMonth;
// course.paymentStatus = "paid";
// course.courseStatus = "active";

// await course.save();
//     res.json({
//       success: true,
//       message: "Next payment verified",
//     });

//   } catch (error) {
//     console.error("NEXT PAYMENT ERROR:", error);

//     res.status(500).json({
//       message: "Verification failed",
//       error: error.message,
//     });
//   }
// };


// dfsfdsfdsfdsfdsfdsf
export const getParentPayments = async (req, res) => {
  try {
    const parentId = req.user.id;

    const { studentId, page = 1, search, status, month } = req.query;

    const limit = 10;
    const skip = (page - 1) * limit;

    let filter = { parentId };

    /* STUDENT FILTER */

    if (studentId) {
      const courses = await Course.find({
        parentId,
        studentId,
      }).select("_id");

      const courseIds = courses.map((c) => c._id);
      filter.courseId = { $in: courseIds };
    }

    /* STATUS FILTER */

    if (status) {
      filter.status = status;
    }

    /* MONTH FILTER */

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

    /* SEARCH */

    if (search) {
      const term = search.toLowerCase();

      payments = payments.filter(
        (p) =>
          p.courseId?.subject?.toLowerCase().includes(term) ||
          p.courseId?.tutorId?.fullName?.toLowerCase().includes(term)
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