/**
 * routes/agents.js
 * CRUD routes for Agent management (all protected)
 */

const express    = require('express');
const router     = express.Router();
const { body }   = require('express-validator');
const agentCtrl  = require('../controllers/agentController');
const { protect } = require('../middleware/auth');

// All agent routes require admin authentication
router.use(protect);

// GET  /api/agents      — list all agents
router.get('/', agentCtrl.getAllAgents);

// POST /api/agents      — create new agent
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('mobile.countryCode').notEmpty().withMessage('Country code is required'),
    body('mobile.number')
      .matches(/^\d{7,15}$/)
      .withMessage('Valid mobile number is required (7-15 digits)'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  agentCtrl.createAgent
);

// GET    /api/agents/:id  — get single agent
router.get('/:id', agentCtrl.getAgent);

// PUT    /api/agents/:id  — update agent
router.put('/:id', agentCtrl.updateAgent);

// DELETE /api/agents/:id  — delete agent
router.delete('/:id', agentCtrl.deleteAgent);

module.exports = router;
