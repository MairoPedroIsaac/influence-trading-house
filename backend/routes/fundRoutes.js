import express from 'express';
import { 
  getFunds, 
  createFund, 
  updateFund, 
  deleteFund 
} from '../controllers/fundController.js';
import { validateFund } from '../middlewares/fundValidation.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getFunds);

// Admin-protected routes
router.post('/', verifyAdminToken, validateFund, createFund);
router.put('/:id', verifyAdminToken, updateFund);
router.delete('/:id', verifyAdminToken, deleteFund);

export default router;
