/**
 * Service for validating test cases by generating AI implementations and running tests
 */

import { apiConfig } from '@/config/app.config'
import type { TestCaseDefinition, ProgrammingLanguage } from '@/lib/types/question-builder'

export interface ValidateTestsWithAIRequest {
  title: string
  description: string
  primaryLanguage: ProgrammingLanguage
  codeTemplate: string
  tests: TestCaseDefinition[]
}

export interface TestExecutionResult {
  testName: string
  passed: boolean
  expected: string
  actual: string
  error?: string
}

export interface ValidateTestsWithAIResponse {
  passed: number
  failed: number
  results: TestExecutionResult[]
  aiImplementation: string
  explanation: string
}

/**
 * Validate tests by generating AI implementation and running tests against it
 */
export const validateTestsWithAI = async (
  request: ValidateTestsWithAIRequest
): Promise<ValidateTestsWithAIResponse> => {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/code/validate-tests-with-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('AI validation error:', error)
    throw error
  }
}
