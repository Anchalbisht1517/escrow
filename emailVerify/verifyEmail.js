import nodemailer from "nodemailer";
import "dotenv/config";

export const sendVerificationEmail = async ({ token, email }) => {
  try {
    // Ethereal auto-creates a temporary test account
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailConfigurations = {
      from: testAccount.user,        // use Ethereal's address as sender
      to: email,
      subject: "Email verification",
      text: `Hi! You recently registered.

Please verify your email:
http://localhost:5000/api/auth/verify-email?token=${token}

Thanks`,
    };

    const info = await transporter.sendMail(mailConfigurations);

    // This prints the URL where you can view the email in your browser
    console.log("------------------------------------------");
    console.log("EMAIL SENT SUCCESSFULLY");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    console.log("------------------------------------------");

    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};