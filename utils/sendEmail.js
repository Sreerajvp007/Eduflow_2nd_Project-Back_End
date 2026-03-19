
// import dotenv from "dotenv";
// dotenv.config();

// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// const sendEmail = async ({ to, subject, html }) => {
  
//   await transporter.sendMail({
//     from: `"Your App Name" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html
//   });
// };

// export default sendEmail;

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "Eduflow <noreply@eduflowclasses.online>", // ✅ YOUR VERIFIED DOMAIN
      to: [to], // ✅ must be array
      subject,
      html,
    });

    console.log("✅ EMAIL SENT:", response);
    return response;
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
};

export default sendEmail;