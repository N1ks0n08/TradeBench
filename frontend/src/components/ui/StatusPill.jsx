import React from 'react';

export default function StatusPill({ label, status }) {
  const isLive = status === 'Live';
  const isError = status === 'Error';
  const dotColor = isLive ? '#22c55e' : isError ? '#ef4444' : '#64748b';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: '#080b10',
      border: '1px solid #1e2530',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      color: '#94a3b8',
      fontFamily: 'IBM Plex Mono, monospace'
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: dotColor,
        display: 'inline-block'
      }} />
      <span>{label} · {status || 'Unknown'}</span>
    </div>
  );
}