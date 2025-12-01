import { useState, useEffect } from 'react';
import type { FC } from 'react';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import InviteInterviewerModal from '../components/InviteInterviewerModal';
import teamService from '../services/teamService';
import type {
  TeamMemberResponse,
  PendingInvitationResponse,
} from '../services/teamService';
import { useAuthStore } from '../stores/authStore';

const TeamManagementPage: FC = () => {
  const { user } = useAuthStore();
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitationResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [members, invitations] = await Promise.all([
        teamService.getTeamMembers(),
        isAdmin ? teamService.getPendingInvitations() : Promise.resolve([]),
      ]);

      setTeamMembers(members);
      if (isAdmin) {
        setPendingInvitations(invitations);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load team data';
      setError(errorMessage);
      console.error('Error loading team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleCancelInvitation = async (invitationId: number) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    setCancellingId(invitationId);
    try {
      await teamService.cancelInvitation(invitationId);
      setPendingInvitations(
        pendingInvitations.filter((inv) => inv.id !== invitationId)
      );
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to cancel invitation';
      setError(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  const handleResendInvitation = async (invitationId: number) => {
    setResendingId(invitationId);
    try {
      await teamService.resendInvitation(invitationId);
      // Show success message
      alert('Invitation resent successfully!');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to resend invitation';
      setError(errorMessage);
    } finally {
      setResendingId(null);
    }
  };

  const handleInviteSuccess = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and pending invitations</p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsInviteModalOpen(true)}
          >
            + Invite Interviewer
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Team Members Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Team Members ({teamMembers.length})
        </h2>
        {teamMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No team members yet</p>
            {isAdmin && (
              <p className="text-sm text-gray-500 mt-2">
                Start by inviting your first interviewer
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invitations Section (Admin Only) */}
      {isAdmin && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pending Invitations ({pendingInvitations.length})
          </h2>
          {pendingInvitations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No pending invitations</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invited By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invited
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingInvitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invitation.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {invitation.invitedByName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(invitation.invitedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleResendInvitation(invitation.id)
                            }
                            disabled={
                              resendingId === invitation.id ||
                              cancellingId === invitation.id
                            }
                            isLoading={resendingId === invitation.id}
                          >
                            Resend
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleCancelInvitation(invitation.id)
                            }
                            disabled={
                              cancellingId === invitation.id ||
                              resendingId === invitation.id
                            }
                            isLoading={cancellingId === invitation.id}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <InviteInterviewerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
};

export default TeamManagementPage;
