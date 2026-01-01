import apiClient from './apiClient'
import type {
  Interview,
  CreateInterviewRequest,
  CreateInterviewResponse,
  InterviewListResponse,
  Question,
  Candidate,
} from '@/types/interview'

export const interviewService = {
  /**
   * Create a new interview
   */
  createInterview: async (request: CreateInterviewRequest): Promise<CreateInterviewResponse> => {
    try {
      const data = await apiClient.post('/interviews', request)
      return data as CreateInterviewResponse
    } catch (error) {
      console.error('Error creating interview:', error)
      throw error
    }
  },

  /**
   * Get all interviews for the company
   */
  getInterviews: async (status?: string): Promise<InterviewListResponse[]> => {
    try {
      const params = status ? `?status=${status}` : ''
      const data = await apiClient.get(`/interviews${params}`)
      return data as InterviewListResponse[]
    } catch (error) {
      console.error('Error fetching interviews:', error)
      throw error
    }
  },

  /**
   * Get a specific interview by ID
   */
  getInterviewById: async (interviewId: number): Promise<Interview> => {
    try {
      const data = await apiClient.get(`/interviews/${interviewId}`)
      return data as Interview
    } catch (error) {
      console.error('Error fetching interview:', error)
      throw error
    }
  },

  /**
   * Get interview by link token
   */
  getInterviewByToken: async (token: string): Promise<Interview> => {
    try {
      const data = await apiClient.get(`/interviews/link/${token}`)
      return data as Interview
    } catch (error) {
      console.error('Error fetching interview by token:', error)
      throw error
    }
  },

  /**
   * Start an interview
   */
  startInterview: async (interviewId: number): Promise<Interview> => {
    try {
      const data = await apiClient.post(`/interviews/${interviewId}/start`, {})
      return data as Interview
    } catch (error) {
      console.error('Error starting interview:', error)
      throw error
    }
  },

  /**
   * Complete an interview
   */
  completeInterview: async (interviewId: number): Promise<Interview> => {
    try {
      const data = await apiClient.post(`/interviews/${interviewId}/complete`, {})
      return data as Interview
    } catch (error) {
      console.error('Error completing interview:', error)
      throw error
    }
  },

  /**
   * Update interview status
   */
  updateInterviewStatus: async (interviewId: number, status: string): Promise<Interview> => {
    try {
      const data = await apiClient.put(`/interviews/${interviewId}`, { status })
      return data as Interview
    } catch (error) {
      console.error('Error updating interview:', error)
      throw error
    }
  },

  /**
   * Get all available questions
   */
  getQuestions: async (): Promise<Question[]> => {
    try {
      const data = await apiClient.get('/questions')
      return data as Question[]
    } catch (error) {
      console.error('Error fetching questions:', error)
      throw error
    }
  },

  /**
   * Get a specific question by ID
   */
  getQuestionById: async (questionId: number): Promise<Question> => {
    try {
      const data = await apiClient.get(`/questions/${questionId}`)
      return data as Question
    } catch (error) {
      console.error('Error fetching question:', error)
      throw error
    }
  },

  /**
   * Get all candidates
   */
  getCandidates: async (): Promise<Candidate[]> => {
    try {
      const data = await apiClient.get('/candidates')
      return data as Candidate[]
    } catch (error) {
      console.error('Error fetching candidates:', error)
      throw error
    }
  },

  /**
   * Create a new candidate
   */
  createCandidate: async (name: string, email: string): Promise<Candidate> => {
    try {
      const data = await apiClient.post('/candidates', { name, email })
      return data as Candidate
    } catch (error) {
      console.error('Error creating candidate:', error)
      throw error
    }
  },

  /**
   * Get a specific test case by ID
   */
  getTestCaseById: async (testCaseId: number): Promise<any> => {
    try {
      const data = await apiClient.get(`/test-cases/${testCaseId}`)
      return data
    } catch (error) {
      console.error('Error fetching test case:', error)
      throw error
    }
  },

  /**
   * Create a new custom question
   */
  createQuestion: async (request: any): Promise<Question> => {
    try {
      const data = await apiClient.post('/questions', request)
      return data as Question
    } catch (error) {
      console.error('Error creating question:', error)
      throw error
    }
  },

  /**
   * Update an existing question
   */
  updateQuestion: async (questionId: number, request: any): Promise<Question> => {
    try {
      const data = await apiClient.put(`/questions/${questionId}`, request)
      return data as Question
    } catch (error) {
      console.error('Error updating question:', error)
      throw error
    }
  },

  /**
   * Delete (archive) a question
   */
  deleteQuestion: async (questionId: number): Promise<void> => {
    try {
      await apiClient.delete(`/questions/${questionId}`)
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  },

  /**
   * Convert code from one language to another using AI
   */
  convertCode: async (request: {
    sourceLanguage: string
    targetLanguage: string
    sourceCode: string
  }): Promise<{ targetLanguage: string; convertedCode: string; success: boolean; error?: string }> => {
    try {
      const data = await apiClient.post('/questions/convert-code', request)
      return data as { targetLanguage: string; convertedCode: string; success: boolean; error?: string }
    } catch (error) {
      console.error('Error converting code:', error)
      throw error
    }
  },

  /**
   * Validate a question (check code compilation and test execution)
   */
  validateQuestion: async (questionId: number): Promise<any> => {
    try {
      const data = await apiClient.post(`/questions/${questionId}/validate`, {})
      return data
    } catch (error) {
      console.error('Error validating question:', error)
      throw error
    }
  },

  /**
   * Test AI chat for a specific question
   */
  testAIChat: async (questionId: number, request: {
    message: string
    conversationHistory?: any[]
  }): Promise<{ message: string }> => {
    try {
      const data = await apiClient.post(`/questions/${questionId}/test-ai`, request)
      return data as { message: string }
    } catch (error) {
      console.error('Error testing AI chat:', error)
      throw error
    }
  },
}
