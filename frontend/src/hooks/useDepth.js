import { useState, useCallback } from 'react';
import { useReconnectingWS } from './useReconnectingWS';
import { WS_DEPTH } from '../constants';

export function useDepth(url = WS_DEPTH) {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);

  const onMessage = useCallback(data => {
    if (data.bids) setBids(data.bids);
    if (data.asks) setAsks(data.asks);
  }, []);

  const status = useReconnectingWS(url, onMessage);
  return { bids, asks, status };
}