'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, ChatConversation } from '@/types/chat';

/**
 * Chat store state interface
 * Conversations are keyed by interviewId to support multiple concurrent interviews
 */
interface ChatState {
  // State: conversations keyed by interviewId
  conversations: Record<string, ChatConversation>;

  // Actions: Message management
  addMessage: (interviewId: string, message: ChatMessage) => void;
  setMessages: (interviewId: string, messages: ChatMessage[]) => void;

  // Actions: State management
  setLoading: (interviewId: string, loading: boolean) => void;
  setConnectionStatus: (interviewId: string, connected: boolean) => void;
  loadHistory: (interviewId: string, messages: ChatMessage[]) => void;

  // Actions: Cleanup
  clearConversation: (interviewId: string) => void;

  // Getters
  getConversation: (interviewId: string) => ChatConversation;
}

/**
 * Default conversation structure
 */
const defaultConversation: ChatConversation = {
  messages: [],
  isLoading: false,
  isConnected: false,
  hasHistory: false,
};

/**
 * Zustand chat store with localStorage persistence
 * Persists only messages and history flag, not connection state
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: {},

      /**
       * Add a single message to the conversation
       */
      addMessage: (interviewId, message) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [interviewId]: {
              ...(state.conversations[interviewId] || defaultConversation),
              messages: [
                ...(state.conversations[interviewId]?.messages || []),
                message,
              ],
            },
          },
        }));
      },

      /**
       * Set all messages for a conversation (replaces existing)
       */
      setMessages: (interviewId, messages) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [interviewId]: {
              ...(state.conversations[interviewId] || defaultConversation),
              messages,
            },
          },
        }));
      },

      /**
       * Set loading state for chat operations
       */
      setLoading: (interviewId, loading) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [interviewId]: {
              ...(state.conversations[interviewId] || defaultConversation),
              isLoading: loading,
            },
          },
        }));
      },

      /**
       * Set WebSocket connection status
       */
      setConnectionStatus: (interviewId, connected) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [interviewId]: {
              ...(state.conversations[interviewId] || defaultConversation),
              isConnected: connected,
            },
          },
        }));
      },

      /**
       * Load chat history from API and mark as loaded
       */
      loadHistory: (interviewId, messages) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [interviewId]: {
              ...(state.conversations[interviewId] || defaultConversation),
              messages,
              hasHistory: true,
            },
          },
        }));
      },

      /**
       * Clear entire conversation for an interview
       */
      clearConversation: (interviewId) => {
        set((state) => {
          const { [interviewId]: removed, ...remaining } = state.conversations;
          return { conversations: remaining };
        });
      },

      /**
       * Get conversation for specific interview or default empty conversation
       */
      getConversation: (interviewId) => {
        return get().conversations[interviewId] || defaultConversation;
      },
    }),
    {
      name: 'chat-storage',
      // Only persist messages and history flag, not transient connection state
      partialize: (state) => ({
        conversations: Object.entries(state.conversations).reduce(
          (acc, [id, conv]) => ({
            ...acc,
            [id]: {
              messages: conv.messages,
              hasHistory: conv.hasHistory,
              isLoading: false, // Reset on hydration
              isConnected: false, // Reset on hydration
            },
          }),
          {}
        ),
      }),
    }
  )
);
