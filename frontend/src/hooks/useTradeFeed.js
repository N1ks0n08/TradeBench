import { useState, useRef, useCallback } from 'react';
import { useReconnectingWS } from './useReconnectingWS';
import { WS_TRADE, MAX_CANDLES } from '../constants';

export function useTradeFeed(url = WS_TRADE) {
  const [completedCandles, setCompletedCandles] = useState([]);
  const [currentCandle,    setCurrentCandle]    = useState(null);
  const [sessionOpen,      setSessionOpen]      = useState(null);
  const [sessionHigh,      setSessionHigh]      = useState(null);
  const [sessionLow,       setSessionLow]       = useState(null);
  const [tradeCount,       setTradeCount]       = useState(0);
  const [lastPrice,        setLastPrice]        = useState(null);
  const [volume,           setVolume]           = useState(0);
  const [latency,          setLatency]          = useState(null);

  const currentCandleRef = useRef(null);
  const sessionOpenRef   = useRef(null);
  const sessionHighRef   = useRef(null);
  const sessionLowRef    = useRef(null);
  const tradeCountRef    = useRef(0);
  const volumeRef        = useRef(0);

  // Called by Chart after history bootstrap so session stats reflect
  // the full historical window, not just the first live tick.
  const seedSession = useCallback(({ open, high, low, volume = 0 }) => {
    if (sessionOpenRef.current === null) {
      sessionOpenRef.current = open;
      setSessionOpen(open);
    }
    if (sessionHighRef.current === null || high > sessionHighRef.current) {
      sessionHighRef.current = high;
      setSessionHigh(high);
    }
    if (sessionLowRef.current === null || low < sessionLowRef.current) {
      sessionLowRef.current = low;
      setSessionLow(low);
    }
    volumeRef.current = volume;
    setVolume(volume);
  }, []);

  const onMessage = useCallback(data => {
    if (!data.p || !data.T) return;

    const price       = parseFloat(data.p);
    const qty         = parseFloat(data.q ?? 0);
    const tradeTimeMs = parseInt(data.T);
    const sentMs      = data.E ? parseInt(data.E) : tradeTimeMs;
    setLatency(Math.max(0, Date.now() - tradeTimeMs));

    const candleMinSec = Math.floor(tradeTimeMs / 60000) * 60;

    if (sessionOpenRef.current === null) { sessionOpenRef.current = price; setSessionOpen(price); }
    if (sessionHighRef.current === null || price > sessionHighRef.current) { sessionHighRef.current = price; setSessionHigh(price); }
    if (sessionLowRef.current  === null || price < sessionLowRef.current)  { sessionLowRef.current  = price; setSessionLow(price);  }

    tradeCountRef.current += 1; setTradeCount(tradeCountRef.current);
    volumeRef.current += qty * price; setVolume(volumeRef.current);
    setLastPrice(price);

    const prev = currentCandleRef.current;
    if (!prev || prev.time !== candleMinSec) {
      if (prev) {
        setCompletedCandles(cs => {
          const next = [...cs, prev];
          return next.length > MAX_CANDLES ? next.slice(-MAX_CANDLES) : next;
        });
      }
      const fresh = { time: candleMinSec, open: price, high: price, low: price, close: price };
      currentCandleRef.current = fresh;
      setCurrentCandle({ ...fresh });
    } else {
      const updated = { ...prev, high: Math.max(prev.high, price), low: Math.min(prev.low, price), close: price };
      currentCandleRef.current = updated;
      setCurrentCandle({ ...updated });
    }
    console.log('trade:', { p: data.p, q: data.q, qty, price });

  }, []);

  const status = useReconnectingWS(url, onMessage);
  return {
    completedCandles, currentCandle,
    sessionOpen, sessionHigh, sessionLow,
    tradeCount, lastPrice, volume, latency,
    status, seedSession,
  };
}