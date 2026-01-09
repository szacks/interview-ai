import apiClient from './apiClient';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  companyId: number;
  createdAt: string;
  lastLogin: string;
}

export interface UpdateUserProfileRequest {
  name: string;
}

const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/users/me');
    return (response as any)?.data || response;
  },

  // Update current user profile
  updateProfile: async (data: UpdateUserProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put('/users/me', data);
    return (response as any)?.data || response;
  },
};

export default userService;
