import React from 'react';
import { fmt } from '../../utils/fmt';

export default function QuoteBlock({ bid, ask }) {
  const hasData = bid !== null && ask !== null;
  const spread = hasData ? ask - bid : null;
  const spreadBps = hasData && bid > 0 ? (spread / bid) * 10000 : null;

  return (
    <div style={{
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      background: '#0d1117',
      fontFamily: 'IBM Plex Mono, monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '2px' }}>BID</div>
          <div style={{ fontSize: '18px', color: '#ef4444', fontWeight: 'bold' }}>{fmt(bid, 2)}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '2px' }}>ASK</div>
          <div style={{ fontSize: '18px', color: '#22c55e', fontWeight: 'bold' }}>{fmt(ask, 2)}</div>
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#64748b',
        borderTop: '1px dashed #1e2530',
        paddingTop: '6px'
      }}>
        <span>Spread:</span>
        <span style={{ color: '#94a3b8' }}>
          ${fmt(spread, 2)} ({fmt(spreadBps, 1)} bps)
        </span>
      </div>
    </div>
  );
}