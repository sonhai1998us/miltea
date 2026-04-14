import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchApi, postApi } from '@/utils/Helper';
import { getSocket } from './useSocket';

export interface ShopSession {
  token: string;
  queue_position: number;
  joined_at: string;
  expires_at: string;
  order_placed: boolean;
}

export function useSession() {
  const [session, setSession] = useState<ShopSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketJoinedRef = useRef(false);

  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      const existingToken = sessionStorage.getItem('shop_session_token');

      let currentSession: ShopSession | null = null;

      if (existingToken) {
        const resp = await fetchApi<ShopSession>(`${process.env.API_URL}${process.env.PREFIX_API}sessions/${existingToken}`);
        if (resp?.status === 'success' && resp.data) {
          currentSession = resp.data;
        } else {
          sessionStorage.removeItem('shop_session_token');
        }
      }

      if (!currentSession) {
        const resp = await postApi<ShopSession>(`${process.env.API_URL}${process.env.PREFIX_API}sessions`, {});
        if (resp?.status === 'success' && resp.data) {
          currentSession = resp.data;
          sessionStorage.setItem('shop_session_token', currentSession.token);
        } else {
          throw new Error('Could not join queue session.');
        }
      }

      setSession(currentSession);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối phiên đặt hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect socket & register listeners once session is established
  useEffect(() => {
    if (!session?.token || socketJoinedRef.current) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    // Join the private room for this session
    socket.emit('join_session', session.token);
    socketJoinedRef.current = true;

    // ---- Event Handlers ----

    const onSessionUpdated = (data: Partial<ShopSession>) => {
      setSession((prev) => prev ? { ...prev, ...data } : prev);
    };

    const onSessionExpired = () => {
      sessionStorage.removeItem('shop_session_token');
      setSession(null);
      socketJoinedRef.current = false;
      socket.disconnect();
    };

    const onOrderCreated = (data: { queue_position: number; order_placed: boolean }) => {
      setSession((prev) => prev ? { ...prev, ...data } : prev);
    };

    socket.on('session:updated', onSessionUpdated);
    socket.on('session:expired', onSessionExpired);
    socket.on('order:created', onOrderCreated);

    return () => {
      socket.off('session:updated', onSessionUpdated);
      socket.off('session:expired', onSessionExpired);
      socket.off('order:created', onOrderCreated);
    };
  }, [session?.token]);

  return { session, loading, error, initSession };
}
