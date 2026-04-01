import React from 'react';

const C = {
  card:     '#141d2e',
  border:   '#1e2d45',
  red:      '#ef4444',
  text:     '#f1f5f9',
};

export const ErrorBanner = ({ error, onRetry }) => {
  return (
    <div style={{
      width: '100%',
      background: `${C.red}15`,
      border: `1px solid ${C.red}44`,
      borderRadius: 12,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: C.text,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Failed to load data</div>
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>{error}</div>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: C.red,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Try Again
        </button>
      )}
    </div>
  );
};
