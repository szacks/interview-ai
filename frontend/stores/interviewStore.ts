import { create } from 'zustand'
import type { Interview, Question, Candidate } from '@/types/interview'

interface InterviewState {
  // Current interview
  currentInterview: Interview | null
  setCurrentInterview: (interview: Interview | null) => void

  // Interview list
  interviews: Interview[]
  setInterviews: (interviews: Interview[]) => void
  addInterview: (interview: Interview) => void
  updateInterview: (interview: Interview) => void

  // Questions
  questions: Question[]
  setQuestions: (questions: Question[]) => void
  selectedQuestion: Question | null
  setSelectedQuestion: (question: Question | null) => void

  // Candidates
  candidates: Candidate[]
  setCandidates: (candidates: Candidate[]) => void
  selectedCandidate: Candidate | null
  setSelectedCandidate: (candidate: Candidate | null) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  // Clear all state
  clear: () => void
}

export const useInterviewStore = create<InterviewState>((set) => ({
  currentInterview: null,
  setCurrentInterview: (interview) => set({ currentInterview: interview }),

  interviews: [],
  setInterviews: (interviews) => set({ interviews }),
  addInterview: (interview) =>
    set((state) => ({
      interviews: [interview, ...state.interviews],
    })),
  updateInterview: (interview) =>
    set((state) => ({
      interviews: state.interviews.map((i) => (i.id === interview.id ? interview : i)),
    })),

  questions: [],
  setQuestions: (questions) => set({ questions }),
  selectedQuestion: null,
  setSelectedQuestion: (question) => set({ selectedQuestion: question }),

  candidates: [],
  setCandidates: (candidates) => set({ candidates }),
  selectedCandidate: null,
  setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),

  clear: () =>
    set({
      currentInterview: null,
      interviews: [],
      questions: [],
      selectedQuestion: null,
      candidates: [],
      selectedCandidate: null,
      isLoading: false,
      error: null,
    }),
}))
