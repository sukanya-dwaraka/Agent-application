/**
 * routes/auth.js
 * Authentication routes: login & register admin
 */

const express   = require('express');
const router    = express.Router();
const { body }  = require('express-validator');
const authCtrl  = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register  — create initial admin (unprotected for setup)
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  authCtrl.register
);

// POST /api/auth/login  — admin login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authCtrl.login
);

// GET /api/auth/me  — get current user profile
router.get('/me', protect, authCtrl.getMe);

module.exports = router;
