/**
 * WebSocket Service for Real-time Interview Communication
 * Handles bidirectional communication between interviewer and candidate
 */

export interface WebSocketMessage {
  type: 'code' | 'chat' | 'timer' | 'status' | 'cursor' | 'selection';
  interviewId: string;
  sender: string;
  payload: any;
  timestamp: number;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: Date;
  error?: string;
}

export type MessageListener = (message: WebSocketMessage) => void;
export type StatusListener = (status: ConnectionStatus) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private interviewId: string = '';
  private messageListeners: MessageListener[] = [];
  private statusListeners: StatusListener[] = [];
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnecting: false,
  };
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(baseUrl: string = '') {
    // Use environment variable or default to current host
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = baseUrl || window.location.host;
    this.url = `${wsProtocol}//${wsHost}/ws`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(interviewId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.connectionStatus.connected) {
        resolve();
        return;
      }

      try {
        this.interviewId = interviewId;
        this.ws = new WebSocket(`${this.url}?interviewId=${interviewId}`);

        this.ws.onopen = () => {
          this.connectionStatus = {
            connected: true,
            reconnecting: false,
            lastConnected: new Date(),
          };
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.notifyStatusListeners();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.notifyMessageListeners(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionStatus.error = 'Connection error';
          this.notifyStatusListeners();
          reject(error);
        };

        this.ws.onclose = () => {
          this.stopHeartbeat();
          this.connectionStatus.connected = false;
          this.notifyStatusListeners();
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatus = {
      connected: false,
      reconnecting: false,
    };
    this.notifyStatusListeners();
  }

  /**
   * Send a message through WebSocket
   */
  send(type: WebSocketMessage['type'], payload: any): void {
    if (!this.ws || !this.connectionStatus.connected) {
      console.warn('WebSocket not connected. Message not sent.');
      return;
    }

    const message: WebSocketMessage = {
      type,
      interviewId: this.interviewId,
      sender: this.getSenderId(),
      payload,
      timestamp: Date.now(),
    };

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  /**
   * Send code update
   */
  sendCodeUpdate(code: string, language: string): void {
    this.send('code', { code, language });
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string): void {
    this.send('chat', { message });
  }

  /**
   * Send timer update
   */
  sendTimerUpdate(timeLeft: number): void {
    this.send('timer', { timeLeft });
  }

  /**
   * Send status update
   */
  sendStatusUpdate(status: string): void {
    this.send('status', { status });
  }

  /**
   * Send cursor position for real-time collaboration
   */
  sendCursorPosition(line: number, column: number): void {
    this.send('cursor', { line, column });
  }

  /**
   * Send text selection for real-time collaboration
   */
  sendSelection(start: number, end: number): void {
    this.send('selection', { start, end });
  }

  /**
   * Subscribe to messages
   */
  onMessage(listener: MessageListener): () => void {
    this.messageListeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionStatus.connected;
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionStatus.error = 'Max reconnection attempts reached';
      this.notifyStatusListeners();
      return;
    }

    this.connectionStatus.reconnecting = true;
    this.notifyStatusListeners();

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.interviewId).catch((error) => {
        console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      });
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.connectionStatus.connected) {
        this.send('status', { type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get sender ID (user ID from session/auth)
   */
  private getSenderId(): string {
    // In production, this would come from authentication context
    return localStorage.getItem('userId') || `user-${Date.now()}`;
  }

  /**
   * Notify all message listeners
   */
  private notifyMessageListeners(message: WebSocketMessage): void {
    this.messageListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  /**
   * Notify all status listeners
   */
  private notifyStatusListeners(): void {
    const status = { ...this.connectionStatus };
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
