
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

import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,        // 🔥 change here
  secure: false,    // 🔥 important
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // connectionTimeout: 10000, // optional (avoid long wait)
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    // 🔥 ADD LOGS HERE
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("✅ EMAIL SENT:", info.response);

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
};

export default sendEmail;