const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true },
  standard: { type: String, required: true }, // Std 1-8
  readingScore: { type: Number, required: true }, // % of students who passed
  arithmeticScore: { type: Number, required: true }, // % of students who passed
  month: { type: String, required: true },
  year: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
