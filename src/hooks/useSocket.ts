import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.API_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

/**
 * Returns a singleton Socket.io client instance.
 * The socket connects lazily on first call and reuses the connection.
 */
export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socketInstance;
}

/**
 * Hook to connect the socket and auto-disconnect on unmount.
 */
export function useSocket() {
  const socketRef = useRef<Socket>(getSocket());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
      socketInstance = null; // reset singleton on unmount
    };
  }, []);

  return socketRef.current;
}
