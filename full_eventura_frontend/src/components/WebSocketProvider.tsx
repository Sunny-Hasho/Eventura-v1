import { useWebSocket } from '@/hooks/useWebSocket';

/**
 * WebSocket Provider Component
 * Initializes WebSocket connection when user is authenticated.
 * Place this inside AuthProvider and QueryClientProvider.
 */
export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize WebSocket connection
  useWebSocket();

  return <>{children}</>;
};

export default WebSocketProvider;
