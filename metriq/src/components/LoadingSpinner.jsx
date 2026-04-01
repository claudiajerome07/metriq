import React from 'react';

const C = {
  card:     '#141d2e',
  border:   '#1e2d45',
  faint:    '#1e293b',
  accent:   '#3b82f6',
};

export const LoadingSpinner = ({ text = "Loading ASER data..." }) => {
  return (
    <div style={{
      width: '100%',
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 32,
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: `3px solid ${C.faint}`,
        borderTopColor: C.accent,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 16
      }} />
      <div style={{ color: '#64748b', fontSize: 14 }}>{text}</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
