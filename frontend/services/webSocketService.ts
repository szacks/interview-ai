import { Client, IMessage, StompConfig } from '@stomp/stompjs';
import type { ChatMessage } from '@/types/chat';
import { apiConfig, wsConfig } from '@/config/app.config';

/**
 * Get WebSocket URL for STOMP connection
 * Constructs URL based on environment or backend API URL
 */
function getWebSocketURL(): string {
  // If explicitly configured via environment variable, use it
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  // Get the backend API base URL from config
  const apiBaseUrl = apiConfig.baseUrl;

  // Convert http/https to ws/wss and replace /api with /api/ws/interview
  const wsUrl = apiBaseUrl
    .replace(/^https:/, 'wss:')
    .replace(/^http:/, 'ws:')
    .replace(/\/api\/?$/, '/api/ws/interview');

  return wsUrl;
}

/**
 * Service for managing STOMP WebSocket connections to chat system.
 * Uses centralized configuration for all WebSocket settings.
 */
export class WebSocketService {
  private client: Client | null = null;
  private interviewId: string | null = null;
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private messageSubscription: any = null;
  private codeSubscription: any = null;

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
      const wsUrl = getWebSocketURL();
      console.log('[WebSocket] Connecting to', wsUrl, 'for interview', interviewId);

      const config: StompConfig = {
        brokerURL: wsUrl,
        connectHeaders: {
          // Add auth token if available
          // Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          console.log('[STOMP]', str);
        },
        reconnectDelay: wsConfig.reconnectDelay,
        heartbeatIncoming: wsConfig.heartbeatIncoming,
        heartbeatOutgoing: wsConfig.heartbeatOutgoing,
        onConnect: () => {
          console.log('[WebSocket] ✓ Connected to interview', interviewId);
          this.subscribeToChat(interviewId);
          this.subscribeToCode(interviewId);
          this.onConnectionChangeCallback?.(true);
          resolve();
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected from interview', interviewId);
          this.onConnectionChangeCallback?.(false);
        },
        onStompError: (frame) => {
          console.error('[STOMP Error]', frame.headers);
          const errorMsg = frame.headers['message'] || 'WebSocket connection failed';
          reject(new Error(errorMsg));
        },
        onWebSocketClose: () => {
          console.log('[WebSocket] WebSocket closed');
          this.onConnectionChangeCallback?.(false);
        },
        onWebSocketError: (event) => {
          console.error('[WebSocket Error] Connection failed:', event);
          console.error('[WebSocket] Attempted URL:', wsUrl);
          console.error('[WebSocket] Interview ID:', interviewId);
          this.onConnectionChangeCallback?.(false);
        },
      };

      try {
        this.client = new Client(config);
        console.log('[WebSocket] Client created, activating...');
        this.client.activate();
      } catch (error) {
        console.error('[WebSocket] Error creating/activating client:', error);
        reject(error);
      }
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
   * Subscribe to code updates for the interview
   * @param interviewId The interview ID
   */
  private subscribeToCode(interviewId: string) {
    if (!this.client?.connected) {
      console.error('[WebSocket] Client not connected');
      return;
    }

    const destination = `/topic/interview/${interviewId}/code`;

    this.codeSubscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        this.handleCodeUpdate(message);
      },
      {
        // Subscription headers if needed
      }
    );

    console.log('[WebSocket] Subscribed to code updates at', destination);
  }

  /**
   * Handle incoming code update
   * @param message The raw STOMP message
   */
  private handleCodeUpdate(message: IMessage) {
    try {
      const wsMessage = JSON.parse(message.body);
      console.log('[WebSocket] Received code update:', wsMessage);

      // Extract the code payload from the WebSocket message
      // The backend wraps the code in a WebSocketMessage object with payload property
      const codeUpdate = wsMessage.payload || wsMessage;

      // Dispatch to code update callback if registered
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('codeUpdate', { detail: codeUpdate })
        );
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing code update', error);
    }
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
   * Publish code update to WebSocket (for real-time live streaming)
   * @param code The code content
   * @param language The programming language
   */
  publishCodeUpdate(code: string, language: string) {
    if (!this.client?.connected) {
      console.warn('[WebSocket] Not connected, cannot publish code update');
      return;
    }

    if (!this.interviewId) {
      console.warn('[WebSocket] No interview ID set, cannot publish code update');
      return;
    }

    this.client.publish({
      destination: `/app/interview/${this.interviewId}/code`,
      body: JSON.stringify({
        code,
        language,
        timestamp: new Date().toISOString(),
      }),
    });

    console.log('[WebSocket] Code update published');
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

      if (this.codeSubscription) {
        this.client.unsubscribe(this.codeSubscription);
        this.codeSubscription = null;
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
