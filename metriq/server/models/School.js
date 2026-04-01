const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  block: { type: String, required: true },
  risk: { type: String, enum: ['critical', 'at-risk', 'stagnant', 'recovering'], required: true },
  reading: { type: Number, required: true }, // Baseline ASER reading score
  arithmetic: { type: Number, required: true }, // Baseline ASER arithmetic score
  trend: { type: Number, required: true },
  interventions: { type: Number, default: 0 },
  students: { type: Number, required: true },
  standard: { type: String, default: 'V' }
});

module.exports = mongoose.model('School', schoolSchema);
