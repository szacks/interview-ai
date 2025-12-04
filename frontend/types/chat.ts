/**
 * Chat types and interfaces for interview AI chat system
 */

/**
 * A single chat message in the conversation
 */
export interface ChatMessage {
  id?: string | number;
  role: 'candidate' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  senderName?: string;
}

/**
 * Conversation state for a specific interview
 */
export interface ChatConversation {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  hasHistory: boolean;
}

/**
 * Request payload for sending a chat message
 */
export interface ChatMessageRequest {
  interviewId: string | number;
  message: string;
  senderType: 'candidate' | 'interviewer';
  senderName: string;
}

/**
 * Response from chat API when message is sent
 */
export interface ChatMessageResponse {
  id: number;
  role: string;
  content: string;
  timestamp: string;
  senderName: string;
}

/**
 * WebSocket message structure for real-time chat
 */
export interface WebSocketChatMessage {
  type: 'chat';
  interviewId: string | number;
  payload: {
    message: string;
    senderType: string;
    senderName: string;
    isRead: boolean;
  };
  timestamp: string;
}
