const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true },
  school: { type: String, required: true },
  classStandard: { type: String, required: true }, // e.g. "Std 5"
  issue: { type: String, required: true }, // Performance deficit identified
  actionTaken: { type: String, required: true }, // Suggested or manual override
  type: { type: String, required: true }, // reading | arithmetic | general
  date: { type: String, required: true }, // Logged date
  status: { type: String, enum: ['success', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Intervention', interventionSchema);
