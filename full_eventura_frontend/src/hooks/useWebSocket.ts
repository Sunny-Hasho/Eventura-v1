import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface DashboardUpdate {
  entityType: 'USER' | 'REQUEST' | 'PROVIDER' | 'PITCH' | 'PAYMENT';
  action: string;
  timestamp: number;
}

/**
 * Custom hook for WebSocket connection using STOMP over SockJS.
 * Automatically subscribes to:
 * - User-specific notifications (/user/queue/notifications)
 * - Dashboard updates for admins (/topic/dashboard-updates)
 * 
 * Invalidates React Query cache when updates are received.
 */
export const useWebSocket = () => {
  const { authState } = useAuth();
  const { isAuthenticated, token, user } = authState;
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!isAuthenticated || !token || isConnectedRef.current) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        // Use SockJS for fallback support
        return new SockJS(`${BACKEND_URL}/ws`);
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: function (str) {
        if (import.meta.env.DEV) {
          console.log('[WebSocket]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('[WebSocket] Connected');
      isConnectedRef.current = true;

      // Subscribe to user-specific notifications
      client.subscribe('/user/queue/notifications', (message: IMessage) => {
        try {
          const notification = JSON.parse(message.body);
          console.log('[WebSocket] Received notification:', notification);
          
          // Invalidate notification queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        } catch (e) {
          console.error('[WebSocket] Failed to parse notification:', e);
        }
      });

      // Subscribe to dashboard updates (for admins and all users)
      client.subscribe('/topic/dashboard-updates', (message: IMessage) => {
        try {
          const update: DashboardUpdate = JSON.parse(message.body);
          console.log('[WebSocket] Dashboard update:', update);
          
          // Invalidate relevant queries based on entity type
          switch (update.entityType) {
            case 'USER':
              queryClient.invalidateQueries({ queryKey: ['users'] });
              queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
              break;
            case 'REQUEST':
              queryClient.invalidateQueries({ queryKey: ['requests'] });
              queryClient.invalidateQueries({ queryKey: ['myRequests'] });
              queryClient.invalidateQueries({ queryKey: ['allRequests'] });
              queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
              break;
            case 'PROVIDER':
              queryClient.invalidateQueries({ queryKey: ['providers'] });
              queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
              break;
            case 'PITCH':
              queryClient.invalidateQueries({ queryKey: ['pitches'] });
              queryClient.invalidateQueries({ queryKey: ['requestPitches'] });
              break;
            case 'PAYMENT':
              queryClient.invalidateQueries({ queryKey: ['payments'] });
              queryClient.invalidateQueries({ queryKey: ['earnings'] });
              break;
          }
        } catch (e) {
          console.error('[WebSocket] Failed to parse dashboard update:', e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP error:', frame.headers['message']);
      console.error('[WebSocket] Details:', frame.body);
    };

    client.onWebSocketClose = () => {
      console.log('[WebSocket] Connection closed');
      isConnectedRef.current = false;
    };

    client.activate();
    clientRef.current = client;
  }, [isAuthenticated, token, queryClient]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      isConnectedRef.current = false;
      console.log('[WebSocket] Disconnected');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    disconnect,
    reconnect: connect,
  };
};

export default useWebSocket;
