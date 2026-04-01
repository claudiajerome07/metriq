import React, { useState, useEffect } from 'react';
import { fetchSchools, submitAssessment } from '../data/api';

const C = {
  card:     '#141d2e',
  border:   '#1e2d45',
  accent:   '#3b82f6',
  accentLo: '#1d4ed8',
  text:     '#f1f5f9',
  muted:    '#64748b',
  faint:    '#1e293b',
  green:    '#22c55e',
  red:      '#ef4444',
  yellow:   '#eab308',
  cyan:     '#06b6d4'
};

const S = {
  font: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
  display: "'Fraunces', serif",
};

// Expanded AI Question Generator Pool
const QUESTION_POOL = {
  reading: {
    beginner: ["अ", "आ", "इ", "ई", "उ", "ऊ", "क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ", "ड", "ढ", "त", "थ", "द", "ध", "न"],
    intermediate: [
      "नल पर चल।", "घर चल।", "आम चख।", "फल भर।", "सच कह।", 
      "कमल का फूल।", "मगर मत पकड।", "सड़क पर चल।", "बत्तख मत पकड।", "कलम पकड़।"
    ],
    advanced: [
      "एक जंगल में एक शेर रहता था। वह बहुत शक्तिशाली था।",
      "आज मौसम बहुत सुहावना है। बच्चे पार्क में खेल रहे हैं।",
      "शिक्षा हमारे जीवन के लिए बहुत महत्वपूर्ण है। हमें मन लगाकर पढ़ना चाहिए।",
      "पेड़ हमें ऑक्सीजन देते हैं। हमें पेड़ों की रक्षा करनी चाहिए।",
      "भारत एक महान देश है। यहाँ विभिन्न धर्मों के लोग मिल-जुलकर रहते हैं।"
    ]
  },
  math: {
    beginner: ["1", "4", "7", "9", "3", "0", "5", "8", "2", "6"],
    intermediate: [
      "12 + 5 = ?", "25 - 8 = ?", "15 + 14 = ?", "32 - 12 = ?", "10 + 20 = ?",
      "45 - 5 = ?", "18 + 7 = ?", "22 - 9 = ?", "30 + 15 = ?", "40 - 20 = ?"
    ],
    advanced: [
      "24 ÷ 3 = ?", "15 × 4 = ?", "125 - 47 = ?", "56 + 89 = ?", "144 ÷ 12 = ?",
      "13 × 6 = ?", "250 - 125 = ?", "88 ÷ 11 = ?", "21 × 7 = ?", "300 + 450 = ?"
    ]
  }
};

const generateQuestions = (standard) => {
  const level = standard <= 2 ? 'beginner' : standard <= 5 ? 'intermediate' : 'advanced';
  const rPool = QUESTION_POOL.reading[level];
  const mPool = QUESTION_POOL.math[level];
  
  return {
    reading: rPool[Math.floor(Math.random() * rPool.length)],
    math: mPool[Math.floor(Math.random() * mPool.length)]
  };
};

export function AssessmentModule({ school, onComplete, onCancel }) {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(school ? school.id : '');
  const [standard, setStandard] = useState('5');
  const [status, setStatus] = useState('form'); // form | success
  
  // Data Entry Fields
  const [readingScore, setReadingScore] = useState('');
  const [arithmeticScore, setArithmeticScore] = useState('');
  const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [loading, setLoading] = useState(false);
  
  // AI Preview
  const [currentQuestions, setCurrentQuestions] = useState(generateQuestions(5));

  useEffect(() => {
    if (!school) {
      fetchSchools().then(setSchools);
    }
  }, [school]);

  // Update questions whenever standard changes
  useEffect(() => {
    setCurrentQuestions(generateQuestions(parseInt(standard)));
  }, [standard]);

  const handleRegenerate = () => {
    setCurrentQuestions(generateQuestions(parseInt(standard)));
  };

  const handleSubmit = async () => {
    if (!selectedSchool || !readingScore || !arithmeticScore) {
      return alert("Please fill in all fields before archiving.");
    }

    setLoading(true);
    const assessmentData = {
      schoolId: parseInt(selectedSchool),
      standard: `Std ${standard}`,
      readingScore: parseInt(readingScore),
      arithmeticScore: parseInt(arithmeticScore),
      month,
      year: new Date().getFullYear()
    };

    try {
      await submitAssessment(assessmentData);
      setStatus('success');
    } catch (err) {
      alert("Error archiving data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: C.faint, color: C.text, border: `1px solid ${C.border}`,
    padding: '14px 16px', borderRadius: 10, fontFamily: S.font, outline: 'none',
    fontSize: 15, marginBottom: 20, transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block', color: C.muted, fontSize: 12, fontWeight: 700, 
    marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase'
  };

  if (status === 'form') {
    return (
      <div style={{ padding: 48, fontFamily: S.font, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: S.display, fontSize: 36, color: C.text, marginBottom: 10 }}>Archive Monthly Performance</h2>
          <p style={{ color: C.muted, fontSize: 16 }}>Input validated assessment data provided by the school</p>
        </div>
        
        <div style={{ display: 'flex', gap: 32, maxWidth: 900, width: '100%', alignItems: 'flex-start', justifyContent: 'center' }}>
          
          {/* AI Task Preview Side Panel */}
          <div style={{
            flex: 1, background: `linear-gradient(135deg, ${C.faint}, ${C.card})`,
            padding: 32, borderRadius: 20, border: `1px solid ${C.border}`,
            position: 'sticky', top: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: C.text }}>AI Assessment Tasks</h3>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Standard {standard} difficulty</div>
              </div>
              <button onClick={handleRegenerate} style={{
                background: 'transparent', color: C.accent, border: `1px solid ${C.accent}44`, 
                borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: S.font
              }}>
                ↻ Regenerate
              </button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>READING PREVIEW</div>
              <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 20, textAlign: 'center', lineHeight: 1.4 }}>
                {currentQuestions.reading}
              </div>
            </div>
            
            <div>
              <div style={{ color: C.cyan, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>ARITHMETIC PREVIEW</div>
              <div style={{ background: C.card, padding: 20, borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 24, fontFamily: S.mono, textAlign: 'center' }}>
                {currentQuestions.math}
              </div>
            </div>
          </div>
          
          {/* Form */}
          <div style={{ 
            flex: 1.2, background: C.card, padding: 40, borderRadius: 20, border: `1px solid ${C.border}`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' 
          }}>
            {!school && (
              <div>
                <label style={labelStyle}>School Name</label>
                <select 
                  value={selectedSchool} 
                  onChange={e => setSelectedSchool(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Choose a school...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Standard</label>
                <select value={standard} onChange={e => setStandard(e.target.value)} style={inputStyle}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Std {n}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Month</label>
                <select value={month} onChange={e => setMonth(e.target.value)} style={inputStyle}>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ background: C.faint, padding: 24, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Validated Reading Score (%)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" min="0" max="100" placeholder="e.g. 45"
                    value={readingScore} onChange={e => setReadingScore(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, paddingRight: 40 }}
                  />
                  <span style={{ position: 'absolute', right: 16, top: 14, color: C.muted, fontWeight: 700 }}>%</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Validated Arithmetic Score (%)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" min="0" max="100" placeholder="e.g. 38"
                    value={arithmeticScore} onChange={e => setArithmeticScore(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, paddingRight: 40 }}
                  />
                  <span style={{ position: 'absolute', right: 16, top: 14, color: C.muted, fontWeight: 700 }}>%</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {onCancel && (
                <button onClick={onCancel} style={{
                  flex: 1, padding: '16px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: S.font
                }}>Cancel</button>
              )}
              <button onClick={handleSubmit} disabled={loading} style={{
                flex: 2, padding: '16px', background: C.accent, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: S.font,
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? 'Archiving...' : 'Archive Data →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 80, textAlign: 'center', fontFamily: S.font }}>
       <div style={{ fontSize: 80, marginBottom: 24 }}>📥</div>
       <h2 style={{ fontFamily: S.display, fontSize: 48, color: C.text, marginBottom: 16, fontWeight: 900 }}>Data Archived</h2>
       <div style={{ color: C.muted, fontSize: 20, marginBottom: 48, maxWidth: 550, margin: '0 auto', lineHeight: 1.6 }}>
          Monthly report for {school ? school.name : 'the selected school'} has been integrated into the analytics engine. 
          The school's **Risk Level** has been dynamically adjusted based on these scores.
       </div>
       <button onClick={onComplete} style={{
         padding: '18px 60px', background: C.accent, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 17,
         boxShadow: `0 8px 24px ${C.accent}44`
       }}>View Updated Metrics</button>
    </div>
  );
}
