import nodemailer from 'nodemailer'; 
export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Influence Trading House" <${process.env.EMAIL_USER}>`, // Critical fix
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent to:', to); // Success log
    return true;
  } catch (error) {
    console.error('Email failed:', error.message); // Exact error
    throw error;
  }
};
