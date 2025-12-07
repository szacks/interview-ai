export interface CodeSubmissionRequest {
  interviewId: string | number;
  language: string;
  code: string;
}

export interface CodeSubmissionResponse {
  id: number;
  language: string;
  code: string;
  timestamp: string;
}

export interface CodeState {
  code: string;
  language: string;
  lastUpdated: Date | null;
}
