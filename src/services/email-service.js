import nodemailer from 'nodemailer';
import dotenv from "dotenv"
import Mailgen from 'mailgen';

dotenv.config()

const BASE_URL =
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const config = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(config);

// ✨ Setup Mailgen
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Mavo',
    link: BASE_URL,
    copyright: `© ${new Date().getFullYear()} Mavo. All rights reserved.`,
  },
});

// ✅ Send verification email with Mailgen
export const sendVerificationEmail = (to, name, code) => {
  const email = {
    body: {
      greeting: 'Hello',
      signature: 'Best regards',
      intro: 'Thanks for signing up with Mavo! To complete your registration, please use the verification code below:',
      table: {
        data: [
          {
            'Verification Code': code,
          },
        ],
        columns: {
          customWidth: {
            'Verification Code': '200px',
          },
          customAlignment: {
            'Verification Code': 'center',
          },
        },
      },
      outro: 'This code will expire in 20 minutes. If you did not request this, you can safely ignore this message.',
    },
  };
  
  // Generate the HTML and plaintext versions
  const emailBody = mailGenerator.generate(email);
  const textBody = mailGenerator.generatePlaintext(email);

  const msg = {
    from: '"support@mavo.com" <mavoinc.>',
    to,
    subject: 'Verify Your Mavo Account',
    html: emailBody,
    text: textBody,
  };

  return transporter.sendMail(msg);
};
