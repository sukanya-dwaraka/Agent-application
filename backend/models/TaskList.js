/**
 * models/TaskList.js
 * Mongoose schema for distributed task lists assigned to agents
 */

const mongoose = require('mongoose');

// Individual task item from CSV
const taskItemSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  notes:     { type: String, default: '', trim: true }
});

// One distribution batch (one upload session)
const uploadBatchSchema = new mongoose.Schema(
  {
    uploadedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalFile:  { type: String },          // original filename
    totalItems:    { type: Number, required: true },
    distributions: [
      {
        agent:  { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
        items:  [taskItemSchema],
        count:  { type: Number }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('UploadBatch', uploadBatchSchema);
