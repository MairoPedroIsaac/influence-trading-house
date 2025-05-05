import pkg from '@prisma/client';
import { sendEmail } from '../utils/emailService.js';
import { formatResponse } from '../utils/formatter.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany();
    res.json(formatResponse(contacts));
  } catch (error) {
    res.status(500).json(formatResponse({ status: 'error', message: error.message }));
  }
};

export const createContact = async (req, res) => {
  try {
    // Include investmentPlan in destructuring
    const { fullName, email, country, broker, hasMT5, areaOfInterest, investmentPlan } = req.body;

    const contact = await prisma.contact.create({
      data: { 
        fullName, 
        email, 
        country, 
        broker, 
        hasMT5, 
        areaOfInterest,
        investmentPlan // Now included
      },
    });

    // Welcome Email
    const whatsappLink = 'https://wa.me/2348119215696';
    await sendEmail({
      to: email,
      subject: 'Welcome to Influence Trading House - Next Steps',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2d3748;">
          <h2 style="color: #2b6cb0; margin-bottom: 16px;">Hi ${fullName},</h2>
          <p style="line-height: 1.6;">Thank you for registering with <strong style="color: #2b6cb0;">Influence Trading House</strong>!</p>
          <p style="line-height: 1.6; margin: 20px 0;">
            <a href="${whatsappLink}" 
               style="background-color: #2b6cb0; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
               Connect via WhatsApp
            </a>
          </p>
          <p style="color: #718096; font-size: 14px;">
            Need help? Reply to this email directly.<br>
            <span style="display: inline-block; margin-top: 20px; font-size: 12px; color: #a0aec0;">
              © 2025 Influence Trading House | Lagos, Nigeria
            </span>
          </p>
        </div>
      `,
    });

    // Admin Notification
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Registration: ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; max-width: 600px;">
          <h2 style="color: #2b6cb0; margin-bottom: 20px;">New Contact Registration</h2>
          <table style="width: 100%; border-collapse: collapse; color: #4a5568;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Country</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${country}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Broker</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${broker}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Has MT5</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${hasMT5 ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Area of Interest</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${areaOfInterest}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Investment Plan</td>
              <td style="padding: 10px;">${investmentPlan}</td>
            </tr>
          </table>
        </div>
      `,
    });

    res.status(201).json(formatResponse(contact));
  } catch (error) {
    res.status(500).json(formatResponse({ status: 'error', message: error.message }));
  }
};
