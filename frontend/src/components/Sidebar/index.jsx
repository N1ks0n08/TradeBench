import React from 'react';
import PanelHeader from '../ui/PanelHeader';
import QuoteBlock from './QuoteBlock';
import PriceLadder from './PriceLadder';
import SessionPanel from './SessionPanel';

export default function Sidebar({ bid, ask, sessionOpen, sessionHigh, sessionLow, tradeCount }) {
  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      background: '#0d1117',
      borderRight: '1px solid #1e2530',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <PanelHeader>Ticker Quote</PanelHeader>
      <QuoteBlock bid={bid} ask={ask} />

      <PanelHeader>Order Book Depth</PanelHeader>
      <PriceLadder bid={bid} ask={ask} />

      {/* Push session panel to bottom */}
      <div style={{ flex: 1 }} />

      <PanelHeader>Session Metrics</PanelHeader>
      <SessionPanel
        open={sessionOpen}
        high={sessionHigh}
        low={sessionLow}
        tradeCount={tradeCount}
      />
    </div>
  );
}