import React from 'react';
import { fmt } from '../../utils/fmt';

export default function SessionPanel({ open, high, low, tradeCount }) {
  const metricRow = (label, value, valueColor = '#94a3b8') => (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-between',
      alignItems: 'center',
      height: '24px',
      fontSize: '11px',
      justifyContent: 'space-between'
    }}>
      <span style={{ color: '#475569' }}>{label}</span>
      <span style={{ color: valueColor, fontWeight: '500' }}>{value}</span>
    </div>
  );

  return (
    <div style={{
      padding: '8px 12px',
      background: '#0d1117',
      fontFamily: 'IBM Plex Mono, monospace',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {metricRow('Open', fmt(open, 2))}
      {metricRow('High', fmt(high, 2), '#22c55e')}
      {metricRow('Low', fmt(low, 2), '#ef4444')}
      {metricRow('Trades', fmt(tradeCount, 0))}
    </div>
  );
}