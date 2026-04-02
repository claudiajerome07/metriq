require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const School = require('./models/School');
const Intervention = require('./models/Intervention');
const Assessment = require('./models/Assessment');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- SCHOOLS ---
app.get('/api/schools', async (req, res) => {
  try {
    const schools = await School.find().sort({ id: 1 });
    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/kpis', async (req, res) => {
  try {
    const schools = await School.find();
    const readingAvg = Math.round(schools.reduce((acc, s) => acc + s.reading, 0) / schools.length);
    const arithmeticAvg = Math.round(schools.reduce((acc, s) => acc + s.arithmetic, 0) / schools.length);
    
    res.json({
      readingAvg,
      arithmeticAvg,
      recoveryRate: "+5pp",
      name: "Gaya District"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ASSESSMENTS (MONTHLY TRACKING) ---
app.get('/api/assessments', async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ date: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TRENDS ---
app.get('/api/trends/aser', async (req, res) => {
  // Static-esque Historical ASER District Data (2014-2024)
  const aserData = [
    { year: 2014, reading: 46.2, arithmetic: 44.1 },
    { year: 2016, reading: 44.8, arithmetic: 42.5 },
    { year: 2018, reading: 47.5, arithmetic: 43.8 },
    { year: 2022, reading: 31.2, arithmetic: 28.5 }, // COVID DIP
    { year: 2024, reading: 36.5, arithmetic: 33.2 }  // Partial Recovery
  ];
  res.json(aserData);
});

app.get('/api/trends/district', async (req, res) => {
  // Aggregate monthly assessments into a district-wide trend (2026 Monthly Data)
  try {
    const data = await Assessment.aggregate([
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          reading: { $avg: "$readingScore" },
          arithmetic: { $avg: "$arithmeticScore" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          reading: { $round: ["$reading", 1] },
          arithmetic: { $round: ["$arithmetic", 1] },
          _id: 0
        }
      }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trends/school/:id', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.id);
    const assessments = await Assessment.find({ schoolId }).sort({ year: 1, month: 1 });
    
    if (assessments.length > 0) {
      res.json(assessments);
    } else {
      // Fallback to generating some random trend if no data yet (for demo)
      const school = await School.findOne({ id: schoolId });
      const fallback = [2014, 2016, 2018, 2022, 2024].map(y => ({
        year: y,
        reading: Math.max(0, school.reading - 5 + Math.random() * 3),
        arithmetic: Math.max(0, school.arithmetic - 5 + Math.random() * 3),
      }));
      res.json(fallback);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assessments', async (req, res) => {
  try {
    const newAssessment = new Assessment(req.body);
    await newAssessment.save();
    
    // Update the school's risk level and current baseline based on this new data
    const avgScore = (req.body.readingScore + req.body.arithmeticScore) / 2;
    let newRisk = 'recovering';
    if (avgScore < 30) newRisk = 'critical';
    else if (avgScore < 38) newRisk = 'at-risk';
    else if (avgScore < 52) newRisk = 'stagnant';

    await School.findOneAndUpdate(
      { id: req.body.schoolId },
      { 
        risk: newRisk,
        reading: req.body.readingScore,
        arithmetic: req.body.arithmeticScore
      }
    );
    
    res.status(201).json({ assessment: newAssessment, updatedRisk: newRisk });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UTILITY: Repair school risk levels based on current scores ---
app.post('/api/schools/repair-risk', async (req, res) => {
  try {
    const schools = await School.find();
    const updates = await Promise.all(schools.map(async (s) => {
      const avg = (s.reading + s.arithmetic) / 2;
      let risk = 'recovering';
      if (avg < 30) risk = 'critical';
      else if (avg < 38) risk = 'at-risk';
      else if (avg < 52) risk = 'stagnant';
      await School.findByIdAndUpdate(s._id, { risk });
      return { name: s.name, avg: avg.toFixed(1), risk };
    }));
    res.json({ message: 'Risk levels repaired', schools: updates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INTERVENTIONS ---
app.get('/api/interventions', async (req, res) => {
  try {
    const logs = await Intervention.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/interventions', async (req, res) => {
  try {
    const newLog = new Intervention(req.body);
    await newLog.save();
    
    // Increment the intervention count on the school
    await School.findOneAndUpdate(
      { id: req.body.schoolId },
      { $inc: { interventions: 1 } }
    );
    
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/interventions/:id/status', async (req, res) => {
  try {
    const updated = await Intervention.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`METRIQ Full-Stack API running on port ${PORT}`);
});
