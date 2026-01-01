"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Eye, EyeOff } from "lucide-react"
import type { QuestionData, TestCase } from "@/lib/types/question-builder"

interface StepTestCasesProps {
  data: QuestionData
  onUpdate: (data: Partial<QuestionData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepTestCases({ data, onUpdate, onNext, onBack }: StepTestCasesProps) {
  const [editingTest, setEditingTest] = useState<string | null>(null)

  const addTestCase = () => {
    const newTest: TestCase = {
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

  const updateTest = (id: string, updates: Partial<TestCase>) => {
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
                      rows={2}
                      className="font-mono text-sm"
                      value={test.setup}
                      onChange={(e) => updateTest(test.id, { setup: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Input</Label>
                      <Textarea
                        placeholder="limiter.allowRequest('user1', 0)"
                        rows={3}
                        className="font-mono text-sm"
                        value={test.input}
                        onChange={(e) => updateTest(test.id, { input: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Output</Label>
                      <Textarea
                        placeholder="true"
                        rows={3}
                        className="font-mono text-sm"
                        value={test.expectedOutput}
                        onChange={(e) => updateTest(test.id, { expectedOutput: e.target.value })}
                      />
                    </div>
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
                <div className="space-y-2 text-sm">
                  {test.setup && (
                    <div>
                      <span className="text-muted-foreground">Setup:</span>{" "}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">{test.setup}</code>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Input:</span>{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{test.input || "(empty)"}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected:</span>{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{test.expectedOutput || "(empty)"}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingTest(test.id)}>
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add Test Button */}
      <Button variant="outline" onClick={addTestCase} className="w-full mb-6 bg-transparent">
        <Plus className="size-4 mr-2" />
        Add Test Case
      </Button>

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
