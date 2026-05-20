import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import StatsBar from './StatsBar';
import { fmt } from '../../utils/fmt';
import { HISTORY_URL } from '../../constants';

export default function Chart({ completedCandles, currentCandle, latency, onSessionSeed }) {
  const chartContainerRef = useRef(null);
  const chartRef          = useRef(null);
  const seriesRef         = useRef(null);

  const [activeTf,  setActiveTf]  = useState('1m');
  const [ohlcText,  setOhlcText]  = useState('O: —  H: —  L: —  C: —');

  // ── Initialize chart once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width:  chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background:  { color: '#080b10' },
        textColor:   '#475569',
        fontSize:    10,
        fontFamily:  'IBM Plex Mono, monospace',
      },
      grid: {
        vertLines: { color: '#1a2535' },
        horzLines: { color: '#1a2535' },
      },
      timeScale: {
        borderColor:    '#1e2530',
        timeVisible:    true,
        secondsVisible: false,
      },
      rightPriceScale: { borderColor: '#1e2530' },
      crosshair: {
        vertLine: { labelBackgroundColor: '#0d1117' },
        horzLine: { labelBackgroundColor: '#0d1117' },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:       '#22c55e',
      downColor:     '#ef4444',
      borderVisible: false,
      wickUpColor:   '#22c55e',
      wickDownColor: '#ef4444',
    });

    chart.subscribeCrosshairMove(param => {
      if (!param?.time) return;
      const d = param.seriesData.get(candleSeries);
      if (d) setOhlcText(`O: ${fmt(d.open)}  H: ${fmt(d.high)}  L: ${fmt(d.low)}  C: ${fmt(d.close)}`);
    });

    chartRef.current  = chart;
    seriesRef.current = candleSeries;

    // ── Bootstrap historical candles + seed session stats ──────────────────
    fetch(HISTORY_URL)
      .then(res => res.json())
      .then(data => {
        if (!data?.length || !seriesRef.current) return;

        seriesRef.current.setData(data);

        const last = data[data.length - 1];
        setOhlcText(`O: ${fmt(last.open)}  H: ${fmt(last.high)}  L: ${fmt(last.low)}  C: ${fmt(last.close)}`);

        // Seed session O/H/L and accumulated volume from history window
        const open        = data[0].open;
        const high        = Math.max(...data.map(c => c.high));
        const low         = Math.min(...data.map(c => c.low));
        const totalVolume = data.reduce((sum, c) => sum + (c.volume ?? c.v ?? c.vol ?? 0), 0);        
        
        onSessionSeed?.({ open, high, low, volume: totalVolume });
      })
      .catch(err => console.error('History fetch failed:', err));

    // ── ResizeObserver ─────────────────────────────────────────────────────
    const ro = new ResizeObserver(entries => {
      if (!entries.length || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  // ── Live candle updates ────────────────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !currentCandle) return;
    seriesRef.current.update(currentCandle);
    setOhlcText(
      `O: ${fmt(currentCandle.open)}  H: ${fmt(currentCandle.high)}  L: ${fmt(currentCandle.low)}  C: ${fmt(currentCandle.close)}`
    );
  }, [currentCandle]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const latestCandle = currentCandle ?? completedCandles.at(-1) ?? null;
  const firstCandle  = completedCandles[0] ?? currentCandle ?? null;

  const tfBtnStyle = tf => ({
    background:   activeTf === tf ? '#1e2530' : 'transparent',
    border:       'none',
    color:        activeTf === tf ? '#3b82f6' : '#475569',
    fontSize:     '11px',
    fontFamily:   'IBM Plex Mono, monospace',
    padding:      '2px 8px',
    cursor:       'pointer',
    borderRadius: '3px',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{
        height: '28px', background: '#0d1117', borderBottom: '1px solid #1e2530',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', flexShrink: 0, userSelect: 'none',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['1m', '5m', '15m', '1h'].map(tf => (
            <button key={tf} onClick={() => setActiveTf(tf)} style={tfBtnStyle(tf)}>{tf}</button>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'IBM Plex Mono, monospace' }}>
          {ohlcText}
        </div>
      </div>

      {/* Chart canvas */}
      <div ref={chartContainerRef} style={{ flex: 1, background: '#080b10', overflow: 'hidden' }} />

      {/* Stats strip */}
      <StatsBar
        lastPrice={latestCandle?.close ?? null}
        openPrice={firstCandle?.open   ?? null}
        candleCount={completedCandles.length + (currentCandle ? 1 : 0)}
        latency={latency}
      />
    </div>
  );
}