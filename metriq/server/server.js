const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Helper to read data
const readData = () => {
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
};

// Helper to write data
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Endpoints
app.get('/api/schools', (req, res) => {
  const data = readData();
  res.json(data.schools);
});

app.get('/api/kpis', (req, res) => {
  const data = readData();
  res.json(data.districtKpis);
});

app.get('/api/interventions', (req, res) => {
  const data = readData();
  res.json(data.interventionsLog);
});

app.get('/api/trends/district', (req, res) => {
  const data = readData();
  res.json(data.districtTrend);
});

app.get('/api/trends/school/:id', (req, res) => {
  const data = readData();
  const schoolId = req.params.id;
  const trend = data.schoolTrends[schoolId];

  if (trend) {
    res.json(trend);
  } else {
    // Generate fallback trend if not exact match found
    const school = data.schools.find(s => s.id == schoolId);
    if (!school) return res.status(404).json({ error: "School not found" });

    const fallbackTrend = data.districtTrend.map(d => ({
      ...d,
      reading: Math.max(0, school.reading - 5 + Math.random() * 3),
      arithmetic: Math.max(0, school.arithmetic - 5 + Math.random() * 3),
      standard: school.standard
    }));
    res.json(fallbackTrend);
  }
});

// POST endpoint to add a new intervention
app.post('/api/interventions', (req, res) => {
  const data = readData();
  const newIntervention = {
    id: data.interventionsLog.length + 1,
    school: req.body.school || 'Unknown School',
    type: req.body.type || 'General Intervention',
    date: req.body.date || new Date().toLocaleString('default', { month: 'short', year: 'numeric' }),
    outcome: req.body.outcome || 'Pending review',
    status: req.body.status || 'pending'
  };

  data.interventionsLog.push(newIntervention);
  writeData(data);
  
  res.status(201).json(newIntervention);
});

app.listen(PORT, () => {
  console.log(`ASER Mock Backend Server running on http://localhost:${PORT}`);
});
