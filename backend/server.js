import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import contactRoutes from './routes/contactRoutes.js';
import fundRoutes from './routes/fundRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminManagementRoutes from './routes/adminManagementRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Remove this global login limiter (it's now handled in adminRoutes.js)
// Keep this commented out as reference:
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: { 
//     status: 'error', 
//     message: 'Too many attempts. Try again later.' 
//   }
// });

// Register routes
app.use('/api/contacts', contactRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/admin', adminManagementRoutes);
app.use('/api/investments', investmentRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
