import apiClient from './apiClient';

export interface EvaluationRequest {
  interviewId: number;
  autoScoreAdjusted?: number;
  autoScoreAdjustedReason?: string;
  manualScoreCommunication?: number;
  manualScoreAlgorithmic?: number;
  manualScoreProblemSolving?: number;
  manualScoreAiCollaboration?: number;
  notesCommunication?: string;
  notesAlgorithmic?: string;
  notesProblemSolving?: string;
  notesAiCollaboration?: string;
  customObservations?: string;
  isDraft?: boolean;
}

export interface EvaluationResponse {
  id?: number;
  interviewId: number;

  // Auto Score
  testsPassed?: number;
  testsTotal?: number;
  autoScoreOriginal?: number;
  autoScoreAdjusted?: number;
  autoScoreAdjustedReason?: string;

  // Manual Scores (0-10 each)
  manualScoreCommunication?: number;
  manualScoreAlgorithmic?: number;
  manualScoreProblemSolving?: number;
  manualScoreAiCollaboration?: number;

  // Notes
  notesCommunication?: string;
  notesAlgorithmic?: string;
  notesProblemSolving?: string;
  notesAiCollaboration?: string;
  customObservations?: string;

  // Calculated scores
  manualScoreTotal?: number;       // Sum of 4 params (0-40)
  manualScoreNormalized?: number;  // Normalized to 0-100
  finalScore?: number;             // (auto * 0.4) + (manual * 0.6)

  // Status
  isDraft?: boolean;
  evaluationSubmittedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // Interview details
  candidateName?: string;
  questionTitle?: string;
  language?: string;
  duration?: number;
  interviewStatus?: string;
}

export const evaluationService = {
  /**
   * Get evaluation for an interview
   */
  async getEvaluation(interviewId: number): Promise<EvaluationResponse> {
    return apiClient.get(`/interview-evaluations/interview/${interviewId}`);
  },

  /**
   * Submit or update an evaluation
   */
  async submitEvaluation(request: EvaluationRequest): Promise<EvaluationResponse> {
    return apiClient.post('/interview-evaluations', request);
  },

  /**
   * Save evaluation as draft
   */
  async saveDraft(request: EvaluationRequest): Promise<EvaluationResponse> {
    return apiClient.post('/interview-evaluations', { ...request, isDraft: true });
  },

  /**
   * Delete an evaluation
   */
  async deleteEvaluation(evaluationId: number): Promise<void> {
    return apiClient.delete(`/interview-evaluations/${evaluationId}`);
  },

  /**
   * Calculate manual score from 4 parameters (client-side preview)
   * Each param is 0-10, sum is 0-40, normalized to 0-100
   */
  calculateManualScore(
    communication: number,
    algorithmic: number,
    problemSolving: number,
    aiCollaboration: number
  ): number {
    const total = (communication || 0) + (algorithmic || 0) + (problemSolving || 0) + (aiCollaboration || 0);
    return Math.round((total / 40) * 100);
  },

  /**
   * Calculate final score from auto and manual scores (client-side preview)
   * Formula: (auto * 0.4) + (manual * 0.6)
   */
  calculateFinalScore(autoScore: number, manualScore: number): number {
    return Math.round(autoScore * 0.4 + manualScore * 0.6);
  },

  /**
   * Get score interpretation text
   */
  getScoreInterpretation(score: number): { text: string; color: string } {
    if (score >= 91) return { text: 'Exceptional', color: 'text-chart-3' };
    if (score >= 81) return { text: 'Strong', color: 'text-chart-3' };
    if (score >= 71) return { text: 'Good', color: 'text-chart-4' };
    if (score >= 51) return { text: 'Concerning', color: 'text-destructive' };
    return { text: 'Not Ready', color: 'text-destructive' };
  }
};
