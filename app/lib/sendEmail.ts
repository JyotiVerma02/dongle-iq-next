import nodemailer from "nodemailer";

export const sendOTP = async (email: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP",
      text: `Your OTP is ${otp}`,
    });

    console.log("Email sent");
  } catch (error) {
    console.log("Email error:", error);
  }
};