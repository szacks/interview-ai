import apiClient from './apiClient';
import type { CodeSubmissionRequest, CodeSubmissionResponse } from '@/types/code';

// Code execution types
export interface CodeExecutionRequest {
  interviewId: number;
  language: string;
  code: string;
}

export interface TestCaseResult {
  testCaseId: number;
  testName: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  errorMessage?: string;
  executionTimeMs?: number;
}

export interface CodeExecutionResponse {
  interviewId: number;
  status: 'success' | 'error' | 'timeout' | 'compilation_error';
  testsPassed: number;
  testsTotal: number;
  autoScore: number;
  executionTimeMs: number;
  testDetails: TestCaseResult[];
  errorMessage?: string;
  stdout?: string;
  stderr?: string;
  executedAt: string;
}

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
   * Returns empty response if no previous code exists
   */
  getLatestCode: async (interviewId: string | number): Promise<CodeSubmissionResponse> => {
    try {
      // apiClient interceptor already extracts response.data
      // Backend now returns 200 OK with empty response if no code submission exists
      const data = await apiClient.get(
        `/code/latest/${interviewId}`
      );
      return data as CodeSubmissionResponse;
    } catch (error) {
      console.error('Error fetching latest code:', error);
      throw error;
    }
  },

  /**
   * Execute code in Docker sandbox and run tests
   */
  executeCode: async (request: CodeExecutionRequest): Promise<CodeExecutionResponse> => {
    try {
      const data = await apiClient.post('/code/execute', request);
      return data as CodeExecutionResponse;
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  },
};
