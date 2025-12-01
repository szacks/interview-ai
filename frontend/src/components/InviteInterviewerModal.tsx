import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import teamService, { InviteInterviewerRequest } from '../services/teamService';

interface InviteInterviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const InviteInterviewerModal: React.FC<InviteInterviewerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const request: InviteInterviewerRequest = {
        email: email.trim(),
        name: name.trim() || undefined,
      };

      await teamService.inviteInterviewer(request);
      setSuccess(true);
      setEmail('');
      setName('');

      // Close modal after success
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send invitation. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setName('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Interviewer"
      description="Send an invitation to a new team member"
      size="md"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!email.trim() || isLoading}
          >
            {success ? '✓ Sent' : 'Send Invitation'}
          </Button>
        </>
      }
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-4xl mb-2">✓</div>
          <p className="text-green-600 font-medium">Invitation sent successfully!</p>
          <p className="text-gray-600 text-sm mt-2">
            An invitation email has been sent to {email}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="interviewer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            error={error && !email ? 'Email is required' : undefined}
          />

          <Input
            label="Name (Optional)"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />

          <p className="text-sm text-gray-600 mt-4">
            The invitee will receive an email with a link to set up their account. The invitation link expires in 7 days.
          </p>
        </form>
      )}
    </Modal>
  );
};

export default InviteInterviewerModal;
