import express from 'express';
import {
  createInvestment,
  getInvestments,
  updateInvestmentStatus
} from '../controllers/investmentController.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createInvestment);
router.get('/', getInvestments);
router.patch('/:id', verifyAdminToken, updateInvestmentStatus); // <-- Add this line

export default router;
