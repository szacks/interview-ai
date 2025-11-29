import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useInterviewStore, Interview, InterviewSession } from './interviewStore'

describe('interviewStore', () => {
  beforeEach(() => {
    useInterviewStore.setState({
      interviews: [],
      isLoadingInterviews: false,
      interviewsError: null,
      currentInterview: null,
      isLoadingCurrent: false,
      currentError: null,
      currentSession: null,
      isSessionActive: false,
      timeRemaining: 1800,
    })
  })

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      const store = useInterviewStore.getState()
      expect(store.interviews).toEqual([])
      expect(store.isLoadingInterviews).toBe(false)
      expect(store.interviewsError).toBeNull()
      expect(store.currentInterview).toBeNull()
      expect(store.isLoadingCurrent).toBe(false)
      expect(store.currentError).toBeNull()
      expect(store.currentSession).toBeNull()
      expect(store.isSessionActive).toBe(false)
      expect(store.timeRemaining).toBe(1800)
    })
  })

  describe('setInterviews', () => {
    it('should set interviews list', () => {
      const interviews: Interview[] = [
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
      useInterviewStore.getState().setInterviews(interviews)
      expect(useInterviewStore.getState().interviews).toEqual(interviews)
    })

    it('should clear loading and error when setting interviews', () => {
      useInterviewStore.setState({
        isLoadingInterviews: true,
        interviewsError: 'Some error',
      })
      useInterviewStore.getState().setInterviews([])
      expect(useInterviewStore.getState().isLoadingInterviews).toBe(false)
      expect(useInterviewStore.getState().interviewsError).toBeNull()
    })
  })

  describe('addInterview', () => {
    it('should add interview to the beginning of list', () => {
      const interview1: Interview = {
        id: '1',
        title: 'First',
        candidateName: 'John',
        candidateEmail: 'john@example.com',
        status: 'pending',
        language: 'JavaScript',
        createdAt: '2024-01-01',
      }
      const interview2: Interview = {
        id: '2',
        title: 'Second',
        candidateName: 'Jane',
        candidateEmail: 'jane@example.com',
        status: 'pending',
        language: 'Python',
        createdAt: '2024-01-02',
      }

      useInterviewStore.getState().addInterview(interview1)
      useInterviewStore.getState().addInterview(interview2)

      const interviews = useInterviewStore.getState().interviews
      expect(interviews[0].id).toBe('2')
      expect(interviews[1].id).toBe('1')
    })
  })

  describe('updateInterview', () => {
    it('should update interview by id', () => {
      const interview: Interview = {
        id: '1',
        title: 'Test Interview',
        candidateName: 'John',
        candidateEmail: 'john@example.com',
        status: 'pending',
        language: 'JavaScript',
        createdAt: '2024-01-01',
      }
      useInterviewStore.setState({ interviews: [interview] })

      useInterviewStore.getState().updateInterview('1', { status: 'completed' })

      const updated = useInterviewStore.getState().interviews[0]
      expect(updated.status).toBe('completed')
      expect(updated.title).toBe('Test Interview')
    })

    it('should not affect other interviews', () => {
      const interview1: Interview = {
        id: '1',
        title: 'First',
        candidateName: 'John',
        candidateEmail: 'john@example.com',
        status: 'pending',
        language: 'JavaScript',
        createdAt: '2024-01-01',
      }
      const interview2: Interview = {
        id: '2',
        title: 'Second',
        candidateName: 'Jane',
        candidateEmail: 'jane@example.com',
        status: 'pending',
        language: 'Python',
        createdAt: '2024-01-02',
      }
      useInterviewStore.setState({ interviews: [interview1, interview2] })

      useInterviewStore.getState().updateInterview('1', { status: 'completed' })

      const interviews = useInterviewStore.getState().interviews
      expect(interviews[0].status).toBe('completed')
      expect(interviews[1].status).toBe('pending')
    })
  })

  describe('removeInterview', () => {
    it('should remove interview by id', () => {
      const interview: Interview = {
        id: '1',
        title: 'Test',
        candidateName: 'John',
        candidateEmail: 'john@example.com',
        status: 'pending',
        language: 'JavaScript',
        createdAt: '2024-01-01',
      }
      useInterviewStore.setState({ interviews: [interview] })

      useInterviewStore.getState().removeInterview('1')

      expect(useInterviewStore.getState().interviews).toHaveLength(0)
    })

    it('should not affect other interviews', () => {
      const interview1: Interview = {
        id: '1',
        title: 'First',
        candidateName: 'John',
        candidateEmail: 'john@example.com',
        status: 'pending',
        language: 'JavaScript',
        createdAt: '2024-01-01',
      }
      const interview2: Interview = {
        id: '2',
        title: 'Second',
        candidateName: 'Jane',
        candidateEmail: 'jane@example.com',
        status: 'pending',
        language: 'Python',
        createdAt: '2024-01-02',
      }
      useInterviewStore.setState({ interviews: [interview1, interview2] })

      useInterviewStore.getState().removeInterview('1')

      expect(useInterviewStore.getState().interviews).toHaveLength(1)
      expect(useInterviewStore.getState().interviews[0].id).toBe('2')
    })
  })

  describe('setLoadingInterviews', () => {
    it('should set loading state', () => {
      useInterviewStore.getState().setLoadingInterviews(true)
      expect(useInterviewStore.getState().isLoadingInterviews).toBe(true)
    })
  })

  describe('setInterviewsError', () => {
    it('should set error message', () => {
      const error = 'Failed to load interviews'
      useInterviewStore.getState().setInterviewsError(error)
      expect(useInterviewStore.getState().interviewsError).toBe(error)
    })
  })

  describe('setCurrentInterview', () => {
    it('should set current interview', () => {
      const interview: Interview = {
        id: '1',
        title: 'Test',
        candidateName: 'John',
        candidateEmail: 'john@example.com',
        status: 'pending',
        language: 'JavaScript',
        createdAt: '2024-01-01',
      }
      useInterviewStore.getState().setCurrentInterview(interview)
      expect(useInterviewStore.getState().currentInterview).toEqual(interview)
    })

    it('should clear loading and error', () => {
      useInterviewStore.setState({
        isLoadingCurrent: true,
        currentError: 'Error',
      })

      const interview: Interview = {
        id: '1',
        title: 'Test',
        candidateName: 'John',
        candidateEmail: 'john@example.com',
        status: 'pending',
        language: 'JavaScript',
        createdAt: '2024-01-01',
      }
      useInterviewStore.getState().setCurrentInterview(interview)

      expect(useInterviewStore.getState().isLoadingCurrent).toBe(false)
      expect(useInterviewStore.getState().currentError).toBeNull()
    })
  })

  describe('setLoadingCurrent', () => {
    it('should set loading state for current interview', () => {
      useInterviewStore.getState().setLoadingCurrent(true)
      expect(useInterviewStore.getState().isLoadingCurrent).toBe(true)
    })
  })

  describe('setCurrentError', () => {
    it('should set error for current interview', () => {
      const error = 'Failed to load interview'
      useInterviewStore.getState().setCurrentError(error)
      expect(useInterviewStore.getState().currentError).toBe(error)
    })
  })

  describe('Session management', () => {
    describe('startSession', () => {
      it('should start a session', () => {
        const session: InterviewSession = {
          interviewId: '1',
          candidateId: '1',
          code: 'console.log("test")',
          language: 'JavaScript',
          startedAt: new Date().toISOString(),
          messages: [],
        }

        useInterviewStore.getState().startSession(session)

        const state = useInterviewStore.getState()
        expect(state.currentSession).toEqual(session)
        expect(state.isSessionActive).toBe(true)
        expect(state.timeRemaining).toBe(1800)
      })
    })

    describe('endSession', () => {
      it('should end a session', () => {
        useInterviewStore.setState({
          currentSession: {
            interviewId: '1',
            candidateId: '1',
            code: 'code',
            language: 'JavaScript',
            startedAt: '2024-01-01',
            messages: [],
          },
          isSessionActive: true,
        })

        useInterviewStore.getState().endSession()

        const state = useInterviewStore.getState()
        expect(state.currentSession).toBeNull()
        expect(state.isSessionActive).toBe(false)
        expect(state.timeRemaining).toBe(1800)
      })
    })

    describe('updateCode', () => {
      it('should update code in current session', () => {
        const session: InterviewSession = {
          interviewId: '1',
          candidateId: '1',
          code: 'initial code',
          language: 'JavaScript',
          startedAt: '2024-01-01',
          messages: [],
        }
        useInterviewStore.setState({ currentSession: session })

        useInterviewStore.getState().updateCode('updated code')

        const updated = useInterviewStore.getState().currentSession
        expect(updated?.code).toBe('updated code')
      })

      it('should do nothing if session is null', () => {
        useInterviewStore.setState({ currentSession: null })
        useInterviewStore.getState().updateCode('code')
        expect(useInterviewStore.getState().currentSession).toBeNull()
      })
    })

    describe('addMessage', () => {
      it('should add message to session', () => {
        const session: InterviewSession = {
          interviewId: '1',
          candidateId: '1',
          code: 'code',
          language: 'JavaScript',
          startedAt: '2024-01-01',
          messages: [],
        }
        useInterviewStore.setState({ currentSession: session })

        useInterviewStore.getState().addMessage('user', 'Hello')

        const messages = useInterviewStore.getState().currentSession?.messages
        expect(messages).toHaveLength(1)
        expect(messages?.[0].sender).toBe('user')
        expect(messages?.[0].content).toBe('Hello')
      })

      it('should not add message if session is null', () => {
        useInterviewStore.setState({ currentSession: null })
        useInterviewStore.getState().addMessage('user', 'Hello')
        expect(useInterviewStore.getState().currentSession).toBeNull()
      })
    })

    describe('setTimeRemaining', () => {
      it('should set time remaining', () => {
        useInterviewStore.getState().setTimeRemaining(600)
        expect(useInterviewStore.getState().timeRemaining).toBe(600)
      })
    })

    describe('decrementTime', () => {
      it('should decrement time', () => {
        useInterviewStore.setState({ timeRemaining: 100 })
        useInterviewStore.getState().decrementTime()
        expect(useInterviewStore.getState().timeRemaining).toBe(99)
      })

      it('should not go below zero', () => {
        useInterviewStore.setState({ timeRemaining: 0 })
        useInterviewStore.getState().decrementTime()
        expect(useInterviewStore.getState().timeRemaining).toBe(0)
      })
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useInterviewStore.setState({
        interviews: [{ id: '1', title: 'Test', candidateName: 'John', candidateEmail: 'john@example.com', status: 'completed', language: 'JavaScript', createdAt: '2024-01-01' }],
        isLoadingInterviews: true,
        interviewsError: 'error',
        currentInterview: { id: '1', title: 'Test', candidateName: 'John', candidateEmail: 'john@example.com', status: 'pending', language: 'JavaScript', createdAt: '2024-01-01' },
        isLoadingCurrent: true,
        currentError: 'error',
        currentSession: { interviewId: '1', candidateId: '1', code: 'code', language: 'JavaScript', startedAt: '2024-01-01', messages: [] },
        isSessionActive: true,
        timeRemaining: 100,
      })

      useInterviewStore.getState().reset()

      const state = useInterviewStore.getState()
      expect(state.interviews).toEqual([])
      expect(state.isLoadingInterviews).toBe(false)
      expect(state.interviewsError).toBeNull()
      expect(state.currentInterview).toBeNull()
      expect(state.isLoadingCurrent).toBe(false)
      expect(state.currentError).toBeNull()
      expect(state.currentSession).toBeNull()
      expect(state.isSessionActive).toBe(false)
      expect(state.timeRemaining).toBe(1800)
    })
  })

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      useInterviewStore.setState({
        interviewsError: 'Interviews error',
        currentError: 'Current error',
      })

      useInterviewStore.getState().clearErrors()

      expect(useInterviewStore.getState().interviewsError).toBeNull()
      expect(useInterviewStore.getState().currentError).toBeNull()
    })
  })
})
