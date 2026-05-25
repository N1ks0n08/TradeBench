import { useState, useRef, useCallback } from 'react';
import { useReconnectingWS } from './useReconnectingWS';
import { WS_TRADE, MAX_CANDLES } from '../constants';

export function useTradeFeed(url = WS_TRADE) {
  const [completedCandles, setCompletedCandles] = useState([]);
  const [currentCandle, setCurrentCandle] = useState(null);

  const [sessionOpen, setSessionOpen] = useState(null);
  const [sessionHigh, setSessionHigh] = useState(null);
  const [sessionLow, setSessionLow] = useState(null);

  const [tradeCount, setTradeCount] = useState(0);
  const [lastPrice, setLastPrice] = useState(null);
  const [volume, setVolume] = useState(0);
  const [latency, setLatency] = useState(null);

  const currentCandleRef = useRef(null);

  const sessionOpenRef = useRef(null);
  const sessionHighRef = useRef(null);
  const sessionLowRef = useRef(null);

  const tradeCountRef = useRef(0);
  const volumeRef = useRef(0);

  // Called by Chart after history bootstrap so session stats reflect
  // the full historical window, not just the first live tick.
  const seedSession = useCallback(({ candles = [], open, high, low, volume = 0 }) => {
    if (candles.length > 0) {
      const trimmedCandles = candles.slice(-MAX_CANDLES);

      setCompletedCandles(trimmedCandles);

      const last = trimmedCandles[trimmedCandles.length - 1];

      if (last) {
        setLastPrice(last.close ?? null);
      }
    }

    sessionOpenRef.current = open;
    sessionHighRef.current = high;
    sessionLowRef.current = low;
    volumeRef.current = volume;

    setSessionOpen(open);
    setSessionHigh(high);
    setSessionLow(low);
    setVolume(volume);
  }, []);

  const onMessage = useCallback(data => {
    if (data.p == null || data.T == null) return;

    const price = parseFloat(data.p);
    const qty = parseFloat(data.q ?? 0);

    if (Number.isNaN(price)) return;

    const tradeTimeMs = parseInt(data.T, 10);
    const eventTimeMs = data.E ? parseInt(data.E, 10) : tradeTimeMs;

    if (Number.isNaN(tradeTimeMs)) return;

    setLatency(Math.max(0, Date.now() - eventTimeMs));

    const candleMinSec = Math.floor(tradeTimeMs / 60000) * 60;
    const tradeVolume = Number.isNaN(qty) ? 0 : qty; // BTC quantity, consistent with k[5] from history

    if (sessionOpenRef.current === null) {
      sessionOpenRef.current = price;
      setSessionOpen(price);
    }

    if (sessionHighRef.current === null || price > sessionHighRef.current) {
      sessionHighRef.current = price;
      setSessionHigh(price);
    }

    if (sessionLowRef.current === null || price < sessionLowRef.current) {
      sessionLowRef.current = price;
      setSessionLow(price);
    }

    tradeCountRef.current += 1;
    setTradeCount(tradeCountRef.current);

    volumeRef.current += tradeVolume;
    setVolume(volumeRef.current);

    setLastPrice(price);

    const prev = currentCandleRef.current;

    if (!prev || prev.time !== candleMinSec) {
      if (prev) {
        setCompletedCandles(cs => {
          const next = [...cs, prev];
          return next.length > MAX_CANDLES ? next.slice(-MAX_CANDLES) : next;
        });
      }

      const fresh = {
        time: candleMinSec,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: tradeVolume
      };

      currentCandleRef.current = fresh;
      setCurrentCandle({ ...fresh });
    } else {
      const updated = {
        ...prev,
        high: Math.max(prev.high, price),
        low: Math.min(prev.low, price),
        close: price,
        volume: (prev.volume ?? 0) + tradeVolume
      };

      currentCandleRef.current = updated;
      setCurrentCandle({ ...updated });
    }

    console.log('trade:', {
      p: data.p,
      q: data.q,
      qty,
      price,
      tradeVolume
    });
  }, []);

  const status = useReconnectingWS(url, onMessage);

  return {
    completedCandles,
    currentCandle,

    sessionOpen,
    sessionHigh,
    sessionLow,

    tradeCount,
    lastPrice,
    volume,
    latency,

    status,
    seedSession
  };
}