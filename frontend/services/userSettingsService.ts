import apiClient from './apiClient'

export interface UserSettings {
  id: number
  userId: number
  defaultAgentId?: number
  showRunTests: boolean
  autoScoreWeight: number
  sessionTimeoutMinutes: number
  dataRetentionDays: number
  createdAt:  Date
  updatedAt?:  Date
}

export interface UpdateUserSettingsRequest {
  defaultAgentId?: number
  showRunTests?: boolean
  autoScoreWeight?: number
  sessionTimeoutMinutes?: number
  dataRetentionDays?: number
}

export const userSettingsService = {
  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    try {
      const response = await apiClient.get('/user-settings')
      return response as unknown as UserSettings
    } catch (error) {
      console.error('Error fetching user settings:', error)
      throw error
    }
  },

  /**
   * Update user settings (all fields)
   */
  async updateSettings(settings: UpdateUserSettingsRequest): Promise<UserSettings> {
    try {
      const response = await apiClient.put('/user-settings', settings)
      return response as unknown as UserSettings
    } catch (error) {
      console.error('Error updating user settings:', error)
      throw error
    }
  },

  /**
   * Update default agent
   */
  async updateDefaultAgent(agentId: number): Promise<UserSettings> {
    try {
      const response = await apiClient.put(`/user-settings/agent/${agentId}`)
      return response as unknown as UserSettings
    } catch (error) {
      console.error('Error updating default agent:', error)
      throw error
    }
  },

  /**
   * Update run tests preference
   */
  async updateShowRunTests(enabled: boolean): Promise<UserSettings> {
    try {
      const response = await apiClient.put(`/user-settings/run-tests?enabled=${enabled}`)
      return response as unknown as UserSettings
    } catch (error) {
      console.error('Error updating run tests setting:', error)
      throw error
    }
  },

  /**
   * Update auto score weight
   */
  async updateAutoScoreWeight(weight: number): Promise<UserSettings> {
    try {
      const response = await apiClient.put(`/user-settings/scoring/auto-weight?weight=${weight}`)
      return response as unknown as UserSettings
    } catch (error) {
      console.error('Error updating auto score weight:', error)
      throw error
    }
  },
}
