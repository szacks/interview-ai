import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import type { ChatMessage } from '@/types/chat';

/**
 * WebSocket URL for STOMP connection
 * Uses env variable or defaults to localhost
 */
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/ws/interview';

/**
 * Service for managing STOMP WebSocket connections to chat system
 */
export class WebSocketService {
  private client: Client | null = null;
  private interviewId: string | null = null;
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private messageSubscription: string | null = null;

  /**
   * Connect to WebSocket for a specific interview
   * @param interviewId The interview ID to connect to
   * @returns Promise that resolves when connected
   */
  connect(interviewId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        console.log('[WebSocket] Already connected');
        resolve();
        return;
      }

      this.interviewId = interviewId;

      const config: StompConfig = {
        brokerURL: WS_URL,
        connectHeaders: {
          // Add auth token if available
          // Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          console.log('[STOMP]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log('[WebSocket] Connected to interview', interviewId);
          this.subscribeToChat(interviewId);
          this.onConnectionChangeCallback?.(true);
          resolve();
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          this.onConnectionChangeCallback?.(false);
        },
        onStompError: (frame) => {
          console.error('[STOMP Error]', frame);
          const errorMsg = frame.headers['message'] || 'WebSocket connection failed';
          reject(new Error(errorMsg));
        },
        onWebSocketClose: () => {
          console.log('[WebSocket] WebSocket closed');
          this.onConnectionChangeCallback?.(false);
        },
        onWebSocketError: (event) => {
          console.error('[WebSocket Error]', event);
          this.onConnectionChangeCallback?.(false);
        },
      };

      this.client = new Client(config);
      this.client.activate();
    });
  }

  /**
   * Subscribe to chat messages for the interview
   * @param interviewId The interview ID
   */
  private subscribeToChat(interviewId: string) {
    if (!this.client?.connected) {
      console.error('[WebSocket] Client not connected');
      return;
    }

    const destination = `/topic/interview/${interviewId}/chat`;

    this.messageSubscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        this.handleIncomingMessage(message);
      },
      {
        // Subscription headers if needed
      }
    );

    console.log('[WebSocket] Subscribed to', destination);
  }

  /**
   * Handle incoming WebSocket message
   * @param message The raw STOMP message
   */
  private handleIncomingMessage(message: IMessage) {
    try {
      const wsMessage = JSON.parse(message.body);
      const payload = wsMessage.payload;

      // Map senderType to role
      const roleMap: Record<string, 'candidate' | 'ai'> = {
        candidate: 'candidate',
        ai: 'ai',
      };

      const chatMessage: ChatMessage = {
        role: (roleMap[payload.senderType] as 'candidate' | 'ai') || 'ai',
        content: payload.message,
        timestamp: new Date(wsMessage.timestamp),
        senderName: payload.senderName,
      };

      this.onMessageCallback?.(chatMessage);
    } catch (error) {
      console.error('[WebSocket] Error parsing incoming message', error);
    }
  }

  /**
   * Send a message to the chat topic
   * Note: Messages are usually sent via REST API instead of WebSocket
   * @param message The message to send
   */
  sendMessage(message: any) {
    if (!this.client?.connected) {
      throw new Error('WebSocket not connected');
    }

    if (!this.interviewId) {
      throw new Error('No interview ID set');
    }

    this.client.publish({
      destination: `/app/interview/${this.interviewId}/chat`,
      body: JSON.stringify(message),
    });

    console.log('[WebSocket] Message published');
  }

  /**
   * Register callback for incoming messages
   * @param callback Function to call when message arrives
   */
  onMessage(callback: (message: ChatMessage) => void) {
    this.onMessageCallback = callback;
  }

  /**
   * Register callback for connection status changes
   * @param callback Function to call when connection status changes
   */
  onConnectionChange(callback: (connected: boolean) => void) {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      if (this.messageSubscription) {
        this.client.unsubscribe(this.messageSubscription);
        this.messageSubscription = null;
      }

      this.client.deactivate();
      this.client = null;
      this.interviewId = null;

      console.log('[WebSocket] Disconnected');
    }
  }

  /**
   * Check if currently connected
   * @returns True if connected
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }

  /**
   * Get current interview ID
   * @returns The interview ID or null
   */
  getInterviewId(): string | null {
    return this.interviewId;
  }
}

/**
 * Export singleton instance
 */
export const webSocketService = new WebSocketService();
