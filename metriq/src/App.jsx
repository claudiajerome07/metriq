import React, { useState } from 'react';
import { useAsyncData } from './hooks/useAsyncData';
import { 
  fetchSchools, 
  fetchDistrictTrend, 
  fetchDistrictAserTrend, 
  fetchSchoolTrend, 
  fetchInterventions, 
  fetchDistrictKpis 
} from './data/api';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBanner } from './components/ErrorBanner';
import { AssessmentModule } from './components/AssessmentModule';
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

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const riskColor = (r) => ({ critical: C.red, 'at-risk': C.yellow, stagnant: C.muted, recovering: C.green }[r] || C.muted);
const riskLabel = (r) => ({ critical: 'Critical', 'at-risk': 'At Risk', stagnant: 'Stagnant', recovering: 'Recovering' }[r] || r);

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const Card = ({ children, style = {}, ...props }) => (
  <div 
    {...props}
    style={{
      background: C.card, 
      border: `1px solid ${C.border}`,
      borderRadius: 12, 
      padding: 24, 
      ...style
    }}
  >
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
      { id: 'interventions', label: 'Interventions Log' },
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

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = () => { if (!user || !pass) return; setLoading(true); setTimeout(() => { setLoading(false); onLogin(); }, 800); };
  const inputStyle = { width: '100%', background: C.faint, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px', color: C.text, fontSize: 14, fontFamily: S.font, outline: 'none', boxSizing: 'border-box', marginBottom: 16 };
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: S.font }}>
      <Card style={{ width: 400, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: S.display, fontSize: 36, color: C.accent, fontWeight: 900 }}>metriq</div>
          <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>District Intelligence Portal</div>
        </div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>DISTRICT CODE</div>
        <input style={inputStyle} value={user} onChange={e => setUser(e.target.value)} placeholder="e.g. BR-GAYA-DEO" />
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>PASSWORD</div>
        <input style={inputStyle} type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••" />
        <button onClick={handleLogin} style={{ width: '100%', padding: '14px', background: C.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Sign in →' : 'Sign in →'}</button>
        <div style={{ marginTop: 24, fontSize: 12, color: C.muted, textAlign: 'center' }}>Demo: BR-GAYA-DEO | demo123</div>
      </Card>
    </div>
  );
};

// ─── DISTRICT OVERVIEW SCREEN ──────────────────────────────────────────────────
const OverviewScreen = ({ setPage, setSelectedSchool, schools, loading: sLoading, error: sError, refetchSchools }) => {
  const { data: monthlyTrend, loading: mLoading, error: mError, refetch: refetchMonthly } = useAsyncData(fetchDistrictTrend);
  const { data: aserTrend, loading: aLoading, error: aError, refetch: refetchAser } = useAsyncData(fetchDistrictAserTrend);
  const { data: kpi, loading: kLoading, error: kError, refetch: refetchKpi } = useAsyncData(fetchDistrictKpis);

  if (sLoading || mLoading || aLoading || kLoading) return <div style={{ padding: 40 }}><LoadingSpinner text="Building district analytics..." /></div>;
  if (sError || mError || aError || kError) return <div style={{ padding: 40 }}><ErrorBanner error={sError || mError || aError} onRetry={() => { refetchSchools(); refetchMonthly(); refetchAser(); refetchKpi(); }} /></div>;

  const critical = schools.filter(s => s.risk === 'critical').length;
  const atRisk = schools.filter(s => s.risk === 'at-risk').length;
  const recovering = schools.filter(s => s.risk === 'recovering').length;

  return (
    <div style={{ padding: 32, fontFamily: S.font, color: C.text }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: S.display }}>Gaya District Overview</div>
        <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Bihar · {schools.length} schools tracked · Data updated April 2026</div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Std V Reading" value={`${kpi.readingAvg}%`} sub="Current District Avg" color={C.yellow} />
        <KpiCard label="Std V Arithmetic" value={`${kpi.arithmeticAvg}%`} sub="Current District Avg" color={C.red} />
        <KpiCard label="Crisis Schools" value={critical} sub={`${atRisk} more at risk`} color={C.red} />
        <KpiCard label="Recovery Rate" value={kpi.recoveryRate} sub="Post-intervention gains" color={C.green} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Historical District Learning Trend (ASER)</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>2014—2024 Year-on-year district baseline</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={aserTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} domain={[0, 60]} unit="%" />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="reading" stroke={C.accent} strokeWidth={3} name="ASER Reading %" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="arithmetic" stroke={C.cyan} strokeWidth={3} name="ASER Arithmetic %" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>School Risk Heatmap</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Current risk distribution across all monitored blocks</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { status: 'Critical', count: critical, fill: C.red },
              { status: 'At Risk', count: atRisk, fill: C.yellow },
              { status: 'Stagnant', count: schools.filter(s=>s.risk==='stagnant').length, fill: C.muted },
              { status: 'Recovering', count: recovering, fill: C.green },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="status" stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
              <Bar dataKey="count" name="Schools" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Monthly Assessment Tracker (2026)</div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 24 }}>Real-time monthly monitoring aggregated from district archival forms</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} />
            <YAxis stroke={C.muted} tick={{ fill: C.muted, fontSize: 12 }} domain={[0, 100]} unit="%" />
            <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="reading" stroke={C.accent} strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: C.bg }} name="Monthly Reading %" />
            <Line type="monotone" dataKey="arithmetic" stroke={C.cyan} strokeWidth={4} dot={{ r: 6, strokeWidth: 2, fill: C.bg }} name="Monthly Arithmetic %" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      
      <div style={{ marginTop: 24, padding: 24, borderRadius: 12, background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(6,182,212,0.1) 100%)', border: `1px solid ${C.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 32 }}>🤖</div>
          <div style={{ fontSize: 14 }}><strong>AI Predictive Focus:</strong> Gaya district is currently seeing a reading uptake, but arithmetic scores remain stagnated at 34%. <strong>Priority 1:</strong> Primary schools in Rajpur block for arithmetic intervention.</div>
        </div>
        <button onClick={() => setPage('priority')} style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>Action View →</button>
      </div>
    </div>
  );
};

// ─── PRIORITY QUEUE SCREEN ─────────────────────────────────────────────────────
const PriorityScreen = ({ setPage, setSelectedSchool, schools, loading, error, refetch }) => {
  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text="Ranking priorities..." /></div>;
  if (error) return <div style={{ padding: 40 }}><ErrorBanner error={error} onRetry={refetch} /></div>;

  const sortedSchools = [...schools].sort((a, b) => {
    const weights = { critical: 1, 'at-risk': 2, stagnant: 3, recovering: 4 };
    return (weights[a.risk] || 5) - (weights[b.risk] || 5);
  });

  return (
    <div style={{ padding: 32, fontFamily: S.font, color: C.text }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: S.display }}>Intervention Priority Queue</div>
        <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Ranking based on real-time monthly archival assessments. Updated immediately upon data entry.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedSchools.map((school, i) => (
          <Card key={school.id} onClick={() => { setSelectedSchool(school); setPage('school-detail'); }} style={{ cursor: 'pointer', borderLeft: `4px solid ${riskColor(school.risk)}`, display: 'flex', alignItems: 'center', gap: 24, transition: 'all 0.15s' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: C.surface, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, fontFamily: S.mono }}>#{i+1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{school.name}</span>
                <Badge risk={school.risk} />
              </div>
              <div style={{ color: C.muted, fontSize: 13 }}>{school.block} Block · {school.students} students enrolled</div>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>READING</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: riskColor(school.risk), fontFamily: S.mono }}>{school.reading}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>ARITHMETIC</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: riskColor(school.risk), fontFamily: S.mono }}>{school.arithmetic}%</div>
              </div>
              <div style={{ color: C.muted, fontSize: 20, display: 'flex', alignItems: 'center' }}>›</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── SCHOOL DETAIL SCREEN ─────────────────────────────────────────────────────
const SchoolDetailScreen = ({ school, setPage, onAssessmentComplete }) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const { data: trend, loading, error, refetch: refetchTrend } = useAsyncData(() => fetchSchoolTrend(school.id), [school.id]);

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text={`Loading ${school.name}...`} /></div>;
  if (error) return <div style={{ padding: 40 }}><ErrorBanner error={error} onRetry={refetchTrend} /></div>;

  if (isArchiving) return (
    <AssessmentModule 
      school={school} 
      onComplete={() => { refetchTrend(); onAssessmentComplete(); setIsArchiving(false); }} 
      onCancel={() => setIsArchiving(false)} 
    />
  );

  const radarData = [
    { subject: 'Grade Reading', score: school.reading, full: 100 },
    { subject: 'Arithmetic Logic', score: school.arithmetic, full: 100 },
    { subject: 'Attendance', score: 72, full: 100 },
    { subject: 'Teacher Ratio', score: 58, full: 100 },
    { subject: 'Infrastructure', score: 45, full: 100 },
  ];

  return (
    <div style={{ padding: 32, fontFamily: S.font, color: C.text }}>
      <button onClick={() => setPage('priority')} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 24 }}>← Back to View</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: S.display }}>{school.name}</div>
            <Badge risk={school.risk} />
          </div>
          <div style={{ color: C.muted, fontSize: 15 }}>{school.block} Block · Gaya District · Managed as "{school.risk.toUpperCase()}" priority</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setIsArchiving(true)} style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}44`, borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>📥 Archive Monthly Data</button>
          <button style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>+ Log Intervention</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Reading Proficiency" value={`${school.reading}%`} sub="Current Proficiency" color={riskColor(school.risk)} />
        <KpiCard label="Arithmatic Skills" value={`${school.arithmetic}%`} sub="Current Proficiency" color={riskColor(school.risk)} />
        <KpiCard label="Students" value={school.students} sub="Enrolled in latest survey" color={C.cyan} />
        <Card style={{ flex: 1, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.faint }}>
           <div style={{ textAlign: 'center' }}><div style={{ fontSize: 12, color: C.muted }}>RECOVERY FORECAST</div><div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>6 MONTHS</div></div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 24 }}>Learning Trend History (Monthly)</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" stroke={C.muted} tick={{ fontSize: 12 }} />
              <YAxis stroke={C.muted} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
              <Line type="monotone" dataKey="readingScore" stroke={C.accent} strokeWidth={4} name="Reading" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="arithmeticScore" stroke={C.cyan} strokeWidth={4} name="Arithmetic" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>School Health Radar</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 24 }}>Multidimensional performance diagnostic</div>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: C.muted, fontSize: 11 }} />
                <Radar name="Metrics" dataKey="score" stroke={C.accent} fill={C.accent} fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card style={{ background: `linear-gradient(135deg, ${C.accent}12, transparent)` }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ fontSize: 32 }}>🤖</div>
          <div style={{ fontSize: 14 }}><strong>AI Intervention Strategy:</strong> Based on the {Math.abs(school.trend)}pp decline in {school.risk === 'critical' ? 'Reading' : 'Arithmetic'}, Metriq recommends: <strong>Intensive Teacher Resource Kit #4</strong> and <strong>Bi-Weekly Monitoring</strong>. Schools following this path improved scores by 8% in 12 weeks.</div>
        </div>
      </Card>
    </div>
  );
};

// ─── INTERVENTIONS LOG SCREEN ─────────────────────────────────────────────────
const InterventionsScreen = () => {
  const { data: interventions, loading, error, refetch } = useAsyncData(fetchInterventions);

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text="Fetching log..." /></div>;
  if (error) return <div style={{ padding: 40 }}><ErrorBanner error={error} onRetry={refetch} /></div>;

  return (
    <div style={{ padding: 32, fontFamily: S.font, color: C.text }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: S.display }}>Intervention Action Log</div>
        <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Track all educational actions taken by District Education Officers across monitored schools.</div>
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: C.faint }}>
              <th style={{ padding: '16px 24px', color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>SCHOOL</th>
              <th style={{ padding: '16px 24px', color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>INTERVENTION TYPE</th>
              <th style={{ padding: '16px 24px', color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>DATE LOGGED</th>
              <th style={{ padding: '16px 24px', color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {interventions.map((i, idx) => (
              <tr key={i.id} style={{ borderBottom: idx === interventions.length - 1 ? 'none' : `1px solid ${C.border}`, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = C.faint} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px 24px', fontWeight: 600, fontSize: 14 }}>{i.school}</td>
                <td style={{ padding: '16px 24px', color: C.text, fontSize: 14 }}>{i.type}</td>
                <td style={{ padding: '16px 24px', color: C.muted, fontSize: 13, fontFamily: S.mono }}>{i.date}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ background: i.status === 'success' ? C.green + '22' : C.yellow + '22', color: i.status === 'success' ? C.green : C.yellow, padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{i.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LandingPage = ({ onGetStarted }) => {
  const stats = [
    { label: 'Historical Baseline', value: '20 Years', desc: 'ASER district data (2014-2024)' },
    { label: 'Critical Threshold', value: '< 35%', desc: 'Immediate intervention trigger' },
    { label: 'District Reach', value: '500+', desc: 'Schools tracked in real-time' },
  ];

  const features = [
    { title: 'Data Archival', icon: '📥', desc: 'Direct entry for monthly assessment metrics.' },
    { title: 'Risk Scoring', icon: '📈', desc: 'Automated ranking for critical/at-risk schools.' },
    { title: 'AI Tasks', icon: '🤖', desc: 'Predictive difficulty preview for classrooms.' },
    { title: 'Action Logs', icon: '📝', desc: 'Transparent history of DEO interventions.' },
  ];

  return (
    <div style={{ background: C.bg, fontFamily: S.font, color: C.text }}>
      {/* Hero */}
      <div style={{ minHeight: '85vh', padding: '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 50% 50%, ${C.accent}11 0%, transparent 70%)` }} />
        <div style={{ position: 'relative', maxWidth: 800 }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', background: C.accent + '22', borderRadius: 20, color: C.accent, fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: '0.05em' }}>
            BEYOND ASER: REAL-TIME MONITORING
          </div>
          <h1 style={{ fontFamily: S.display, fontSize: 80, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.03em', lineHeight: 1 }}>metriq</h1>
          <p style={{ color: C.muted, fontSize: 24, lineHeight: 1.5, marginBottom: 44 }}>Transforming decades of educational data into daily district action. Data archival, risk analytics, and AI-driven monitoring for DEOs.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button onClick={onGetStarted} style={{ padding: '18px 48px', background: C.accent, color: '#fff', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 24px ${C.accent}44` }}>Access Your District →</button>
          </div>
        </div>
      </div>

      {/* Product Details: Problem/Solution */}
      <div style={{ padding: '80px 40px', background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginBottom: 100 }}>
            <div>
              <div style={{ color: C.red, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>THE CHALLENGE</div>
              <h2 style={{ fontFamily: S.display, fontSize: 36, marginBottom: 20 }}>Learning is Stagnated</h2>
              <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.7 }}>With 20 years of historical data from 2014-2024, our district remains at a critical threshold. Static yearly reporting isn't enough to drive monthly improvement.</p>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {stats.map(s => (
                <div key={s.label} style={{ flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: S.display }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 100 }}>
            <div style={{ color: C.accent, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>THE SOLUTION</div>
            <h2 style={{ fontFamily: S.display, fontSize: 48, marginBottom: 60 }}>Modern Archival Workflow</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {features.map(f => (
                <Card key={f.title} style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ fontSize: 32, marginBottom: 20 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '100px 40px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 14, color: C.muted }}>metriq Intelligence · Bihar Education Department · 2026 Monthly Dashboard</div>
      </div>
    </div>
  );
};

// ─── MAIN APP COMPONENT ───────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [page, setPage] = useState('overview');
  const [selectedSchool, setSelectedSchool] = useState(null);

  const { 
    data: schools, 
    loading: schoolsLoading, 
    error: schoolsError, 
    refetch: refetchSchools 
  } = useAsyncData(fetchSchools);

  if (screen === 'landing') return <LandingPage onGetStarted={() => setScreen('login')} />;
  if (screen === 'login')   return <LoginScreen onLogin={() => setScreen('dashboard')} />;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <NavBar page={page} setPage={setPage} setSelectedSchool={setSelectedSchool} />
      {page === 'overview' && (
        <OverviewScreen 
          setPage={setPage} 
          setSelectedSchool={setSelectedSchool} 
          schools={schools} 
          loading={schoolsLoading} 
          error={schoolsError} 
          refetchSchools={refetchSchools} 
        />
      )}
      {page === 'priority' && (
        <PriorityScreen 
          setPage={setPage} 
          setSelectedSchool={setSelectedSchool} 
          schools={schools} 
          loading={schoolsLoading} 
          error={schoolsError} 
          refetch={refetchSchools} 
        />
      )}
      {page === 'school-detail' && selectedSchool && (
        <SchoolDetailScreen 
          school={selectedSchool} 
          setPage={setPage} 
          onAssessmentComplete={refetchSchools} 
        />
      )}
      {page === 'interventions' && <InterventionsScreen />}
    </div>
  );
}
