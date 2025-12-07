import apiClient from './apiClient';
import type { CodeSubmissionRequest, CodeSubmissionResponse } from '@/types/code';

export const codeService = {
  /**
   * Submit candidate code to backend
   */
  submitCode: async (request: CodeSubmissionRequest): Promise<CodeSubmissionResponse> => {
    try {
      // apiClient interceptor already extracts response.data
      const data = await apiClient.post('/code/submit', request);
      return data as CodeSubmissionResponse;
    } catch (error) {
      console.error('Error submitting code:', error);
      throw error;
    }
  },

  /**
   * Get latest code submission for an interview
   */
  getLatestCode: async (interviewId: string | number): Promise<CodeSubmissionResponse> => {
    try {
      // apiClient interceptor already extracts response.data
      const data = await apiClient.get(
        `/code/latest/${interviewId}`
      );
      return data as CodeSubmissionResponse;
    } catch (error) {
      console.error('Error fetching latest code:', error);
      throw error;
    }
  },
};
