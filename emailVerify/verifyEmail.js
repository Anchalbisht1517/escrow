import nodemailer from "nodemailer";
import "dotenv/config";

export const sendVerificationEmail = async ({ token, email }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailConfigurations = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Email verification",
      text: `Hi! You recently registered.

Please verify your email:
http://localhost:8000/api/auth/verify-email?token=${token}

Thanks`,
    };

    const info = await transporter.sendMail(mailConfigurations);

    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};