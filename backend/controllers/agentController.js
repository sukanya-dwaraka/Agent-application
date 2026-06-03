/**
 * controllers/agentController.js
 * CRUD operations for Agent management
 */

const { validationResult } = require('express-validator');
const Agent = require('../models/Agent');

// ─── GET /api/agents ──────────────────────────────────────────────────────────
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: agents.length, agents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/agents ─────────────────────────────────────────────────────────
exports.createAgent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, mobile, password } = req.body;

  try {
    // Check for duplicate email
    const exists = await Agent.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Agent with this email already exists' });
    }

    const agent = await Agent.create({ name, email, mobile, password, createdBy: req.user._id });

    res.status(201).json({ success: true, message: 'Agent created successfully', agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/agents/:id ──────────────────────────────────────────────────────
exports.getAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }
    res.json({ success: true, agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/agents/:id ──────────────────────────────────────────────────────
exports.updateAgent = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    // Do NOT allow password update via this route for security
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile },
      { new: true, runValidators: true }
    );
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }
    res.json({ success: true, message: 'Agent updated successfully', agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/agents/:id ───────────────────────────────────────────────────
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
