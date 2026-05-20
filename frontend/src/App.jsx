import { useState, useEffect } from 'react';
import { useTicker }    from './hooks/useTicker';
import { useTradeFeed } from './hooks/useTradeFeed';
import TopBar  from './components/TopBar';
import Sidebar from './components/Sidebar';
import Chart   from './components/Chart';

export default function App() {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const tick = () =>
      setUtcTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { bid, ask, status: tickerStatus } = useTicker();

  const {
    completedCandles,
    currentCandle,
    sessionOpen,
    sessionHigh,
    sessionLow,
    tradeCount,
    latency,
    status: tradeStatus,
    seedSession,
  } = useTradeFeed();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TopBar
        tickerStatus={tickerStatus}
        tradeStatus={tradeStatus}
        utcTime={utcTime}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          bid={bid}
          ask={ask}
          sessionOpen={sessionOpen}
          sessionHigh={sessionHigh}
          sessionLow={sessionLow}
          tradeCount={tradeCount}
        />
        <Chart
          completedCandles={completedCandles}
          currentCandle={currentCandle}
          latency={latency}
          onSessionSeed={seedSession}
        />
      </div>
    </div>
  );
}