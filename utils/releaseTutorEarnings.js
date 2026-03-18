

import cron from "node-cron";
import Payment from "../models/payment.js";
import TutorWallet from "../models/tutorWallet.js";

console.log("Tutor earning release cron started");

cron.schedule("* * * * *", async () => {
  try {

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const payments = await Payment.find({
      earningReleased: false,
      status: "paid",
      createdAt: { $lte: twoMinutesAgo }
    });

    for (const payment of payments) {

      await TutorWallet.findOneAndUpdate(
        { tutorId: payment.tutorId },
        {
          $inc: {
            walletBalance: payment.tutorEarning,
            totalEarnings: payment.tutorEarning
          }
        },
        { upsert: true }
      );

      payment.earningReleased = true;
      await payment.save();

      console.log("Tutor earning released:", payment._id);

    }

  } catch (error) {
    console.error("Release cron error:", error);
  }
});