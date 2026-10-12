import { useEffect, useState, useCallback } from 'react';

export type SocketStatus = 'connected' | 'connecting' | 'disconnected';

export interface WebSocketEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
}

type EventHandler = (payload: any) => void;

class ThreadLoopSocketClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<EventHandler>>();
  private statusListeners = new Set<(status: SocketStatus) => void>();
  private activeUsersListeners = new Set<(count: number) => void>();
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private fallbackPollInterval: any = null;
  private status: SocketStatus = 'disconnected';
  private activeUsers = 1;
  private currentUserId: string | null = null;
  private retryCount = 0;

  constructor() {
    // Read cached user id if available
    if (typeof window !== 'undefined') {
      try {
        this.currentUserId = localStorage.getItem('tl_user_id') || 'usr_demo_customer';
      } catch {
        this.currentUserId = 'usr_demo_customer';
      }
      this.connect();
    }
  }

  public getStatus(): SocketStatus {
    return this.status;
  }

  public getActiveUsers(): number {
    return this.activeUsers;
  }

  private setStatus(newStatus: SocketStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach(listener => listener(newStatus));
    }
  }

  public onStatusChange(listener: (status: SocketStatus) => void) {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public onActiveUsersChange(listener: (count: number) => void) {
    this.activeUsersListeners.add(listener);
    listener(this.activeUsers);
    return () => {
      this.activeUsersListeners.delete(listener);
    };
  }

  public on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  public emit(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type, ...data }));
      } catch (e) {
        console.warn('WebSocket emit error', e);
      }
    }
  }

  public authenticate(userId: string) {
    this.currentUserId = userId;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.emit('auth', { userId });
    }
  }

  public connect() {
    if (typeof window === 'undefined') return;

    // Clear any pending timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      try {
        // Remove old handlers to prevent ghost triggers
        this.ws.onopen = null;
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    this.setStatus('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const queryParam = this.currentUserId ? `?userId=${encodeURIComponent(this.currentUserId)}` : '';
      const wsUrl = `${protocol}//${host}/ws${queryParam}`;

      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      socket.onopen = () => {
        this.retryCount = 0;
        this.setStatus('connected');
        this.stopFallbackPolling();

        if (this.currentUserId) {
          this.emit('auth', { userId: this.currentUserId });
        }

        // Setup ping heartbeat every 15s to keep proxy connections alive
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          this.emit('ping', {});
        }, 15000);
      };

      socket.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);

          if (data.type === 'presence:update' && data.payload?.activeUsers) {
            this.activeUsers = data.payload.activeUsers;
            this.activeUsersListeners.forEach(fn => fn(this.activeUsers));
          }

          const handlers = this.listeners.get(data.type);
          if (handlers) {
            handlers.forEach(handler => handler(data.payload));
          }

          // Wildcard handler
          const allHandlers = this.listeners.get('*');
          if (allHandlers) {
            allHandlers.forEach(handler => handler(data));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message', err);
        }
      };

      socket.onclose = () => {
        if (this.ws === socket) {
          this.setStatus('disconnected');
          if (this.pingInterval) clearInterval(this.pingInterval);
          this.scheduleReconnect();
          this.startFallbackPolling();
        }
      };

      socket.onerror = () => {
        if (this.ws === socket) {
          this.setStatus('disconnected');
          try {
            socket.close();
          } catch {
            // ignore
          }
        }
      };
    } catch (err) {
      console.warn('WebSocket connection error:', err);
      this.setStatus('disconnected');
      this.scheduleReconnect();
      this.startFallbackPolling();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.retryCount++;
    // Exponential backoff: 1s, 2s, capped at 4s
    const delay = Math.min(1000 * Math.pow(1.5, this.retryCount), 4000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startFallbackPolling() {
    if (this.fallbackPollInterval) return;
    this.fallbackPollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.totalUsers === 'number') {
            this.activeUsers = Math.max(1, data.totalUsers);
            this.activeUsersListeners.forEach(fn => fn(this.activeUsers));
          }
        }
      } catch {
        // ignore
      }
    }, 6000);
  }

  private stopFallbackPolling() {
    if (this.fallbackPollInterval) {
      clearInterval(this.fallbackPollInterval);
      this.fallbackPollInterval = null;
    }
  }
}

export const socketClient = new ThreadLoopSocketClient();

if (typeof window !== 'undefined') {
  (window as any).__threadLoopSocket = socketClient;
}

/**
 * React hook to listen for real-time WebSocket events and track connection status
 */
export function useThreadLoopSocket(userId?: string) {
  const [status, setStatus] = useState<SocketStatus>(socketClient.getStatus());
  const [activeUsers, setActiveUsers] = useState<number>(socketClient.getActiveUsers());

  useEffect(() => {
    const unsubStatus = socketClient.onStatusChange(setStatus);
    const unsubPresence = socketClient.onActiveUsersChange(setActiveUsers);

    // If socket is disconnected, ensure connect() is invoked
    if (socketClient.getStatus() === 'disconnected') {
      socketClient.connect();
    }

    if (userId) {
      socketClient.authenticate(userId);
    }

    return () => {
      unsubStatus();
      unsubPresence();
    };
  }, [userId]);

  const subscribe = useCallback((event: string, handler: EventHandler) => {
    return socketClient.on(event, handler);
  }, []);

  const reconnect = useCallback(() => {
    socketClient.connect();
  }, []);

  return {
    status,
    activeUsers,
    subscribe,
    reconnect,
    authenticate: (id: string) => socketClient.authenticate(id)
  };
}
