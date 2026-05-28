import nodemailer from "nodemailer";
import "dotenv/config";

export const sendVerificationEmail = async ({ token, email }) => {
  try {
    let transporter;
    let senderAddress;

    if (process.env.NODE_ENV === "development") {
      // Ethereal for testing
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      senderAddress = testAccount.user;
    } else {
      // Gmail for production
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      senderAddress = process.env.MAIL_USER;
    }

    const mailConfigurations = {
      from: senderAddress,
      to: email,
      subject: "Email verification",
      text: `Hi! You recently registered.

Please verify your email:
http://localhost:5000/api/auth/verify-email?token=${token}

Thanks`,
    };

    const info = await transporter.sendMail(mailConfigurations);

    if (process.env.NODE_ENV === "development") {
      console.log("------------------------------------------");
      console.log("EMAIL SENT SUCCESSFULLY");
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
      console.log("------------------------------------------");
    }

    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};