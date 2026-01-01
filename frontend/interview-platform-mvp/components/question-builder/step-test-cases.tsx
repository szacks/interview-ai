"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Eye, EyeOff, Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import type { QuestionData, TestCaseDefinition } from "@/lib/types/question-builder"
import { validateTestsWithAI } from "@/services/aiValidationService"

interface StepTestCasesProps {
  data: QuestionData
  onUpdate: (data: Partial<QuestionData>) => void
  onNext: () => void
  onBack: () => void
}

interface TestValidationResult {
  passed: number
  failed: number
  results: Array<{
    testName: string
    passed: boolean
    expected: string
    actual: string
    error?: string
  }>
  aiImplementation: string
  explanation: string
}

export function StepTestCases({ data, onUpdate, onNext, onBack }: StepTestCasesProps) {
  const [editingTest, setEditingTest] = useState<string | null>(null)
  const [validationLoading, setValidationLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<TestValidationResult | null>(null)
  const [showValidationUI, setShowValidationUI] = useState(false)
  const [editingImplementation, setEditingImplementation] = useState(false)

  const addTestCase = () => {
    const newTest: TestCaseDefinition = {
      id: `test_${Date.now()}`,
      name: "",
      description: "",
      setup: "",
      input: "",
      expectedOutput: "",
      visibleToCandidate: false,
      timeout: 5000,
    }
    onUpdate({ tests: [...data.tests, newTest] })
    setEditingTest(newTest.id)
  }

  const updateTest = (id: string, updates: Partial<TestCaseDefinition>) => {
    onUpdate({
      tests: data.tests.map((test) => (test.id === id ? { ...test, ...updates } : test)),
    })
  }

  const deleteTest = (id: string) => {
    onUpdate({ tests: data.tests.filter((test) => test.id !== id) })
    if (editingTest === id) setEditingTest(null)
  }

  const visibleCount = data.tests.filter((t) => t.visibleToCandidate).length
  const hiddenCount = data.tests.length - visibleCount
  const isValid = data.tests.length >= 1 && data.tests.every((t) => t.name && t.input && t.expectedOutput)

  const handleValidateWithAI = async () => {
    setValidationLoading(true)
    try {
      const result = await validateTestsWithAI({
        title: data.title,
        description: data.description,
        primaryLanguage: data.primaryLanguage,
        codeTemplate: data.codeTemplates[data.primaryLanguage].code,
        tests: data.tests,
      })
      setValidationResult(result)
      setShowValidationUI(true)
    } catch (error) {
      console.error('Validation failed:', error)
      alert('Failed to validate tests with AI. Please check the console for details.')
    } finally {
      setValidationLoading(false)
    }
  }

  const handleRerun = async () => {
    setValidationLoading(true)
    try {
      const updatedImplementation = validationResult?.aiImplementation || data.codeTemplates[data.primaryLanguage].code
      const result = await validateTestsWithAI({
        title: data.title,
        description: data.description,
        primaryLanguage: data.primaryLanguage,
        codeTemplate: updatedImplementation,
        tests: data.tests,
      })
      setValidationResult(result)
    } catch (error) {
      console.error('Validation failed:', error)
      alert('Failed to re-run validation. Please check the console for details.')
    } finally {
      setValidationLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Test Cases</h2>
        <p className="text-muted-foreground">Add test cases to validate candidate solutions</p>
      </div>

      {/* Test Summary */}
      {data.tests.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="font-semibold">{data.tests.length}</span> total tests
            </div>
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-muted-foreground" />
              <span className="font-semibold">{visibleCount}</span> visible to candidate
            </div>
            <div className="flex items-center gap-2">
              <EyeOff className="size-4 text-muted-foreground" />
              <span className="font-semibold">{hiddenCount}</span> hidden
            </div>
          </div>
        </Card>
      )}

      {/* Test List */}
      <div className="space-y-4 mb-6">
        {data.tests.map((test, index) => (
          <Card key={test.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{test.name || "Untitled Test"}</h4>
                      {test.visibleToCandidate ? (
                        <Badge variant="default">
                          <Eye className="size-3 mr-1" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <EyeOff className="size-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    {test.description && <p className="text-sm text-muted-foreground mt-1">{test.description}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteTest(test.id)}>
                  <X className="size-4" />
                </Button>
              </div>

              {editingTest === test.id ? (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Test Name</Label>
                      <Input
                        placeholder="e.g., Basic Usage"
                        value={test.name}
                        onChange={(e) => updateTest(test.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Input
                        placeholder="What this test checks"
                        value={test.description}
                        onChange={(e) => updateTest(test.id, { description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Setup Code (optional)</Label>
                    <Textarea
                      placeholder="const limiter = new RateLimiter(2, 1000);"
                      rows={4}
                      className="font-mono text-sm bg-gray-950 text-gray-50 border border-gray-800"
                      value={test.setup}
                      onChange={(e) => updateTest(test.id, { setup: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Input / Function Call</Label>
                    <Textarea
                      placeholder="limiter.allowRequest('user1', 0)"
                      rows={5}
                      className="font-mono text-sm bg-gray-950 text-gray-50 border border-gray-800"
                      value={test.input}
                      onChange={(e) => updateTest(test.id, { input: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expected Output</Label>
                    <Textarea
                      placeholder="true"
                      rows={5}
                      className="font-mono text-sm bg-gray-950 text-gray-50 border border-gray-800"
                      value={test.expectedOutput}
                      onChange={(e) => updateTest(test.id, { expectedOutput: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`visible-${test.id}`}
                        checked={test.visibleToCandidate}
                        onCheckedChange={(checked) => updateTest(test.id, { visibleToCandidate: !!checked })}
                      />
                      <Label htmlFor={`visible-${test.id}`} className="font-normal">
                        Show to candidate (sample test)
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`timeout-${test.id}`} className="text-sm">
                        Timeout:
                      </Label>
                      <Input
                        id={`timeout-${test.id}`}
                        type="number"
                        className="w-24"
                        value={test.timeout || 5000}
                        onChange={(e) => updateTest(test.id, { timeout: Number.parseInt(e.target.value) || 5000 })}
                      />
                      <span className="text-sm text-muted-foreground">ms</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setEditingTest(null)}>
                    Done Editing
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {test.setup && (
                    <div className="bg-gray-950 text-gray-50 p-3 rounded border border-gray-800">
                      <div className="text-gray-400 text-xs font-semibold mb-1">Setup:</div>
                      <code className="text-xs whitespace-pre-wrap break-words font-mono">{test.setup}</code>
                    </div>
                  )}
                  <div className="bg-gray-950 text-gray-50 p-3 rounded border border-gray-800">
                    <div className="text-gray-400 text-xs font-semibold mb-1">Input / Function Call:</div>
                    <code className="text-xs whitespace-pre-wrap break-words font-mono">{test.input || "(empty)"}</code>
                  </div>
                  <div className="bg-gray-950 text-gray-50 p-3 rounded border border-gray-800">
                    <div className="text-gray-400 text-xs font-semibold mb-1">Expected Output:</div>
                    <code className="text-xs whitespace-pre-wrap break-words font-mono">{test.expectedOutput || "(empty)"}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingTest(test.id)} className="text-blue-600 hover:text-blue-700">
                    ✏️ Edit
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add Test Button */}
      <Button variant="outline" onClick={addTestCase} className="w-full mb-3 bg-transparent">
        <Plus className="size-4 mr-2" />
        Add Test Case
      </Button>

      {/* AI Validation Button */}
      <div className="mb-6">
        <Button
          onClick={handleValidateWithAI}
          disabled={validationLoading || !isValid}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {validationLoading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Validating Tests with AI...
            </>
          ) : (
            <>
              🤖 Validate Tests with AI
            </>
          )}
        </Button>
      </div>

      {/* Validation Results Panel */}
      {showValidationUI && validationResult && (
        <Card className="p-6 mb-6 border-blue-200 bg-blue-50">
          <div className="space-y-6">
            {/* Test Results Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Test Results</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="text-sm text-muted-foreground">Passed</div>
                  <div className="text-2xl font-bold text-green-600">{validationResult.passed}</div>
                </div>
                <div className={`p-4 bg-white rounded-lg border ${validationResult.failed > 0 ? 'border-red-200' : 'border-green-200'}`}>
                  <div className="text-sm text-muted-foreground">Failed</div>
                  <div className={`text-2xl font-bold ${validationResult.failed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {validationResult.failed}
                  </div>
                </div>
              </div>

              {/* Individual Test Results */}
              <div className="space-y-2">
                {validationResult.results.map((result, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      {result.passed ? (
                        <CheckCircle className="size-4 text-green-600" />
                      ) : (
                        <XCircle className="size-4 text-red-600" />
                      )}
                      <span className={`font-medium ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                        {result.testName}
                      </span>
                    </div>
                    {!result.passed && (
                      <div className="text-sm space-y-1 ml-6">
                        <div>
                          <span className="text-muted-foreground">Expected:</span>{" "}
                          <code className="bg-muted px-2 py-1 rounded text-xs">{result.expected}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Got:</span>{" "}
                          <code className="bg-muted px-2 py-1 rounded text-xs">{result.actual}</code>
                        </div>
                        {result.error && (
                          <div className="text-red-600 text-xs">{result.error}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Implementation Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">AI Implementation</h3>
              {editingImplementation ? (
                <div className="space-y-4">
                  <Textarea
                    value={validationResult.aiImplementation}
                    onChange={(e) => {
                      if (validationResult) {
                        setValidationResult({
                          ...validationResult,
                          aiImplementation: e.target.value,
                        })
                      }
                    }}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingImplementation(false)}
                    >
                      Done Editing
                    </Button>
                    <Button
                      onClick={handleRerun}
                      disabled={validationLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {validationLoading ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Re-running...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="size-4 mr-2" />
                          Re-run Tests
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-words text-gray-700">
                      {validationResult.aiImplementation}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setEditingImplementation(true)}
                  >
                    Edit Implementation
                  </Button>
                </div>
              )}
            </div>

            {/* AI Explanation */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">AI Explanation</h3>
              <p className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                {validationResult.explanation}
              </p>
            </div>

            {/* Close Validation UI */}
            <Button
              variant="outline"
              onClick={() => setShowValidationUI(false)}
              className="w-full"
            >
              Close Validation Results
            </Button>
          </div>
        </Card>
      )}

      <div className="flex justify-between gap-3 mt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid} size="lg">
          Next: AI Configuration
        </Button>
      </div>
    </div>
  )
}
