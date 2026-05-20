import { useState, useEffect, useRef, useCallback } from 'react';
import { RECONNECT_BASE, RECONNECT_MAX } from '../constants';

export function useReconnectingWS(url, onMessage) {
  const [status, setStatus]  = useState('Connecting');
  const wsRef      = useRef(null);
  const retryTimer = useRef(null);
  const retryDelay = useRef(RECONNECT_BASE);
  const dead       = useRef(false);

  const connect = useCallback(() => {
    if (dead.current) return;
    setStatus('Connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('Live');
      retryDelay.current = RECONNECT_BASE;
    };

    ws.onmessage = e => {
      try { onMessage(JSON.parse(e.data)); } catch { /* malformed frame */ }
    };

    ws.onerror = () => setStatus('Error');

    ws.onclose = () => {
      if (dead.current) return;
      setStatus('Reconnecting');
      retryTimer.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, RECONNECT_MAX);
        connect();
      }, retryDelay.current);
    };
  }, [url, onMessage]);

  useEffect(() => {
    dead.current = false;
    connect();
    return () => {
      dead.current = true;
      clearTimeout(retryTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return status;
}