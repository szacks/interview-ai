"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, AlertTriangle, Eye, FileText, Send } from "lucide-react"
import type { QuestionData } from "@/lib/types/question-builder"

interface StepPreviewValidationProps {
  data: QuestionData
  onUpdate: (data: Partial<QuestionData>) => void
  onBack: () => void
}

export function StepPreviewValidation({ data, onUpdate, onBack }: StepPreviewValidationProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const visibleTests = data.tests.filter((t) => t.visibleToCandidate).length
  const hiddenTests = data.tests.length - visibleTests

  const warnings = []
  if (visibleTests === 0) {
    warnings.push("No tests are visible to candidates. Consider making 1-2 tests visible.")
  }
  if (data.followUpQuestions.length === 0) {
    warnings.push("No follow-up questions defined. Consider adding guidance for interviewers.")
  }
  if (data.tests.length < 3) {
    warnings.push("Fewer than 3 test cases. Consider adding more edge cases.")
  }

  const handleValidate = async () => {
    setIsValidating(true)
    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsValidating(false)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    console.log("[v0] Publishing question:", data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onUpdate({ status: "published" })
    setIsPublishing(false)
    // TODO: Navigate to question library or show success message
  }

  const handleSaveDraft = async () => {
    console.log("[v0] Saving as draft:", data)
    onUpdate({ status: "draft" })
    // TODO: Navigate to question library or show success message
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Preview & Validate</h2>
        <p className="text-muted-foreground">Review your question and validate it before publishing</p>
      </div>

      <Tabs defaultValue="summary" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">
            <FileText className="size-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="size-4 mr-2" />
            Candidate View
          </TabsTrigger>
          <TabsTrigger value="validation">
            <Check className="size-4 mr-2" />
            Validation
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">{data.title || "Untitled Question"}</h3>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">{data.category}</Badge>
              <Badge
                variant="outline"
                className={
                  data.difficulty === "easy"
                    ? "border-green-500 text-green-500"
                    : data.difficulty === "medium"
                      ? "border-yellow-500 text-yellow-500"
                      : "border-red-500 text-red-500"
                }
              >
                {data.difficulty}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Check className="size-4 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">Languages:</span> 3 supported (
                  {Object.keys(data.codeTemplates).join(", ")})
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="size-4 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">Tests:</span> {data.tests.length} total ({visibleTests} visible,{" "}
                  {hiddenTests} hidden)
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="size-4 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">AI:</span>{" "}
                  {data.useCustomPrompt
                    ? "Custom prompt"
                    : aiTemplates.find((t) => t.value === data.aiPromptTemplate)?.label}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="size-4 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">Follow-up Questions:</span> {data.followUpQuestions.length} defined
                </div>
              </div>
            </div>
          </Card>

          {warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Warnings (optional fixes):</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Candidate View Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-2xl font-semibold mb-4">{data.title}</h3>

            <div className="prose prose-sm max-w-none mb-6">
              <div className="whitespace-pre-wrap text-sm">
                {data.problemStatement || "No problem statement provided."}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Initial Code Template</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{data.codeTemplates[data.primaryLanguage]?.code || "// No code template"}</pre>
              </div>
            </div>

            {visibleTests > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Sample Tests</h4>
                <div className="space-y-2">
                  {data.tests
                    .filter((t) => t.visibleToCandidate)
                    .map((test, i) => (
                      <Card key={test.id} className="p-3 bg-muted/50">
                        <p className="text-sm font-medium mb-1">{test.name}</p>
                        {test.description && <p className="text-xs text-muted-foreground mb-2">{test.description}</p>}
                        <div className="text-xs font-mono space-y-1">
                          {test.setup && (
                            <div>
                              <span className="text-muted-foreground">Setup:</span> {test.setup}
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Input:</span> {test.input}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expected:</span> {test.expectedOutput}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Code Compilation Check</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    <span>Java: Syntax valid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    <span>Python: Syntax valid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    <span>JavaScript: Syntax valid</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Test Execution Check</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    <span>All {data.tests.length} tests can run</span>
                  </div>
                  {visibleTests === 0 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="size-4 text-yellow-500 mt-0.5" />
                      <span>0 tests are visible to candidate - consider making some visible</span>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleValidate} disabled={isValidating} className="w-full">
                {isValidating ? "Validating..." : "Run Full Validation"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft} size="lg">
            Save as Draft
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing} size="lg">
            <Send className="size-4 mr-2" />
            {isPublishing ? "Publishing..." : "Publish Question"}
          </Button>
        </div>
      </div>
    </div>
  )
}

const aiTemplates = [
  { value: "helpful", label: "Helpful Guide" },
  { value: "minimal", label: "Minimal Helper" },
  { value: "socratic", label: "Socratic Method" },
  { value: "strict", label: "Strict Evaluator" },
]
