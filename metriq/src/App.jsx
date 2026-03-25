import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
} from 'recharts';

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg:       '#080c14',
  surface:  '#0f1623',
  card:     '#141d2e',
  border:   '#1e2d45',
  accent:   '#3b82f6',
  accentLo: '#1d4ed8',
  cyan:     '#06b6d4',
  green:    '#22c55e',
  yellow:   '#eab308',
  red:      '#ef4444',
  text:     '#f1f5f9',
  muted:    '#64748b',
  faint:    '#1e293b',
};

const S = {
  font: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
  display: "'Fraunces', serif",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SCHOOLS = [
  { id: 1, name: 'Rajpur Primary School',    block: 'Rajpur',    risk: 'critical',    reading: 28, arithmetic: 22, trend: -8,  interventions: 0, students: 142 },
  { id: 2, name: 'Nawada Govt. School',      block: 'Nawada',    risk: 'critical',    reading: 31, arithmetic: 25, trend: -6,  interventions: 1, students: 98  },
  { id: 3, name: 'Bodh Gaya Middle School',  block: 'Bodh Gaya', risk: 'at-risk',     reading: 36, arithmetic: 30, trend: -3,  interventions: 1, students: 203 },
  { id: 4, name: 'Gaya Central School',      block: 'Gaya',      risk: 'at-risk',     reading: 39, arithmetic: 33, trend: -2,  interventions: 2, students: 317 },
  { id: 5, name: 'Aurangabad PS',            block: 'Aurangabad',risk: 'stagnant',    reading: 42, arithmetic: 36, trend: 0,   interventions: 2, students: 176 },
  { id: 6, name: 'Sherghati Vidyalaya',      block: 'Sherghati', risk: 'stagnant',    reading: 44, arithmetic: 38, trend: 1,   interventions: 3, students: 134 },
  { id: 7, name: 'Imamganj Primary',         block: 'Imamganj',  risk: 'recovering',  reading: 49, arithmetic: 43, trend: 4,   interventions: 3, students: 89  },
  { id: 8, name: 'Gurua Govt. School',       block: 'Gurua',     risk: 'recovering',  reading: 52, arithmetic: 47, trend: 6,   interventions: 4, students: 211 },
];

const SCHOOL_TREND = {
  1: [
    { year: '2014', reading: 38, arithmetic: 32 },
    { year: '2016', reading: 36, arithmetic: 30 },
    { year: '2018', reading: 35, arithmetic: 29 },
    { year: '2022', reading: 24, arithmetic: 18 },
    { year: '2024', reading: 28, arithmetic: 22 },
  ],
  3: [
    { year: '2014', reading: 44, arithmetic: 38 },
    { year: '2016', reading: 43, arithmetic: 37 },
    { year: '2018', reading: 42, arithmetic: 36 },
    { year: '2022', reading: 33, arithmetic: 27 },
    { year: '2024', reading: 36, arithmetic: 30 },
  ],
};

const DISTRICT_TREND = [
  { year: '2014', reading: 38, arithmetic: 32, district: 'Gaya' },
  { year: '2016', reading: 37, arithmetic: 31, district: 'Gaya' },
  { year: '2018', reading: 39, arithmetic: 33, district: 'Gaya' },
  { year: '2022', reading: 31, arithmetic: 26, district: 'Gaya' },
  { year: '2024', reading: 36, arithmetic: 30, district: 'Gaya' },
];

const INTERVENTIONS_LOG = [
  { id: 1, school: 'Imamganj Primary',    type: 'Teacher Deployment', date: 'Jan 2024', outcome: 'Reading +4%', status: 'success' },
  { id: 2, school: 'Gurua Govt. School',  type: 'Resource Kit',       date: 'Dec 2023', outcome: 'Arithmetic +6%', status: 'success' },
  { id: 3, school: 'Gaya Central School', type: 'School Visit',       date: 'Feb 2024', outcome: 'Pending review', status: 'pending' },
  { id: 4, school: 'Bodh Gaya Middle',    type: 'Teacher Training',   date: 'Mar 2024', outcome: 'No change yet', status: 'pending' },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const riskColor = (r) => ({ critical: C.red, 'at-risk': C.yellow, stagnant: C.muted, recovering: C.green }[r] || C.muted);
const riskLabel = (r) => ({ critical: 'Critical', 'at-risk': 'At Risk', stagnant: 'Stagnant', recovering: 'Recovering' }[r] || r);

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: 24, ...style
  }}>
    {children}
  </div>
);

const Badge = ({ risk }) => (
  <span style={{
    background: riskColor(risk) + '22', color: riskColor(risk),
    border: `1px solid ${riskColor(risk)}44`,
    borderRadius: 6, padding: '3px 10px',
    fontSize: 12, fontWeight: 600, fontFamily: S.mono,
    textTransform: 'uppercase', letterSpacing: '0.05em'
  }}>
    {riskLabel(risk)}
  </span>
);

const KpiCard = ({ label, value, sub, color = C.accent }) => (
  <Card style={{ flex: 1 }}>
    <div style={{ color: C.muted, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
    <div style={{ color, fontSize: 38, fontWeight: 700, fontFamily: S.display, lineHeight: 1 }}>{value}</div>
    <div style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>{sub}</div>
  </Card>
);

const NavBar = ({ page, setPage, setSelectedSchool }) => (
  <div style={{
    background: C.surface, borderBottom: `1px solid ${C.border}`,
    padding: '0 32px', display: 'flex', alignItems: 'center',
    height: 60, gap: 8, position: 'sticky', top: 0, zIndex: 100,
  }}>
    <div style={{ fontFamily: S.display, fontSize: 22, color: C.accent, marginRight: 32, fontWeight: 900, letterSpacing: '-0.02em' }}>
      metriq
    </div>
    {[
      { id: 'overview',      label: 'District Overview' },
      { id: 'priority',      label: 'Priority Queue' },
      { id: 'interventions', label: 'Interventions' },
    ].map(({ id, label }) => (
      <button key={id} onClick={() => { setPage(id); setSelectedSchool(null); }} style={{
        background: page === id ? C.accent + '18' : 'transparent',
        color: page === id ? C.accent : C.muted,
        border: page === id ? `1px solid ${C.accent}44` : '1px solid transparent',
        borderRadius: 8, padding: '6px 16px', fontSize: 14,
        fontWeight: 500, cursor: 'pointer', fontFamily: S.font,
        transition: 'all 0.15s',
      }}>
        {label}
      </button>
    ))}
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>Ravi Kumar</div>
        <div style={{ color: C.muted, fontSize: 11 }}>DEO — Gaya District, Bihar</div>
      </div>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: 14,
      }}>R</div>
    </div>
  </div>
);

// ─── SCREEN 1: LOGIN ──────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!user || !pass) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  const inputStyle = {
    width: '100%', background: C.faint, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: '13px 16px', color: C.text,
    fontSize: 14, fontFamily: S.font, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: S.font, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${C.border}55 1px, transparent 1px), linear-gradient(90deg, ${C.border}55 1px, transparent 1px)`,
        backgroundSize: '48px 48px', opacity: 0.4,
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.accent}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: S.display, fontSize: 42, color: C.accent, fontWeight: 900, letterSpacing: '-0.03em' }}>
            metriq
          </div>
          <div style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>
            District Education Intelligence Platform
          </div>
        </div>

        <Card style={{ padding: 36 }}>
          <div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Sign in</div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Access your district dashboard</div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>DISTRICT CODE</div>
            <input
              style={inputStyle} placeholder="e.g. BR-GAYA-DEO"
              value={user} onChange={e => setUser(e.target.value)}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>PASSWORD</div>
            <input
              style={inputStyle} type="password" placeholder="••••••••"
              value={pass} onChange={e => setPass(e.target.value)}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button onClick={handleLogin} style={{
            width: '100%', padding: '14px',
            background: loading ? C.accentLo : `linear-gradient(135deg, ${C.accent}, ${C.accentLo})`,
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: S.font, transition: 'opacity 0.2s',
            opacity: loading ? 0.8 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          <div style={{ marginTop: 20, padding: '12px 16px', background: C.faint, borderRadius: 8 }}>
            <div style={{ color: C.muted, fontSize: 12 }}>Demo credentials</div>
            <div style={{ color: C.text, fontSize: 12, fontFamily: S.mono, marginTop: 4 }}>
              Code: BR-GAYA-DEO &nbsp;|&nbsp; Pass: demo123
            </div>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 20, color: C.muted, fontSize: 12 }}>
          Powered by ASER data · Bihar Education Department
        </div>
      </div>
    </div>
  );
};

// ─── SCREEN 2: DISTRICT OVERVIEW ──────────────────────────────────────────────
const OverviewScreen = ({ setPage, setSelectedSchool }) => {
  const critical  = SCHOOLS.filter(s => s.risk === 'critical').length;
  const atRisk    = SCHOOLS.filter(s => s.risk === 'at-risk').length;
  const recovering= SCHOOLS.filter(s => s.risk === 'recovering').length;

  return (
    <div style={{ padding: 32, fontFamily: S.font, color: C.text }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: S.display }}>Gaya District Overview</div>
        <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Bihar · 8 monitored schools · ASER data 2014–2024</div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Std V Reading (District)" value="36%" sub="↑ from 31% in 2022, still below 2018 baseline" color={C.yellow} />
        <KpiCard label="Std V Arithmetic" value="30%" sub="Consistently lower than reading every year" color={C.red} />
        <KpiCard label="Schools in Crisis" value={critical} sub={`${atRisk} more at risk · ${recovering} recovering`} color={C.red} />
        <KpiCard label="Recovery Rate" value="+5pp" sub="Post-COVID recovery since 2022 low of 31%" color={C.green} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>District Learning Trend (2014–2024)</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>COVID dip in 2022 — recovery incomplete</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={DISTRICT_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} domain={[0, 60]} unit="%" />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="reading" stroke={C.accent} strokeWidth={2.5} dot={{ r: 4 }} name="Reading %" />
              <Line type="monotone" dataKey="arithmetic" stroke={C.cyan} strokeWidth={2.5} dot={{ r: 4 }} name="Arithmetic %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>School Risk Distribution</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Current status of all 8 monitored schools</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { status: 'Critical',   count: critical,                              fill: C.red },
              { status: 'At Risk',    count: atRisk,                                fill: C.yellow },
              { status: 'Stagnant',   count: SCHOOLS.filter(s=>s.risk==='stagnant').length, fill: C.muted },
              { status: 'Recovering', count: recovering,                            fill: C.green },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="status" stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
              <Bar dataKey="count" name="Schools" radius={[4, 4, 0, 0]}>
                {[C.red, C.yellow, C.muted, C.green].map((color, i) => (
                  <rect key={i} fill={color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Prediction Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.accent}15, ${C.cyan}10)`,
        border: `1px solid ${C.accent}44`, borderRadius: 12, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 28 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>AI Recovery Prediction</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>
              At current trajectory, Gaya district will miss the 2026 ASER benchmark of 45% unless <strong style={{ color: C.yellow }}>2 critical schools</strong> receive intervention within 60 days.
            </div>
          </div>
        </div>
        <button onClick={() => setPage('priority')} style={{
          background: C.accent, color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 20px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: S.font, whiteSpace: 'nowrap',
        }}>
          View Priority Queue →
        </button>
      </div>
    </div>
  );
};

// ─── SCREEN 3: PRIORITY QUEUE ─────────────────────────────────────────────────
const PriorityScreen = ({ setPage, setSelectedSchool }) => (
  <div style={{ padding: 32, fontFamily: S.font, color: C.text }}>
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: S.display }}>Intervention Priority Queue</div>
      <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
        AI-ranked schools that need action this month — updated from ASER trend analysis
      </div>
    </div>

    {/* Legend */}
    <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
      {['critical','at-risk','stagnant','recovering'].map(r => (
        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: riskColor(r) }} />
          <span style={{ color: C.muted, fontSize: 13 }}>{riskLabel(r)}</span>
        </div>
      ))}
    </div>

    {/* School Cards */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {SCHOOLS.map((school, i) => (
        <div key={school.id}
          onClick={() => { setSelectedSchool(school); setPage('school-detail'); }}
          style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderLeft: `4px solid ${riskColor(school.risk)}`,
            borderRadius: 12, padding: '18px 24px',
            display: 'flex', alignItems: 'center', gap: 20,
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.faint}
          onMouseLeave={e => e.currentTarget.style.background = C.card}
        >
          {/* Rank */}
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: i < 2 ? C.red + '22' : i < 4 ? C.yellow + '22' : C.border,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: i < 2 ? C.red : i < 4 ? C.yellow : C.muted,
            fontWeight: 700, fontSize: 15, fontFamily: S.mono, flexShrink: 0,
          }}>#{i + 1}</div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{school.name}</span>
              <Badge risk={school.risk} />
            </div>
            <div style={{ color: C.muted, fontSize: 13 }}>
              {school.block} Block · {school.students} students · {school.interventions} interventions logged
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 2 }}>READING</div>
              <div style={{ color: school.reading < 35 ? C.red : school.reading < 45 ? C.yellow : C.green, fontWeight: 700, fontSize: 18, fontFamily: S.mono }}>
                {school.reading}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 2 }}>ARITHMETIC</div>
              <div style={{ color: school.arithmetic < 30 ? C.red : school.arithmetic < 40 ? C.yellow : C.green, fontWeight: 700, fontSize: 18, fontFamily: S.mono }}>
                {school.arithmetic}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 2 }}>TREND</div>
              <div style={{ color: school.trend < 0 ? C.red : school.trend === 0 ? C.muted : C.green, fontWeight: 700, fontSize: 18, fontFamily: S.mono }}>
                {school.trend > 0 ? '+' : ''}{school.trend}pp
              </div>
            </div>
          </div>

          <div style={{ color: C.muted, fontSize: 18, marginLeft: 8 }}>›</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── SCREEN 4: SCHOOL DETAIL ──────────────────────────────────────────────────
const SchoolDetailScreen = ({ school, setPage }) => {
  const trend = SCHOOL_TREND[school.id] || DISTRICT_TREND.map(d => ({
    ...d, reading: school.reading - 5 + Math.random() * 3,
    arithmetic: school.arithmetic - 5 + Math.random() * 3,
  }));

  const radarData = [
    { subject: 'Reading',    score: school.reading },
    { subject: 'Arithmetic', score: school.arithmetic },
    { subject: 'Attendance', score: 68 },
    { subject: 'Teacher Ratio', score: 55 },
    { subject: 'Resources',  score: 40 },
  ];

  return (
    <div style={{ padding: 32, fontFamily: S.font, color: C.text }}>
      {/* Back */}
      <button onClick={() => setPage('priority')} style={{
        background: 'transparent', border: `1px solid ${C.border}`,
        color: C.muted, borderRadius: 8, padding: '6px 14px',
        fontSize: 13, cursor: 'pointer', fontFamily: S.font, marginBottom: 24,
      }}>← Back to Queue</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: S.display }}>{school.name}</div>
            <Badge risk={school.risk} />
          </div>
          <div style={{ color: C.muted, fontSize: 14 }}>
            {school.block} Block · Gaya District · {school.students} enrolled students
          </div>
        </div>
        <button style={{
          background: C.accent, color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 20px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: S.font,
        }}>
          + Log Intervention
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Std V Reading" value={`${school.reading}%`} sub="vs 36% district avg" color={school.reading < 35 ? C.red : C.yellow} />
        <KpiCard label="Std V Arithmetic" value={`${school.arithmetic}%`} sub="vs 30% district avg" color={school.arithmetic < 28 ? C.red : C.yellow} />
        <KpiCard label="YoY Trend" value={`${school.trend > 0 ? '+' : ''}${school.trend}pp`} sub="Change since last ASER cycle" color={school.trend < 0 ? C.red : C.green} />
        <KpiCard label="Interventions" value={school.interventions} sub="Logged actions in last 12 months" color={C.cyan} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>5-Year Learning Trend</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Reading & arithmetic % over time</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} domain={[0, 60]} unit="%" />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="reading" stroke={C.accent} strokeWidth={2.5} dot={{ r: 4 }} name="Reading %" />
              <Line type="monotone" dataKey="arithmetic" stroke={C.cyan} strokeWidth={2.5} dot={{ r: 4 }} name="Arithmetic %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>School Health Radar</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>Multi-dimensional school assessment</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: C.muted, fontSize: 11 }} />
              <Radar dataKey="score" stroke={C.accent} fill={C.accent} fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Recommendation */}
      <Card style={{ background: `linear-gradient(135deg, ${C.accent}12, ${C.cyan}08)`, border: `1px solid ${C.accent}44` }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ fontSize: 32 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>AI Intervention Recommendation</div>
            <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
              Based on 3-year decline pattern and similarity to <strong style={{ color: C.text }}>14 comparable schools</strong> in Bihar,
              Metriq recommends: <strong style={{ color: C.accent }}>targeted teacher deployment for arithmetic</strong> + a
              <strong style={{ color: C.accent }}> structured reading circle program</strong> 3x/week.
              Schools with similar profiles improved by an average of <strong style={{ color: C.green }}>+8pp in 6 months</strong> after this combination.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── SCREEN 5: INTERVENTIONS TRACKER ─────────────────────────────────────────
const InterventionsScreen = () => (
  <div style={{ padding: 32, fontFamily: S.font, color: C.text }}>
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: S.display }}>Intervention Tracker</div>
      <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Log and monitor actions taken across schools in your district</div>
    </div>

    {/* Summary */}
    <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
      <KpiCard label="Total Interventions" value="4" sub="Logged this academic year" color={C.accent} />
      <KpiCard label="Successful" value="2" sub="Showed measurable improvement" color={C.green} />
      <KpiCard label="Pending Review" value="2" sub="Awaiting next assessment cycle" color={C.yellow} />
    </div>

    {/* Log Table */}
    <Card>
      <div style={{ fontWeight: 600, marginBottom: 20 }}>Action Log</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {['School', 'Intervention Type', 'Date', 'Outcome', 'Status'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INTERVENTIONS_LOG.map((row, i) => (
            <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : C.faint + '55' }}>
              <td style={{ padding: '14px 12px', fontSize: 14, fontWeight: 500 }}>{row.school}</td>
              <td style={{ padding: '14px 12px', color: C.muted, fontSize: 13 }}>{row.type}</td>
              <td style={{ padding: '14px 12px', color: C.muted, fontSize: 13, fontFamily: S.mono }}>{row.date}</td>
              <td style={{ padding: '14px 12px', fontSize: 13 }}>{row.outcome}</td>
              <td style={{ padding: '14px 12px' }}>
                <span style={{
                  background: row.status === 'success' ? C.green + '22' : C.yellow + '22',
                  color: row.status === 'success' ? C.green : C.yellow,
                  border: `1px solid ${row.status === 'success' ? C.green : C.yellow}44`,
                  borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                }}>
                  {row.status === 'success' ? '✓ Success' : '⏳ Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LandingPage = ({ onGetStarted }) => {
  const stats = [
    { value: '42.8%', label: 'Std V reading rate at COVID low (2022)', color: C.red },
    { value: '6 in 10', label: 'Bihar children cannot read grade-level text', color: C.yellow },
    { value: '20 yrs', label: 'of ASER data — still no district-level action tool', color: C.muted },
    { value: '+8pp', label: 'avg improvement when right intervention is applied', color: C.green },
  ];

  const features = [
    {
      icon: '🗺️',
      title: 'School Risk Heatmap',
      desc: 'Every school in your district classified as Critical, At Risk, Stagnant, or Recovering — updated each ASER cycle.',
    },
    {
      icon: '📋',
      title: 'Priority Action Queue',
      desc: 'AI-ranked list of schools that need intervention this month. Not a report — a to-do list for your district.',
    },
    {
      icon: '🤖',
      title: 'AI Intervention Recommender',
      desc: 'Based on what worked in similar schools across Bihar, Metriq recommends the highest-impact action for each school.',
    },
    {
      icon: '📈',
      title: 'Outcome Tracker',
      desc: 'Log every intervention and track whether it actually moved the needle by the next ASER survey.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: S.font, color: C.text, overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: C.bg + 'ee', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
      }}>
        <div style={{ fontFamily: S.display, fontSize: 26, color: C.accent, fontWeight: 900, letterSpacing: '-0.02em' }}>
          metriq
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Problem', 'Solution', 'Features'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              color: C.muted, fontSize: 14, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = C.text}
            onMouseLeave={e => e.target.style.color = C.muted}
            >{l}</a>
          ))}
          <button onClick={onGetStarted} style={{
            background: C.accent, color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 20px', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', fontFamily: S.font,
          }}>
            Sign In →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column',
        textAlign: 'center', padding: '120px 48px 80px',
        position: 'relative',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${C.border}55 1px, transparent 1px), linear-gradient(90deg, ${C.border}55 1px, transparent 1px)`,
          backgroundSize: '56px 56px', opacity: 0.3,
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 800, height: 800, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.accent}14 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 760 }}>
          {/* Eyebrow tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.accent + '18', border: `1px solid ${C.accent}44`,
            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
            <span style={{ color: C.accent, fontSize: 13, fontWeight: 500 }}>Built on 20 years of ASER data</span>
          </div>

          <h1 style={{
            fontFamily: S.display, fontSize: 60, fontWeight: 900,
            lineHeight: 1.1, margin: '0 0 24px',
            letterSpacing: '-0.03em',
          }}>
            India's education data<br />
            <span style={{ color: C.accent }}>has never become action.</span><br />
            Until now.
          </h1>

          <p style={{
            fontSize: 18, color: C.muted, lineHeight: 1.7,
            maxWidth: 580, margin: '0 auto 40px',
          }}>
            Metriq turns ASER district data into prioritised intervention lists for
            District Education Officers — telling them not just what's wrong,
            but exactly where to act first.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onGetStarted} style={{
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentLo})`,
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '14px 32px', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', fontFamily: S.font,
            }}>
              Access Your District →
            </button>
            <a href="#problem" style={{
              background: 'transparent', color: C.muted,
              border: `1px solid ${C.border}`, borderRadius: 10,
              padding: '14px 32px', fontSize: 16, fontWeight: 500,
              cursor: 'pointer', fontFamily: S.font, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center',
            }}>
              See the problem
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" style={{ padding: '100px 48px', background: C.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ color: C.accent, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>The Problem</span>
          </div>
          <h2 style={{ fontFamily: S.display, fontSize: 42, fontWeight: 900, margin: '0 0 16px', letterSpacing: '-0.02em', maxWidth: 680 }}>
            The data exists. The decisions don't follow.
          </h2>
          <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.7, maxWidth: 620, margin: '0 0 60px' }}>
            ASER has published state-level learning data every year since 2005.
            Every District Education Officer gets the PDF. They hold a meeting. Nothing changes.
            The problem was never a lack of data — it was a lack of a tool that turns data into decisions.
          </p>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderTop: `3px solid ${s.color}`,
                borderRadius: 12, padding: '28px 24px',
              }}>
                <div style={{ fontFamily: S.display, fontSize: 38, fontWeight: 900, color: s.color, marginBottom: 10 }}>{s.value}</div>
                <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ color: C.accent, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>The Solution</span>
          </div>
          <h2 style={{ fontFamily: S.display, fontSize: 42, fontWeight: 900, margin: '0 0 16px', letterSpacing: '-0.02em', maxWidth: 680 }}>
            Give every DEO a prioritised to-do list, not a report.
          </h2>
          <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.7, maxWidth: 620, margin: '0 0 60px' }}>
            Metriq ingests ASER data, classifies every school in your district by risk level,
            and recommends the highest-impact intervention — backed by what actually worked
            in comparable schools across Bihar.
          </p>

          {/* Flow diagram */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '32px 36px', overflowX: 'auto',
          }}>
            {[
              { icon: '📊', label: 'ASER Data Ingested' },
              { icon: '🤖', label: 'AI Classifies Schools' },
              { icon: '📋', label: 'Priority Queue Built' },
              { icon: '✅', label: 'DEO Takes Action' },
              { icon: '📈', label: 'Outcomes Tracked' },
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: C.accent + '18', border: `1px solid ${C.accent}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, margin: '0 auto 12px',
                  }}>{step.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, lineHeight: 1.4 }}>{step.label}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ color: C.border, fontSize: 22, padding: '0 8px', flexShrink: 0 }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 48px', background: C.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ color: C.accent, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Features</span>
          </div>
          <h2 style={{ fontFamily: S.display, fontSize: 42, fontWeight: 900, margin: '0 0 56px', letterSpacing: '-0.02em' }}>
            Built for how districts actually work.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '32px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + '66'}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</div>
                <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.accent}12 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: S.display, fontSize: 44, fontWeight: 900, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            Your district's data is waiting.
          </h2>
          <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
            Sign in with your district credentials to access your school risk dashboard and intervention queue.
          </p>
          <button onClick={onGetStarted} style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentLo})`,
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '16px 40px', fontSize: 17, fontWeight: 600,
            cursor: 'pointer', fontFamily: S.font,
          }}>
            Access Your District →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.border}`, padding: '28px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: S.display, fontSize: 20, color: C.accent, fontWeight: 900 }}>metriq</div>
        <div style={{ color: C.muted, fontSize: 13 }}>Powered by ASER data · Bihar Education Department · 2024</div>
      </footer>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('landing'); // 'landing' | 'login' | 'dashboard'
  const [page, setPage] = useState('overview');
  const [selectedSchool, setSelectedSchool] = useState(null);

  if (screen === 'landing') return <LandingPage onGetStarted={() => setScreen('login')} />;
  if (screen === 'login')   return <LoginScreen onLogin={() => setScreen('dashboard')} />;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <NavBar page={page} setPage={setPage} setSelectedSchool={setSelectedSchool} />
      {page === 'overview'      && <OverviewScreen setPage={setPage} setSelectedSchool={setSelectedSchool} />}
      {page === 'priority'      && <PriorityScreen setPage={setPage} setSelectedSchool={setSelectedSchool} />}
      {page === 'school-detail' && selectedSchool && <SchoolDetailScreen school={selectedSchool} setPage={setPage} />}
      {page === 'interventions' && <InterventionsScreen />}
    </div>
  );
}
