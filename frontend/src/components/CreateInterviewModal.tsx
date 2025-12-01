import { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import Spinner from './common/Spinner';
import interviewService, { type Candidate } from '../services/interviewService';

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  timeLimitMinutes: number;
}

interface CreateInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (interview: any) => void;
}

const PROGRAMMING_LANGUAGES = ['java', 'python', 'javascript'];

export default function CreateInterviewModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInterviewModalProps) {
  const [step, setStep] = useState<'candidate' | 'question' | 'details'>('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  // Form state
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [scheduledDate, setScheduledDate] = useState('');

  // Load questions on mount
  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    try {
      const data = await interviewService.getQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const handleCandidateSearch = async () => {
    if (!candidateEmail.trim()) {
      setError('Please enter a candidate email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to find existing candidate
      const existingCandidate = await interviewService.searchCandidateByEmail(candidateEmail);
      setCandidate(existingCandidate);
      setStep('question');
    } catch (err: any) {
      // If not found, create new candidate
      if (err.response?.status === 404 && candidateName.trim()) {
        try {
          const newCandidate = await interviewService.createCandidate(candidateEmail, candidateName);
          setCandidate(newCandidate);
          setStep('question');
        } catch (createErr) {
          setError('Failed to create candidate. Please try again.');
        }
      } else if (!candidateName.trim()) {
        setError('Candidate not found. Please enter candidate name to create new.');
      } else {
        setError('Failed to find or create candidate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async () => {
    if (!candidate || !selectedQuestion) {
      setError('Please select a question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const interviewRequest = {
        questionId: selectedQuestion,
        candidateId: candidate.id,
        language: selectedLanguage,
        ...(scheduledDate && { scheduledAt: scheduledDate }),
      };

      const response = await interviewService.createInterview(interviewRequest as any);

      if (onSuccess) {
        onSuccess(response);
      }

      // Reset form
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create interview. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('candidate');
    setCandidateEmail('');
    setCandidateName('');
    setCandidate(null);
    setSelectedQuestion(null);
    setSelectedLanguage('javascript');
    setScheduledDate('');
    setError('');
    onClose();
  };

  const handleBack = () => {
    if (step === 'question') {
      setStep('candidate');
    } else if (step === 'details') {
      setStep('question');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Interview"
      description={
        step === 'candidate'
          ? 'Enter candidate details'
          : step === 'question'
          ? 'Select a question'
          : 'Interview details'
      }
      footer={
        <div className="flex justify-between gap-3">
          {step !== 'candidate' && (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={
                step === 'candidate'
                  ? handleCandidateSearch
                  : step === 'question'
                  ? () => setStep('details')
                  : handleCreateInterview
              }
              disabled={loading || (step === 'question' && !selectedQuestion)}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  {step === 'candidate' ? 'Searching...' : 'Creating...'}
                </span>
              ) : step === 'candidate' ? (
                'Next'
              ) : step === 'question' ? (
                'Next'
              ) : (
                'Create Interview'
              )}
            </Button>
          </div>
        </div>
      }
    >
      {/* Candidate Step */}
      {step === 'candidate' && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <Input
            label="Candidate Email"
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            placeholder="john@example.com"
            disabled={loading}
          />
          <Input
            label="Candidate Name"
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="John Doe"
            helperText="Required if candidate doesn't exist"
            disabled={loading}
          />
        </div>
      )}

      {/* Question Step */}
      {step === 'question' && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Question
            </label>
            <select
              value={selectedQuestion || ''}
              onChange={(e) => setSelectedQuestion(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || questions.length === 0}
            >
              <option value="">Choose a question...</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.difficulty})
                </option>
              ))}
            </select>
          </div>
          {selectedQuestion && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="text-blue-900">
                {questions.find((q) => q.id === selectedQuestion)?.description}
              </p>
              <p className="text-blue-700 text-xs mt-2">
                Time limit: {questions.find((q) => q.id === selectedQuestion)?.timeLimitMinutes} minutes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Details Step */}
      {step === 'details' && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">
            <p className="text-gray-700">
              <strong>Candidate:</strong> {candidate?.name} ({candidate?.email})
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Question:</strong> {questions.find((q) => q.id === selectedQuestion)?.title}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programming Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Scheduled Date & Time (Optional)"
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            disabled={loading}
          />
        </div>
      )}
    </Modal>
  );
}
