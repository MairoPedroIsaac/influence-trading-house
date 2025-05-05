// adminController.js
import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { formatResponse } from '../utils/formatter.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Create Admin
export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json(formatResponse({
        status: 'error',
        message: 'Admin already exists'
      }));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN" // Changed from superadmin to ADMIN
      }
    });

    res.status(201).json(formatResponse({
      status: 'success',
      data: { id: admin.id, email: admin.email }
    }));
  } catch (error) {
    res.status(500).json(formatResponse({
      status: 'error',
      message: error.message
    }));
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json(formatResponse({
        status: 'error',
        message: 'Invalid credentials'
      }));
    }

    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json(formatResponse({
      status: 'success',
      message: 'Logged in',
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role }
    }));
  } catch (error) {
    res.status(500).json(formatResponse({
      status: 'error',
      message: error.message
    }));
  }
};

// Change Admin Password
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.adminId;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json(formatResponse({
        status: 'error',
        message: 'Admin not found'
      }));
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json(formatResponse({
        status: 'error',
        message: 'Current password is incorrect'
      }));
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedNewPassword }
    });

    res.json(formatResponse({
      status: 'success',
      message: 'Password updated successfully'
    }));
  } catch (error) {
    res.status(500).json(formatResponse({
      status: 'error',
      message: error.message
    }));
  }
};

// Delete Admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.admin.delete({
      where: { id }
    });

    res.json(formatResponse({
      status: 'success',
      message: 'Admin deleted successfully'
    }));
  } catch (error) {
    res.status(500).json(formatResponse({
      status: 'error',
      message: error.message
    }));
  }
};
