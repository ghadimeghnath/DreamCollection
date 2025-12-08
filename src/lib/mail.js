import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD, 
  },
});

export const sendVerificationEmail = async (email, token) => {
  const confirmLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Dream Collection" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">Welcome to Dream Collection!</h2>
        <p style="color: #374151; font-size: 16px;">Hi there,</p>
        <p style="color: #374151; line-height: 1.5;">Please verify your email address to activate your account and start collecting.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email</a>
        </div>
        <p style="color: #6B7280; font-size: 12px; text-align: center;">Link expires in 24 hours.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: "Failed to send email" };
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Dream Collection Support" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Reset Password</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};