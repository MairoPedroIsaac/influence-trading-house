import { sendEmail } from '../utils/emailService.js';

export const sendEmailController = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const mailOptions = {
      to: 'your_email@gmail.com', // Replace with your email address
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };
    await sendEmail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.', error: error.message });
  }
};
