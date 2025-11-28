import apiClient from './apiClient';

export interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  language: string;
}

export interface CreateInterviewRequest {
  title: string;
  candidateName: string;
  candidateEmail: string;
  questionIds: string[];
  language: string;
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
};

export default interviewService;
