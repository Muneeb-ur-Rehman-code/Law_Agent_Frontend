'use client';

import { useState, useEffect, useRef } from 'react';
import { getAccessToken } from './auth';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export interface WebSocketMessage {
  type: string;
  timestamp?: string;
  pending_approvals?: number;
  new_actions?: any[];
  deadline_alerts?: any[];
  [key: string]: any;
}

export const useDashboardWebSocket = () => {
  const [data, setData] = useState<WebSocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const connect = () => {
      try {
        const ws = new WebSocket(`${WS_URL}/ws/dashboard?token=${encodeURIComponent(token)}`);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setData(parsed);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Auto reconnect after 3 seconds
          setTimeout(connect, 3000);
        };

        socketRef.current = ws;
      } catch (err) {
        console.error('WebSocket connection setup failed:', err);
      }
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return { data, isConnected };
};
