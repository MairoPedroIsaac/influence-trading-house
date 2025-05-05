// C:\Influence Trading House Website\backend\routes\adminRoutes.js
import express from 'express';
import { adminLogin } from '../controllers/adminController.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Admin Login (Protected by rate limiter)
router.post('/login', loginLimiter, adminLogin);

// Protected Routes
router.get('/protected', verifyAdminToken, (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'This is a protected route',
    admin: req.admin
  });
});

// Database Operations
router.get('/investments', verifyAdminToken, async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      include: { contact: true, fund: true }
    });
    res.json({ status: 'success', data: investments });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/contacts', verifyAdminToken, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: { investments: true }
    });
    res.json({ status: 'success', data: contacts });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
