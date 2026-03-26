// import dotenv from "dotenv";
// dotenv.config();

import { Resend } from "resend";





const sendEmail = async ({ to, subject, html }) => {

  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log(process.env.RESEND_API_KEY)
  
  try {
    const response = await resend.emails.send({
      from: "Eduflow <noreply@eduflowclasses.online>", 
      to: [to], 
      subject,
      html,
    });

    console.log("EMAIL SENT:", response);
    return response;
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
};

export default sendEmail;