import { describe, it, expect, beforeEach, vi } from 'vitest'
import interviewService, { Interview, CreateInterviewRequest } from './interviewService'
import apiClient from './apiClient'

vi.mock('./apiClient')

describe('interviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getInterviews', () => {
    it('should fetch all interviews with default parameters', async () => {
      const mockInterviews: Interview[] = [
        {
          id: '1',
          title: 'React Interview',
          candidateName: 'John Doe',
          candidateEmail: 'john@example.com',
          status: 'pending',
          language: 'JavaScript',
          createdAt: '2024-01-01',
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockInterviews)

      const result = await interviewService.getInterviews()

      expect(result).toEqual(mockInterviews)
      expect(apiClient.get).toHaveBeenCalledWith('/interviews?limit=10&offset=0')
    })

    it('should fetch interviews with status filter', async () => {
      const mockInterviews: Interview[] = []

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockInterviews)

      await interviewService.getInterviews('pending', 10, 0)

      expect(apiClient.get).toHaveBeenCalledWith('/interviews?status=pending&limit=10&offset=0')
    })

    it('should fetch interviews with custom pagination', async () => {
      const mockInterviews: Interview[] = []

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockInterviews)

      await interviewService.getInterviews(undefined, 20, 40)

      expect(apiClient.get).toHaveBeenCalledWith('/interviews?limit=20&offset=40')
    })
  })

  describe('getInterviewById', () => {
    it('should fetch interview by id', async () => {
      const mockInterview: Interview = {
        id: '1',
        title: 'React Interview',
        candidateName: 'John Doe',
        candidateEmail: 'john@example.com',
        status: 'pending',
        language: 'JavaScript',
        createdAt: '2024-01-01',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockInterview)

      const result = await interviewService.getInterviewById('1')

      expect(result).toEqual(mockInterview)
      expect(apiClient.get).toHaveBeenCalledWith('/interviews/1')
    })

    it('should propagate api errors', async () => {
      const error = new Error('Not found')
      vi.mocked(apiClient.get).mockRejectedValueOnce(error)

      await expect(interviewService.getInterviewById('1')).rejects.toThrow('Not found')
    })
  })

  describe('createInterview', () => {
    it('should create a new interview', async () => {
      const createData: CreateInterviewRequest = {
        title: 'New Interview',
        candidateName: 'Jane Smith',
        candidateEmail: 'jane@example.com',
        questionIds: ['q1', 'q2'],
        language: 'Python',
      }

      const mockResponse: Interview = {
        id: '2',
        title: 'New Interview',
        candidateName: 'Jane Smith',
        candidateEmail: 'jane@example.com',
        status: 'pending',
        language: 'Python',
        createdAt: '2024-01-02',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await interviewService.createInterview(createData)

      expect(result).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalledWith('/interviews', createData)
    })
  })

  describe('updateInterviewStatus', () => {
    it('should update interview status', async () => {
      const mockResponse = { success: true }

      vi.mocked(apiClient.put).mockResolvedValueOnce(mockResponse)

      const result = await interviewService.updateInterviewStatus('1', 'completed')

      expect(result).toEqual(mockResponse)
      expect(apiClient.put).toHaveBeenCalledWith('/interviews/1', { status: 'completed' })
    })
  })

  describe('startInterview', () => {
    it('should start an interview', async () => {
      const mockResponse = {
        id: '1',
        interviewId: '1',
        candidateId: 'c1',
        startedAt: '2024-01-01T10:00:00Z',
        code: '',
        language: 'JavaScript',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await interviewService.startInterview('1')

      expect(result).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalledWith('/interviews/1/start', {})
    })
  })

  describe('submitInterview', () => {
    it('should submit interview with code', async () => {
      const code = 'console.log("test")'
      const language = 'JavaScript'
      const mockResponse = { success: true, message: 'Interview submitted' }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await interviewService.submitInterview('1', code, language)

      expect(result).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalledWith('/interviews/1/submit', {
        code,
        language,
      })
    })
  })

  describe('getInterviewReport', () => {
    it('should fetch interview report', async () => {
      const mockReport = {
        interviewId: '1',
        score: 85,
        feedback: 'Good performance',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockReport)

      const result = await interviewService.getInterviewReport('1')

      expect(result).toEqual(mockReport)
      expect(apiClient.get).toHaveBeenCalledWith('/interviews/1/report')
    })
  })

  describe('getQuestions', () => {
    it('should fetch all questions', async () => {
      const mockQuestions = [
        { id: 'q1', title: 'Question 1', description: 'Desc 1' },
        { id: 'q2', title: 'Question 2', description: 'Desc 2' },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockQuestions)

      const result = await interviewService.getQuestions()

      expect(result).toEqual(mockQuestions)
      expect(apiClient.get).toHaveBeenCalledWith('/questions?')
    })

    it('should fetch questions filtered by language', async () => {
      const mockQuestions = [
        { id: 'q1', title: 'Python Question', language: 'Python' },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockQuestions)

      const result = await interviewService.getQuestions('Python')

      expect(result).toEqual(mockQuestions)
      expect(apiClient.get).toHaveBeenCalledWith('/questions?language=Python')
    })
  })

  describe('getQuestionById', () => {
    it('should fetch question by id', async () => {
      const mockQuestion = {
        id: 'q1',
        title: 'Question 1',
        description: 'Describe a question',
        language: 'JavaScript',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockQuestion)

      const result = await interviewService.getQuestionById('q1')

      expect(result).toEqual(mockQuestion)
      expect(apiClient.get).toHaveBeenCalledWith('/questions/q1')
    })
  })
})
