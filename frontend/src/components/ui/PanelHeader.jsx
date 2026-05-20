import React from 'react';

export default function PanelHeader({ children }) {
  return (
    <div style={{
      fontSize: '10px',
      color: '#475569',
      letterSpacing: '0.08em',
      padding: '7px 12px 5px',
      borderBottom: '1px solid #1e2530',
      background: '#080b10',
      textTransform: 'uppercase',
      fontWeight: '600',
      fontFamily: 'IBM Plex Mono, monospace'
    }}>
      {children}
    </div>
  );
}