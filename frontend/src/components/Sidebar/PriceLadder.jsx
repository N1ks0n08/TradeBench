import React, { useMemo } from 'react';
import { LADDER_LEVELS } from '../../constants';
import { fmt } from '../../utils/fmt';

export default function PriceLadder({ bids, asks }) {
  const hasData = bids?.length > 0 && asks?.length > 0;

  const data = useMemo(() => {
    if (!hasData) return null;

    // Data comes in as [price_string, qty_string] pairs
    const parsedAsks = asks
      .slice(0, LADDER_LEVELS)
      .map(([p, q]) => ({ price: parseFloat(p), size: parseFloat(q), type: 'ask' }))
      .sort((a, b) => a.price - b.price); // lowest ask at bottom (closest to mid)

    const parsedBids = bids
      .slice(0, LADDER_LEVELS)
      .map(([p, q]) => ({ price: parseFloat(p), size: parseFloat(q), type: 'bid' }))
      .sort((a, b) => b.price - a.price); // highest bid at top (closest to mid)

    const mid = (parsedBids[0].price + parsedAsks[0].price) / 2;

    const maxSize = Math.max(
      ...parsedAsks.map(a => a.size),
      ...parsedBids.map(b => b.size)
    ) || 1;

    return { parsedAsks, parsedBids, mid, maxSize };
  }, [bids, asks, hasData]);

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
        Awaiting depth feed…
      </div>
    );
  }

  const { parsedAsks, parsedBids, mid, maxSize } = data;

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
      {/* Asks — lowest at bottom, closest to mid */}
      {[...parsedAsks].reverse().map((level, idx) => {
        const fillPct = (level.size / maxSize) * 100;
        return (
          <div key={`ask-${idx}`} style={rowStyle}>
            <div style={{ ...cellStyle, gridColumn: 1, textAlign: 'left', color: '#475569' }} />
            <div style={{ ...cellStyle, gridColumn: 2, textAlign: 'center', color: '#22c55e' }}>
              {fmt(level.price, 2)}
            </div>
            <div style={{ ...cellStyle, gridColumn: 3, textAlign: 'right', color: '#94a3b8' }}>
              {level.size.toFixed(4)}
            </div>
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: `${fillPct}%`, background: 'rgba(34, 197, 94, 0.06)', zIndex: 1
            }} />
          </div>
        );
      })}

      {/* Mid Price Divider */}
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

      {/* Bids — highest at top, closest to mid */}
      {parsedBids.map((level, idx) => {
        const fillPct = (level.size / maxSize) * 100;
        return (
          <div key={`bid-${idx}`} style={rowStyle}>
            <div style={{ ...cellStyle, gridColumn: 1, textAlign: 'left', color: '#94a3b8' }}>
              {level.size.toFixed(4)}
            </div>
            <div style={{ ...cellStyle, gridColumn: 2, textAlign: 'center', color: '#ef4444' }}>
              {fmt(level.price, 2)}
            </div>
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