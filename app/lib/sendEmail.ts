import { createUserOtpEmail } from "@/app/lib/emailTemplates";
import { transporter } from "@/app/lib/mailer";

export const sendOTP = async (email: string, otp: string) => {
  const message = createUserOtpEmail({ otp });
  await transporter.sendMail({
    to: email,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
};
