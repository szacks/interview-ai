/**
 * Service for validating question templates and test cases
 */

import { apiConfig } from '@/config/app.config'

export interface TemplateValidationRequest {
  language: 'java' | 'python' | 'javascript'
  code: string
}

export interface TemplateValidationResponse {
  success: boolean
  language: string
  errors?: string
  warnings?: string[]
}

export interface ValidationResult {
  allValid: boolean
  results: {
    java: TemplateValidationResponse
    python: TemplateValidationResponse
    javascript: TemplateValidationResponse
  }
}

/**
 * Validate that template code compiles (syntax check only, no execution)
 */
export const validateTemplateCompilation = async (
  request: TemplateValidationRequest
): Promise<TemplateValidationResponse> => {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/code/validate-syntax`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Validation request failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Template validation error:', error)
    return {
      success: false,
      language: request.language,
      errors: error instanceof Error ? error.message : 'Unknown validation error',
    }
  }
}

/**
 * Validate all language templates
 */
export const validateAllTemplates = async (codeTemplates: {
  java: { code: string }
  python: { code: string }
  javascript: { code: string }
}): Promise<ValidationResult> => {
  const results = await Promise.all([
    validateTemplateCompilation({ language: 'java', code: codeTemplates.java.code }),
    validateTemplateCompilation({ language: 'python', code: codeTemplates.python.code }),
    validateTemplateCompilation({ language: 'javascript', code: codeTemplates.javascript.code }),
  ])

  return {
    allValid: results.every((r) => r.success),
    results: {
      java: results[0],
      python: results[1],
      javascript: results[2],
    },
  }
}

/**
 * Generate a minimal validation harness for template code
 * This wraps the template in a simple main() that instantiates the class
 */
export const generateValidationHarness = (language: string, templateCode: string): string => {
  switch (language.toLowerCase()) {
    case 'java':
      // Extract class name from template (assumes "class ClassName")
      const javaClassMatch = templateCode.match(/class\s+(\w+)/)
      const className = javaClassMatch ? javaClassMatch[1] : 'Solution'

      return `${templateCode}

// Validation harness
class Validator {
    public static void main(String[] args) {
        System.out.println("Template compiles successfully");
        // Minimal instantiation would go here if needed
    }
}`

    case 'python':
      return `${templateCode}

# Validation harness
if __name__ == "__main__":
    print("Template syntax is valid")
`

    case 'javascript':
      return `${templateCode}

// Validation harness
console.log("Template syntax is valid");
`

    default:
      return templateCode
  }
}

/**
 * Validate test case structure (client-side validation)
 */
export const validateTestCaseStructure = (testCases: any[]): {
  valid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (testCases.length === 0) {
    errors.push('At least one test case is required')
  }

  testCases.forEach((test, index) => {
    if (!test.name || test.name.trim() === '') {
      errors.push(`Test ${index + 1}: Name is required`)
    }
    if (!test.input || test.input.trim() === '') {
      errors.push(`Test ${index + 1}: Input is required`)
    }
    if (!test.expectedOutput || test.expectedOutput.trim() === '') {
      errors.push(`Test ${index + 1}: Expected output is required`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
