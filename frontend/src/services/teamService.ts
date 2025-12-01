import apiClient from './apiClient';

export interface InviteInterviewerRequest {
  email: string;
  name?: string;
}

export interface InviteInterviewerResponse {
  message: string;
  invitationLink: string;
  email: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  name: string;
}

export interface TeamMemberResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  joinedAt: string;
}

export interface PendingInvitationResponse {
  id: number;
  email: string;
  invitedByName: string;
  invitedAt: string;
  expiresAt: string;
}

const teamService = {
  // Send invitation to interviewer
  inviteInterviewer: async (
    data: InviteInterviewerRequest
  ): Promise<InviteInterviewerResponse> => {
    try {
      const response = await apiClient.post('/teams/invite', data);
      return (response as any)?.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Accept invitation and create account
  acceptInvitation: async (
    data: AcceptInvitationRequest
  ): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/accept-invitation', data);
      const authData = (response as any)?.data || response;
      if (authData?.token) {
        localStorage.setItem('authToken', authData.token);
        return authData;
      }
      throw new Error('No token in response');
    } catch (error) {
      throw error;
    }
  },

  // Get team members
  getTeamMembers: async (): Promise<TeamMemberResponse[]> => {
    try {
      const response = await apiClient.get('/teams/members');
      return (response as any)?.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Get pending invitations
  getPendingInvitations: async (): Promise<PendingInvitationResponse[]> => {
    try {
      const response = await apiClient.get('/teams/pending-invitations');
      return (response as any)?.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel invitation
  cancelInvitation: async (invitationId: number): Promise<any> => {
    try {
      const response = await apiClient.delete(`/teams/invitations/${invitationId}`);
      return (response as any)?.data || response;
    } catch (error) {
      throw error;
    }
  },

  // Resend invitation
  resendInvitation: async (invitationId: number): Promise<any> => {
    try {
      const response = await apiClient.post(
        `/teams/invitations/${invitationId}/resend`
      );
      return (response as any)?.data || response;
    } catch (error) {
      throw error;
    }
  },
};

export default teamService;
