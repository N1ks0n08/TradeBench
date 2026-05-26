import React from 'react';
import StatusPill from './ui/StatusPill';

export default function TopBar({ tickerStatus, tradeStatus, depthStatus, utcTime }) {
  const pillWrapperStyle = {
    background: '#080b10',
    border: '1px solid #1e2530',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#94a3b8'
  };

  return (
    <div style={{
      height: '32px',
      background: '#0d1117',
      borderBottom: '1px solid #1e2530',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      boxSizing: 'border-box',
      fontFamily: 'IBM Plex Mono, monospace',
      userSelect: 'none'
    }}>
      {/* Left side Metadata Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.02em' }}>
          Trade<span style={{ color: '#3b82f6' }}>Bench</span>
        </div>
        <div style={pillWrapperStyle}>
          BTC/USDT <span style={{ color: '#475569', margin: '0 3px' }}>·</span> Binance
        </div>
        <div style={{ ...pillWrapperStyle, color: '#64748b' }}>
          {utcTime || '00:00:00 UTC'}
        </div>
      </div>

      {/* Right side Network Feeds Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusPill label="TICK" status={tickerStatus} />
        <StatusPill label="FEED" status={tradeStatus} />
        <StatusPill label="DEPTH" status={depthStatus} />
      </div>
    </div>
  );
}