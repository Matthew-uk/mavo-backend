import nodemailer from 'nodemailer';
import emailConfig from '../config/email.js';

// In a production environment, you would use a real email service
// This is a development setup using Ethereal (fake SMTP service)
let transporter;

// Initialize email transporter
const initTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service configuration
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // For development, use Ethereal (fake SMTP service)
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// Initialize the transporter
initTransporter().catch(console.error);

// Send verification email
export const sendVerificationEmail = async (to, code) => {
  try {
    if (!transporter) {
      await initTransporter();
    }

    const mailOptions = {
      from: emailConfig.from,
      to,
      subject: 'Verify Your Mavo Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f5132;">Verify Your Mavo Account</h2>
          <p>Thank you for registering with Mavo. Please use the following code to verify your account:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this verification, please ignore this email.</p>
          <p>Best regards,<br>The Mavo Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      // Log preview URL for development (Ethereal)
      console.log(
        'Verification email preview URL: %s',
        nodemailer.getTestMessageUrl(info),
      );
    }

    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};
