const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  school: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  outcome: { type: String, required: true },
  status: { type: String, enum: ['success', 'pending'], required: true }
});

module.exports = mongoose.model('Intervention', interventionSchema);
