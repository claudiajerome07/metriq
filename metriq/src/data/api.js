const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export async function fetchSchools() {
  const response = await fetch(`${BASE_URL}/schools`);
  if (!response.ok) throw new Error("Failed to fetch schools");
  return response.json();
}

export async function fetchDistrictTrend() {
  const response = await fetch(`${BASE_URL}/trends/district`);
  if (!response.ok) throw new Error("Failed to fetch district trend");
  return response.json();
}

export async function fetchDistrictAserTrend() {
  const response = await fetch(`${BASE_URL}/trends/aser`);
  if (!response.ok) throw new Error("Failed to fetch historical ASER trend");
  return response.json();
}

export async function fetchSchoolTrend(schoolId) {
  const response = await fetch(`${BASE_URL}/trends/school/${schoolId}`);
  if (!response.ok) throw new Error(`Failed to fetch trend for school ${schoolId}`);
  return response.json();
}

export async function fetchInterventions() {
  const response = await fetch(`${BASE_URL}/interventions`);
  if (!response.ok) throw new Error("Failed to fetch interventions log");
  return response.json();
}

export async function fetchDistrictKpis() {
  const response = await fetch(`${BASE_URL}/kpis`);
  if (!response.ok) throw new Error("Failed to fetch KPIs");
  return response.json();
}

export async function addIntervention(interventionData) {
  const response = await fetch(`${BASE_URL}/interventions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(interventionData)
  });
  if (!response.ok) throw new Error("Failed to post intervention");
  return response.json();
}

// --- NEW ASSESSMENT ENDPOINTS ---
export async function submitAssessment(assessmentData) {
  const response = await fetch(`${BASE_URL}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assessmentData)
  });
  if (!response.ok) throw new Error("Failed to submit assessment");
  return response.json();
}

export async function fetchAllAssessments() {
  const response = await fetch(`${BASE_URL}/assessments`);
  if (!response.ok) throw new Error("Failed to fetch all assessments");
  return response.json();
}
