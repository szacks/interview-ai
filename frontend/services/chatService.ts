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
      const response = await apiClient.post<ChatMessageResponse>('/chat/message', request);
      return response.data || response;
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
      const response = await apiClient.get<ChatMessageResponse[]>(
        `/chat/history/${interviewId}`
      );
      return response.data || response;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  /**
   * Health check for chat service
   * @returns Health status
   */
  checkHealth: async (): Promise<string> => {
    try {
      const response = await apiClient.get<string>('/chat/health');
      return response.data || response;
    } catch (error) {
      console.error('Error checking chat service health:', error);
      throw error;
    }
  },
};
