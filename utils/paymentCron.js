import cron from "node-cron";
import Course from "../models/course.js";

console.log("Payment cron initialized");

cron.schedule("*/1 * * * *", async () => {
  const now = new Date();

  try {
    //    REMINDER (3 min before due)

    // const reminderTime = new Date();
    // reminderTime.setMinutes(reminderTime.getMinutes() + 3);
    const reminderTime = new Date();
reminderTime.setDate(reminderTime.getDate() + 2);

    const reminderCourses = await Course.find({
      nextPaymentDate: { $lte: reminderTime, $gt: now },
      paymentStatus: "paid",
      courseStatus: "active",
    });

    for (const course of reminderCourses) {
      console.log("Reminder: payment due soon for course:", course._id);
    }

    //    PAYMENT DUE

    const dueCourses = await Course.find({
      nextPaymentDate: { $lte: now },
      paymentStatus: "paid",
      courseStatus: "active",
    });

    for (const course of dueCourses) {
      course.paymentStatus = "pending";
      await course.save();

      console.log("Payment pending:", course._id);
    }

    //    COURSE PAUSE (3 min after due)

    // const pauseTime = new Date();
    // pauseTime.setMinutes(pauseTime.getMinutes() - 3);
    const pauseTime = new Date();
pauseTime.setDate(pauseTime.getDate() - 3);

    const pauseCourses = await Course.find({
      nextPaymentDate: { $lte: pauseTime },
      paymentStatus: "pending",
      courseStatus: "active",
    });

    for (const course of pauseCourses) {
      course.courseStatus = "paused";
      await course.save();

      console.log("Course paused:", course._id);
    }

    // COURSE CANCEL (10 days after due)

const cancelTime = new Date();
cancelTime.setDate(cancelTime.getDate() - 10);

const cancelCourses = await Course.find({
  nextPaymentDate: { $lte: cancelTime },
  paymentStatus: "pending",
  courseStatus: "paused",
});

for (const course of cancelCourses) {
  course.courseStatus = "cancelled";
  await course.save();

  console.log("Course cancelled:", course._id);
}

  } catch (error) {
    console.error("CRON ERROR:", error);
  }
});
