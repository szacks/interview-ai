import apiClient from './apiClient';

export interface Candidate {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface Interview {
  id: number;
  questionId: number;
  candidateId: number;
  interviewerId: number;
  language: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  scheduledAt?: string;
  interviewLinkToken: string;
}

export interface CreateInterviewRequest {
  questionId: number;
  candidateId: number;
  language: string;
  scheduledAt?: string;
  interviewerId?: number;
}

export interface InterviewSession {
  id: string;
  interviewId: string;
  candidateId: string;
  startedAt: string;
  code: string;
  language: string;
}

const interviewService = {
  // Get all interviews
  getInterviews: async (
    status?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', String(limit));
    params.append('offset', String(offset));

    const response = await apiClient.get(`/interviews?${params.toString()}`);
    return response;
  },

  // Get interview by ID
  getInterviewById: async (interviewId: string): Promise<any> => {
    const response = await apiClient.get(`/interviews/${interviewId}`);
    return response;
  },

  // Create new interview
  createInterview: async (
    data: CreateInterviewRequest
  ): Promise<any> => {
    const response = await apiClient.post('/interviews', data);
    return response;
  },

  // Update interview status
  updateInterviewStatus: async (
    interviewId: string,
    status: string
  ): Promise<any> => {
    const response = await apiClient.put(`/interviews/${interviewId}`, {
      status,
    });
    return response;
  },

  // Start interview session
  startInterview: async (interviewId: string): Promise<any> => {
    const response = await apiClient.post(
      `/interviews/${interviewId}/start`,
      {}
    );
    return response;
  },

  // Submit interview code
  submitInterview: async (
    interviewId: string,
    code: string,
    language: string
  ): Promise<any> => {
    const response = await apiClient.post(`/interviews/${interviewId}/submit`, {
      code,
      language,
    });
    return response;
  },

  // Get interview report
  getInterviewReport: async (interviewId: string) => {
    const response = await apiClient.get(`/interviews/${interviewId}/report`);
    return response;
  },

  // Get all questions
  getQuestions: async (language?: string) => {
    const params = new URLSearchParams();
    if (language) params.append('language', language);

    const response = await apiClient.get(`/questions?${params.toString()}`);
    return response;
  },

  // Get question by ID
  getQuestionById: async (questionId: string) => {
    const response = await apiClient.get(`/questions/${questionId}`);
    return response;
  },

  // Create a new candidate
  createCandidate: async (email: string, name: string): Promise<Candidate> => {
    const response = await apiClient.post('/candidates', { email, name });
    return response.data;
  },

  // Search candidate by email
  searchCandidateByEmail: async (email: string): Promise<Candidate> => {
    const response = await apiClient.get(`/candidates/search?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  // Get candidate by ID
  getCandidateById: async (candidateId: number): Promise<Candidate> => {
    const response = await apiClient.get(`/candidates/${candidateId}`);
    return response.data;
  },

  // Get all candidates
  getAllCandidates: async (): Promise<Candidate[]> => {
    const response = await apiClient.get('/candidates');
    return response.data;
  },
};

export default interviewService;
