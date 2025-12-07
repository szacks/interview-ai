export interface Interview {
  id: number
  candidateId: number
  candidateName?: string
  interviewerId?: number
  questionId: number
  questionTitle?: string
  language: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  interviewLinkToken: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateInterviewRequest {
  questionId: number
  candidateId: number
  language: string
  scheduledAt?: string
  interviewerId?: number
}

export interface CreateInterviewResponse {
  id: number
  candidateId: number
  questionId: number
  language: string
  status: string
  interviewLinkToken: string
  createdAt: string
}

export interface InterviewListResponse {
  id: number
  candidateName: string
  questionTitle: string
  status: string
  scheduledAt?: string
  startedAt?: string
  interviewLinkToken: string
}

export interface Question {
  id: number
  title: string
  description: string
  difficulty: string
  timeLimitMinutes: number
  supportedLanguages: string[]
  createdAt?: string
}

export interface Candidate {
  id: number
  name: string
  email: string
  createdAt?: string
}
