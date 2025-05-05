import { body, validationResult } from 'express-validator';

export const validateContact = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('country').notEmpty().withMessage('Country is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
