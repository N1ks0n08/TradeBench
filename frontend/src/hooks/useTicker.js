import { useState, useCallback } from 'react';
import { useReconnectingWS } from './useReconnectingWS';
import { WS_TICKER } from '../constants';

export function useTicker(url = WS_TICKER) {
  const [bid, setBid] = useState(null);
  const [ask, setAsk] = useState(null);

  const onMessage = useCallback(data => {
    if (data.b) setBid(parseFloat(data.b));
    if (data.a) setAsk(parseFloat(data.a));
  }, []);

  const status = useReconnectingWS(url, onMessage);
  return { bid, ask, status };
}