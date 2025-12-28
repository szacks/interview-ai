import apiClient from './apiClient';
import type { ChatMessageRequest, ChatMessageResponse } from '@/types/chat';

/**
 * Chat API service for interview AI communication
 */
export const chatService = {
  /**
   * Send a message from candidate and receive AI response
   * @param request The chat message request
   * @returns The AI response
   */
  sendMessage: async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
    try {
      // apiClient interceptor already extracts response.data
      const data = (await apiClient.post('/chat/message', request)) as unknown as ChatMessageResponse;
      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },

  /**
   * Get chat history for an interview
   * @param interviewId The interview ID
   * @returns Array of chat messages
   */
  getChatHistory: async (interviewId: string | number): Promise<ChatMessageResponse[]> => {
    try {
      // apiClient interceptor already extracts response.data
      const data = (await apiClient.get(`/chat/history/${interviewId}`)) as unknown;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      // 404 is expected when no chat history exists - return empty array
      if (error?.status === 404 || error?.message === 'Resource not found') {
        return [];
      }
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  /**
   * Resolve an interview link token to an interview ID
   * @param token The interview link token
   * @returns The interview ID
   */
  resolveToken: async (token: string): Promise<number> => {
    try {
      // apiClient interceptor already extracts response.data
      const data = (await apiClient.get(`/chat/resolve-token/${token}`)) as unknown;

      // Handle various response formats
      if (typeof data === 'number') {
        return data;
      }

      if (typeof data === 'string') {
        const parsed = parseInt(data.trim(), 10);
        if (isNaN(parsed)) {
          throw new Error(`Failed to parse interview ID from response: ${data}`);
        }
        return parsed;
      }

      throw new Error(`Invalid response type: ${typeof data}`);
    } catch (error) {
      console.error('Error resolving interview token:', error);
      throw error;
    }
  },

  /**
   * Health check for chat service
   * @returns Health status
   */
  checkHealth: async (): Promise<string> => {
    try {
      // apiClient interceptor already extracts response.data
      const data = (await apiClient.get('/chat/health')) as unknown;
      return typeof data === "string"
        ? data
        : JSON.stringify(data);
    } catch (error) {
      console.error('Error checking chat service health:', error);
      throw error;
    }
  },
};
