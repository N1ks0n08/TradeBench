import React from 'react';
import { fmt } from '../../utils/fmt';

export default function StatsBar({ lastPrice, openPrice, volume, candleCount, latency }) {
  let changePct = null;
  if (lastPrice != null && openPrice != null && openPrice > 0) {
    changePct = ((lastPrice - openPrice) / openPrice) * 100;
  }

  const changeColor = changePct >= 0 ? '#22c55e' : '#ef4444';
  const changeSign = changePct > 0 ? '+' : '';

  const formatVolume = (v) => {
    if (v == null || isNaN(v)) return '—';
    if (v >= 1e9) return `${fmt(v / 1e9, 2)}B`;
    if (v >= 1e6) return `${fmt(v / 1e6, 2)}M`;
    if (v >= 1e3) return `${fmt(v / 1e3, 1)}K`;
    return fmt(v, 2);
  };

  const cellStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 12px',
    borderRight: '1px solid #1e2530'
  };

  const labelStyle = {
    fontSize: '9px',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: '2px'
  };

  const valueStyle = {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500'
  };

  return (
    <div style={{
      height: '36px',
      background: '#0d1117',
      borderTop: '1px solid #1e2530',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      fontFamily: 'IBM Plex Mono, monospace',
      boxSizing: 'border-box'
    }}>
      <div style={cellStyle}>
        <div style={labelStyle}>Last Trade</div>
        <div style={{ ...valueStyle, color: '#e2e8f0' }}>{fmt(lastPrice, 2)}</div>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Change %</div>
        <div style={{ ...valueStyle, color: changeColor }}>
          {changePct != null ? `${changeSign}${fmt(changePct, 2)}%` : '—'}
        </div>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Volume Est</div>
        <div style={valueStyle}>{formatVolume(volume)}</div>
      </div>
      <div style={cellStyle}>
        <div style={labelStyle}>Candles Built</div>
        <div style={valueStyle}>{fmt(candleCount, 0)}</div>
      </div>
      <div style={{ ...cellStyle, borderRight: 'none' }}>
        <div style={labelStyle}>Feed Latency</div>
        <div style={{ ...valueStyle, color: latency > 250 ? '#ef4444' : '#94a3b8' }}>
          {latency != null ? `${latency}ms` : '—'}
        </div>
      </div>
    </div>
  );
}