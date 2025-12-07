import { create } from 'zustand';
import type { CodeState } from '@/types/code';

interface CodeStoreState {
  // State: code keyed by interviewId
  codeByInterview: Record<string, CodeState>;

  // Actions
  setCode: (interviewId: string, code: string, language: string) => void;
  updateCode: (interviewId: string, code: string) => void;
  setLanguage: (interviewId: string, language: string) => void;
  getCode: (interviewId: string) => CodeState;
  clearCode: (interviewId: string) => void;
}

const defaultCodeState: CodeState = {
  code: '',
  language: 'javascript',
  lastUpdated: null,
};

export const useCodeStore = create<CodeStoreState>((set, get) => ({
  codeByInterview: {},

  setCode: (interviewId, code, language) => {
    set((state) => ({
      codeByInterview: {
        ...state.codeByInterview,
        [interviewId]: {
          code,
          language,
          lastUpdated: new Date(),
        },
      },
    }));
  },

  updateCode: (interviewId, code) => {
    set((state) => ({
      codeByInterview: {
        ...state.codeByInterview,
        [interviewId]: {
          ...(state.codeByInterview[interviewId] || defaultCodeState),
          code,
          lastUpdated: new Date(),
        },
      },
    }));
  },

  setLanguage: (interviewId, language) => {
    set((state) => ({
      codeByInterview: {
        ...state.codeByInterview,
        [interviewId]: {
          ...(state.codeByInterview[interviewId] || defaultCodeState),
          language,
        },
      },
    }));
  },

  getCode: (interviewId) => {
    return get().codeByInterview[interviewId] || defaultCodeState;
  },

  clearCode: (interviewId) => {
    set((state) => {
      const { [interviewId]: removed, ...remaining } = state.codeByInterview;
      return { codeByInterview: remaining };
    });
  },
}));
