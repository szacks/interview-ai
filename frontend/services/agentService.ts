import apiClient from './apiClient'

export interface AgentTemplate {
  id: number
  name: string
  systemPrompt: string
  isSystem: boolean
  companyId?: number
  createdBy?: number
  createdAt: string
  updatedAt?: string
}

export interface CreateAgentRequest {
  name: string
  systemPrompt: string
}

export interface UpdateAgentRequest {
  name?: string
  systemPrompt?: string
}

export const agentService = {
  /**
   * Get all agents (system + company-specific custom agents)
   */
  async getAllAgents(): Promise<AgentTemplate[]> {
    try {
      const response = await apiClient.get('/agents')
      return response as AgentTemplate[]
    } catch (error) {
      console.error('Error fetching agents:', error)
      throw error
    }
  },

  /**
   * Get a specific agent by ID
   */
  async getAgentById(id: number): Promise<AgentTemplate> {
    try {
      const response = await apiClient.get(`/agents/${id}`)
      return response as AgentTemplate
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error)
      throw error
    }
  },

  /**
   * Create a new custom agent
   */
  async createAgent(data: CreateAgentRequest): Promise<AgentTemplate> {
    try {
      const response = await apiClient.post('/agents', data)
      return response as AgentTemplate
    } catch (error) {
      console.error('Error creating agent:', error)
      throw error
    }
  },

  /**
   * Update an existing custom agent
   * System agents cannot be updated
   */
  async updateAgent(id: number, data: UpdateAgentRequest): Promise<AgentTemplate> {
    try {
      const response = await apiClient.put(`/agents/${id}`, data)
      return response as AgentTemplate
    } catch (error) {
      console.error(`Error updating agent ${id}:`, error)
      throw error
    }
  },

  /**
   * Delete a custom agent
   * System agents cannot be deleted
   */
  async deleteAgent(id: number): Promise<void> {
    try {
      await apiClient.delete(`/agents/${id}`)
    } catch (error) {
      console.error(`Error deleting agent ${id}:`, error)
      throw error
    }
  },
}
