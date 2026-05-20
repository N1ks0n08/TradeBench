import React, { useMemo } from 'react';
import { LADDER_LEVELS } from '../../constants';
import { fmt } from '../../utils/fmt';

export default function PriceLadder({ bid, ask }) {
  const hasData = bid !== null && ask !== null;

  const data = useMemo(() => {
    if (!hasData) return null;
    const mid = (bid + ask) / 2;
    const tickSize = 0.5; // Synthetic step spacing
    
    const asks = [];
    const bids = [];

    // Generate dynamic artificial sizes and prices
    for (let i = LADDER_LEVELS; i >= 1; i--) {
      asks.push({
        price: ask + (i - 1) * tickSize,
        size: Math.floor(Math.random() * 500) + 10,
        type: 'ask'
      });
    }

    for (let i = 1; i <= LADDER_LEVELS; i++) {
      bids.push({
        price: bid - (i - 1) * tickSize,
        size: Math.floor(Math.random() * 500) + 10,
        type: 'bid'
      });
    }

    const maxSize = Math.max(...asks.map(a => a.size), ...bids.map(b => b.size)) || 1;

    return { asks, bids, mid, maxSize };
  }, [bid, ask, hasData]);

  if (!hasData || !data) {
    return (
      <div style={{
        padding: '24px 12px',
        color: '#475569',
        fontSize: '11px',
        textAlign: 'center',
        fontFamily: 'IBM Plex Mono, monospace',
        background: '#0d1117'
      }}>
        Awaiting quote feed…
      </div>
    );
  }

  const { asks, bids, mid, maxSize } = data;

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr 1fr',
    alignItems: 'center',
    height: '20px',
    fontSize: '11px',
    position: 'relative',
    userSelect: 'none'
  };

  const cellStyle = {
    zIndex: 2,
    padding: '0 6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  };

  return (
    <div style={{
      background: '#0d1117',
      fontFamily: 'IBM Plex Mono, monospace',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Synthetic Asks */}
      {asks.map((level, idx) => {
        const fillPct = (level.size / maxSize) * 100;
        return (
          <div key={`ask-${idx}`} style={rowStyle}>
            <div style={{ ...cellStyle, gridColumn: 1, textAlign: 'left', color: '#475569' }} />
            <div style={{ ...cellStyle, gridColumn: 2, textAlign: 'center', color: '#22c55e' }}>{fmt(level.price, 2)}</div>
            <div style={{ ...cellStyle, gridColumn: 3, textAlign: 'right', color: '#94a3b8' }}>{level.size}</div>
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, 
              width: `${fillPct}%`, background: 'rgba(34, 197, 94, 0.06)', zIndex: 1
            }} />
          </div>
        );
      })}

      {/* Mid Price Divider Row */}
      <div style={{
        ...rowStyle,
        height: '22px',
        background: '#141a24',
        borderTop: '1px solid #1e2530',
        borderBottom: '1px solid #1e2530',
      }}>
        <div style={{ ...cellStyle, gridColumn: '1 / span 3', textAlign: 'center', color: '#94a3b8', fontSize: '10px' }}>
          MID: {fmt(mid, 2)}
        </div>
      </div>

      {/* Synthetic Bids */}
      {bids.map((level, idx) => {
        const fillPct = (level.size / maxSize) * 100;
        return (
          <div key={`bid-${idx}`} style={rowStyle}>
            <div style={{ ...cellStyle, gridColumn: 1, textAlign: 'left', color: '#94a3b8' }}>{level.size}</div>
            <div style={{ ...cellStyle, gridColumn: 2, textAlign: 'center', color: '#ef4444' }}>{fmt(level.price, 2)}</div>
            <div style={{ ...cellStyle, gridColumn: 3, textAlign: 'right', color: '#475569' }} />
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, 
              width: `${fillPct}%`, background: 'rgba(239, 68, 68, 0.06)', zIndex: 1
            }} />
          </div>
        );
      })}
    </div>
  );
}