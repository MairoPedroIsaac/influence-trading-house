import express from 'express';
import { getContacts, createContact } from '../controllers/contactController.js';
import { validateContact } from '../middlewares/contactValidation.js';

const router = express.Router();

router.get('/', getContacts); // GET /api/contacts
router.post('/', validateContact, createContact); // POST /api/contacts

export default router;
