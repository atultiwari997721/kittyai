import { ClientMessage, ServerMessage, ServerMessageType } from '../types/ipc.js';

export type MessageListener<T = unknown> = (payload: T, fullMessage: ServerMessage<T>) => void;

export class KittyAiWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: Map<ServerMessageType, Set<MessageListener<any>>> = new Map();
  private reconnectIntervalMs = 2500;
  private shouldReconnect = true;
  private pingIntervalTimer: any = null;
  public isConnected = false;

  constructor(url = 'ws://127.0.0.1:8000/ws') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve) => {
      this.shouldReconnect = true;
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: ServerMessage = JSON.parse(event.data);
            const handlers = this.listeners.get(data.type);
            if (handlers) {
              handlers.forEach((h) => h(data.payload, data));
            }
          } catch (e) {
            console.error('[KittyAiWS] Error parsing message:', e);
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.stopHeartbeat();
          if (this.shouldReconnect) {
            setTimeout(() => this.connect(), this.reconnectIntervalMs);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('[KittyAiWS] Connection error:', err);
          this.ws?.close();
        };
      } catch (err) {
        console.error('[KittyAiWS] Failed to initialize WebSocket:', err);
        if (this.shouldReconnect) {
          setTimeout(() => this.connect(), this.reconnectIntervalMs);
        }
      }
    });
  }

  on<T = unknown>(type: ServerMessageType, listener: MessageListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  send<T = unknown>(type: ClientMessage<T>['type'], payload: T): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[KittyAiWS] Cannot send message, socket not open:', type);
      return;
    }

    const message: ClientMessage<T> = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingIntervalTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
