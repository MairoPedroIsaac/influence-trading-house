import express from 'express';
import { 
  createAdmin,
  changeAdminPassword,
  deleteAdmin
} from '../controllers/adminController.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin Management Endpoints
router.post('/', verifyAdminToken, createAdmin);
router.post('/change-password', verifyAdminToken, changeAdminPassword);
router.delete('/:id', verifyAdminToken, deleteAdmin);

export default router;
