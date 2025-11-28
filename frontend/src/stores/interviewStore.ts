import { create } from 'zustand';

export interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  status: 'pending' | 'in_progress' | 'completed';
  language: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface InterviewSession {
  interviewId: string;
  candidateId: string;
  code: string;
  language: string;
  startedAt: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>;
}

export interface InterviewState {
  // List state
  interviews: Interview[];
  isLoadingInterviews: boolean;
  interviewsError: string | null;

  // Current interview state
  currentInterview: Interview | null;
  isLoadingCurrent: boolean;
  currentError: string | null;

  // Session state
  currentSession: InterviewSession | null;
  isSessionActive: boolean;
  timeRemaining: number; // in seconds

  // Actions - List management
  setInterviews: (interviews: Interview[]) => void;
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  removeInterview: (id: string) => void;
  setLoadingInterviews: (loading: boolean) => void;
  setInterviewsError: (error: string | null) => void;

  // Actions - Current interview
  setCurrentInterview: (interview: Interview | null) => void;
  setLoadingCurrent: (loading: boolean) => void;
  setCurrentError: (error: string | null) => void;

  // Actions - Session management
  startSession: (session: InterviewSession) => void;
  endSession: () => void;
  updateCode: (code: string) => void;
  addMessage: (sender: 'user' | 'ai', content: string) => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;

  // Actions - Reset
  reset: () => void;
  clearErrors: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  // Initial state
  interviews: [],
  isLoadingInterviews: false,
  interviewsError: null,

  currentInterview: null,
  isLoadingCurrent: false,
  currentError: null,

  currentSession: null,
  isSessionActive: false,
  timeRemaining: 1800, // 30 minutes in seconds

  // List management actions
  setInterviews: (interviews) =>
    set({
      interviews,
      isLoadingInterviews: false,
      interviewsError: null,
    }),

  addInterview: (interview) =>
    set((state) => ({
      interviews: [interview, ...state.interviews],
    })),

  updateInterview: (id, updates) =>
    set((state) => ({
      interviews: state.interviews.map((interview) =>
        interview.id === id ? { ...interview, ...updates } : interview
      ),
    })),

  removeInterview: (id) =>
    set((state) => ({
      interviews: state.interviews.filter((interview) => interview.id !== id),
    })),

  setLoadingInterviews: (loading) =>
    set({ isLoadingInterviews: loading }),

  setInterviewsError: (error) =>
    set({ interviewsError: error }),

  // Current interview actions
  setCurrentInterview: (interview) =>
    set({
      currentInterview: interview,
      isLoadingCurrent: false,
      currentError: null,
    }),

  setLoadingCurrent: (loading) =>
    set({ isLoadingCurrent: loading }),

  setCurrentError: (error) =>
    set({ currentError: error }),

  // Session management actions
  startSession: (session) =>
    set({
      currentSession: session,
      isSessionActive: true,
      timeRemaining: 1800,
    }),

  endSession: () =>
    set({
      currentSession: null,
      isSessionActive: false,
      timeRemaining: 1800,
    }),

  updateCode: (code) =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            code,
          }
        : null,
    })),

  addMessage: (sender, content) =>
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          messages: [
            ...state.currentSession.messages,
            {
              id: Date.now().toString(),
              sender,
              content,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      };
    }),

  setTimeRemaining: (time) =>
    set({ timeRemaining: time }),

  decrementTime: () =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    })),

  // Reset actions
  reset: () =>
    set({
      interviews: [],
      isLoadingInterviews: false,
      interviewsError: null,
      currentInterview: null,
      isLoadingCurrent: false,
      currentError: null,
      currentSession: null,
      isSessionActive: false,
      timeRemaining: 1800,
    }),

  clearErrors: () =>
    set({
      interviewsError: null,
      currentError: null,
    }),
}));
