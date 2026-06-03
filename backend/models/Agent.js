/**
 * models/Agent.js
 * Mongoose schema for Agents managed by Admin
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const agentSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Agent name is required'],
      trim:     true
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    mobile: {
      countryCode: {
        type:     String,
        required: [true, 'Country code is required'],
        trim:     true
        // e.g. "+91", "+1"
      },
      number: {
        type:     String,
        required: [true, 'Mobile number is required'],
        trim:     true,
        match:    [/^\d{7,15}$/, 'Please enter a valid mobile number']
      }
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    }
  },
  { timestamps: true }
);

// ─── Hash password before saving ──────────────────────────────────────────────
agentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Hide password in JSON responses ──────────────────────────────────────────
agentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Agent', agentSchema);
