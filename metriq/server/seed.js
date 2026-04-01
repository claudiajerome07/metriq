require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const School = require('./models/School');
const Intervention = require('./models/Intervention');
const Assessment = require('./models/Assessment');

const DATA_FILE = path.join(__dirname, 'data.json');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const rawData = fs.readFileSync(DATA_FILE);
    const data = JSON.parse(rawData);

    // Clear existing data
    await School.deleteMany({});
    await Intervention.deleteMany({});
    await Assessment.deleteMany({});

    // Seed Schools
    await School.insertMany(data.schools);
    console.log('Schools seeded.');

    // Seed Interventions
    await Intervention.insertMany(data.interventionsLog);
    console.log('Interventions seeded.');

    // Mock initial assessments from historical baseline if mapping matches
    const initialAssessments = data.schools.map(school => ({
      schoolId: school.id,
      standard: school.standard || 'V',
      readingScore: school.reading,
      arithmeticScore: school.arithmetic,
      month: 'March',
      year: 2024
    }));
    await Assessment.insertMany(initialAssessments);
    console.log('Initial historical assessments seeded.');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
