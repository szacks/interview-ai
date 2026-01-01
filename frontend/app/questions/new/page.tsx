"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { interviewService } from "@/services/interviewService"
import {
  QuestionData,
  createEmptyQuestionData,
  generateId,
  getNonPrimaryLanguages,
  type ProgrammingLanguage,
} from "@/lib/types/question-builder"

// Dynamic import for Monaco Editor
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

// Import step components (we'll create these)
// For now, we'll create simplified inline versions to get the flow working

export default function CreateQuestionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const questionIdParam = searchParams.get("id")
  const [currentStep, setCurrentStep] = useState(1)
  const [questionData, setQuestionData] = useState<QuestionData>(createEmptyQuestionData())
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  // Load existing question if editing
  useEffect(() => {
    if (questionIdParam) {
      const loadQuestion = async () => {
        try {
          setLoading(true)
          const question = await interviewService.getQuestionById(parseInt(questionIdParam))
          // Map backend question to QuestionData format
          setQuestionData({
            id: question.id,
            title: question.title,
            category: (question as any).category || "algorithm",
            difficulty: question.difficulty as any,
            shortDescription: (question as any).short_description || "",
            description: question.description,
            primaryLanguage: ((question as any).primary_language || "javascript") as ProgrammingLanguage,
            codeTemplates: {
              java: {
                code: question.initialCodeJava || "",
                generated: (question as any).generated_languages?.java?.generated || false,
                reviewed: (question as any).generated_languages?.java?.reviewed || true,
              },
              python: {
                code: question.initialCodePython || "",
                generated: (question as any).generated_languages?.python?.generated || false,
                reviewed: (question as any).generated_languages?.python?.reviewed || true,
              },
              javascript: {
                code: question.initialCodeJavascript || "",
                generated: (question as any).generated_languages?.javascript?.generated || false,
                reviewed: (question as any).generated_languages?.javascript?.reviewed || true,
              },
            },
            tests: JSON.parse((question as any).tests_json || "[]").tests || [],
            aiPromptTemplate: ((question as any).ai_prompt_template || "helpful") as any,
            useCustomPrompt: !!((question as any).ai_custom_prompt),
            aiCustomPrompt: (question as any).ai_custom_prompt || "",
            followUpQuestions: (question as any).followup_questions || [],
            status: ((question as any).status || "draft") as any,
          })
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to load question",
            variant: "destructive",
          })
          router.push("/questions")
        } finally {
          setLoading(false)
        }
      }
      loadQuestion()
    }
  }, [questionIdParam])

  const updateQuestionData = (updates: Partial<QuestionData>) => {
    setQuestionData((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    // Basic validation for current step
    if (currentStep === 1) {
      if (!questionData.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a question title",
          variant: "destructive",
        })
        return
      }
      if (!questionData.shortDescription.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a short description",
          variant: "destructive",
        })
        return
      }
    }

    if (currentStep === 2) {
      if (!questionData.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter a problem description",
          variant: "destructive",
        })
        return
      }
    }

    if (currentStep === 3) {
      if (!questionData.codeTemplates[questionData.primaryLanguage].code.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter code for the primary language",
          variant: "destructive",
        })
        return
      }
      // Check if code has been generated for other languages OR if skip generation was clicked
      const hasGeneratedCode = Object.values(questionData.codeTemplates).some((t) => t.generated)
      const hasSkippedGeneration = getNonPrimaryLanguages(questionData.primaryLanguage).every((lang) => !questionData.codeTemplates[lang].code && questionData.codeTemplates[lang].reviewed)

      if (!hasGeneratedCode && !hasSkippedGeneration) {
        toast({
          title: "Validation Error",
          description: "Please click 'Generate Other Languages' or 'Skip Generation' to proceed",
          variant: "destructive",
        })
        return
      }

      // Check if all generated languages have been reviewed
      const nonPrimaryLanguages = getNonPrimaryLanguages(questionData.primaryLanguage)
      const allReviewed = nonPrimaryLanguages.every((lang) => !questionData.codeTemplates[lang].generated || questionData.codeTemplates[lang].reviewed)
      if (!allReviewed) {
        toast({
          title: "Validation Error",
          description: "Please review all generated code before proceeding",
          variant: "destructive",
        })
        return
      }
    }

    if (currentStep === 4) {
      if (questionData.tests.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one test case",
          variant: "destructive",
        })
        return
      }
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true)
      const payload = {
        title: questionData.title,
        category: questionData.category,
        difficulty: questionData.difficulty,
        shortDescription: questionData.shortDescription,
        description: questionData.description,
        primaryLanguage: questionData.primaryLanguage,
        initialCodeJava: questionData.codeTemplates.java.code,
        initialCodePython: questionData.codeTemplates.python.code,
        initialCodeJavascript: questionData.codeTemplates.javascript.code,
        testsJson: JSON.stringify({ tests: questionData.tests }),
        aiPromptTemplate: questionData.aiPromptTemplate,
        aiCustomPrompt: questionData.useCustomPrompt ? questionData.aiCustomPrompt : undefined,
        followupQuestions: questionData.followUpQuestions,
        status: "draft",
      }

      if (questionData.id) {
        await interviewService.updateQuestion(questionData.id, payload)
        toast({
          title: "Success",
          description: "Question draft saved",
        })
      } else {
        await interviewService.createQuestion(payload)
        toast({
          title: "Success",
          description: "Question draft created",
        })
      }

      router.push("/questions")
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      })
    } finally {
      setSavingDraft(false)
    }
  }

  const handlePublish = async () => {
    try {
      setSavingDraft(true)
      const payload = {
        title: questionData.title,
        category: questionData.category,
        difficulty: questionData.difficulty,
        shortDescription: questionData.shortDescription,
        description: questionData.description,
        primaryLanguage: questionData.primaryLanguage,
        initialCodeJava: questionData.codeTemplates.java.code,
        initialCodePython: questionData.codeTemplates.python.code,
        initialCodeJavascript: questionData.codeTemplates.javascript.code,
        testsJson: JSON.stringify({ tests: questionData.tests }),
        aiPromptTemplate: questionData.aiPromptTemplate,
        aiCustomPrompt: questionData.useCustomPrompt ? questionData.aiCustomPrompt : undefined,
        followupQuestions: questionData.followUpQuestions,
        status: "published",
      }

      if (questionData.id) {
        await interviewService.updateQuestion(questionData.id, payload)
        toast({
          title: "Success",
          description: "Question published successfully",
        })
      } else {
        await interviewService.createQuestion(payload)
        toast({
          title: "Success",
          description: "Question created and published",
        })
      }

      router.push("/questions")
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to publish question",
        variant: "destructive",
      })
    } finally {
      setSavingDraft(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading question...</p>
      </div>
    )
  }

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Problem Description" },
    { number: 3, title: "Initial Code" },
    { number: 4, title: "Test Cases" },
    { number: 5, title: "AI Configuration" },
    { number: 6, title: "Follow-Up Questions" },
    { number: 7, title: "Preview & Publish" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/questions")}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {questionData.id ? "Edit Question" : "Create New Question"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setCurrentStep(step.number)}
                  className={`size-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors flex-shrink-0 ${
                    currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.number
                        ? "bg-primary/30 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number}
                </button>
                <div className="hidden sm:block min-w-fit">
                  <p className="text-xs font-medium whitespace-nowrap">{step.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block flex-shrink-0 mx-0.5 h-0.5 w-8 bg-muted"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <StepBasicInfo data={questionData} onUpdate={updateQuestionData} />
            )}

            {/* Step 2: Problem Description */}
            {currentStep === 2 && (
              <StepProblemDescription data={questionData} onUpdate={updateQuestionData} />
            )}

            {/* Step 3: Initial Code */}
            {currentStep === 3 && (
              <StepInitialCode data={questionData} onUpdate={updateQuestionData} />
            )}

            {/* Step 4: Test Cases */}
            {currentStep === 4 && (
              <StepTestCases data={questionData} onUpdate={updateQuestionData} />
            )}

            {/* Step 5: AI Configuration & Follow-Up */}
            {currentStep === 5 && (
              <StepAIConfiguration data={questionData} onUpdate={updateQuestionData} />
            )}

            {/* Step 6: Follow-Up Questions */}
            {currentStep === 6 && (
              <StepFollowUpQuestions data={questionData} onUpdate={updateQuestionData} />
            )}

            {/* Step 7: Preview & Publish */}
            {currentStep === 7 && (
              <StepPublish data={questionData} />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={savingDraft}
            >
              {savingDraft ? "Saving..." : "Save Draft"}
            </Button>
            {currentStep === 7 ? (
              <Button
                onClick={handlePublish}
                disabled={savingDraft}
              >
                {savingDraft ? "Publishing..." : "Publish"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Step Components
// ============================================================================

function StepBasicInfo({
  data,
  onUpdate,
}: {
  data: QuestionData
  onUpdate: (updates: Partial<QuestionData>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Question Title *</Label>
        <Input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Build a Rate Limiter"
        />
        <p className="text-xs text-muted-foreground">10-255 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty *</Label>
        <Select value={data.difficulty} onValueChange={(value) => onUpdate({ difficulty: value as any })}>
          <SelectTrigger id="difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="short-description">Short Description *</Label>
        <Textarea
          id="short-description"
          value={data.shortDescription}
          onChange={(e) => onUpdate({ shortDescription: e.target.value })}
          placeholder="Build a thread-safe rate limiter that supports limiting requests per user within a time window"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">1-2 sentences (50-500 characters)</p>
      </div>
    </div>
  )
}

function StepProblemDescription({
  data,
  onUpdate,
}: {
  data: QuestionData
  onUpdate: (updates: Partial<QuestionData>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Problem Description (Markdown) *</Label>
        <p className="text-xs text-muted-foreground">
          Include problem statement, requirements, constraints, and examples
        </p>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder={`# Rate Limiter

Implement a rate limiter that allows a maximum number of requests per user within a given time window.

## Requirements
- Support configurable rate limits (e.g., 5 requests per minute)
- Thread-safe implementation
- Handle edge cases (empty user ID, negative timestamp, null values)

## Constraints
- Handle up to 1000 concurrent users
- Support 1-60 requests per minute range
- Memory efficient - cleanup old timestamps

## Examples

### Example 1: Basic Usage
\`\`\`java
RateLimiter limiter = new RateLimiter(2, 1000);
limiter.allowRequest("user1", 0);     // true (first request)
limiter.allowRequest("user1", 100);   // true (second request)
limiter.allowRequest("user1", 200);   // false (rate limit exceeded)
limiter.allowRequest("user1", 1100);  // true (window reset)
\`\`\``}
          rows={12}
          className="font-mono text-xs"
        />
      </div>
    </div>
  )
}

function StepInitialCode({
  data,
  onUpdate,
}: {
  data: QuestionData
  onUpdate: (updates: Partial<QuestionData>) => void
}) {
  const [converting, setConverting] = useState(false)

  const getExampleCode = (language: string): string => {
    switch (language) {
      case "python":
        return `# ex: class RateLimiter:
# ex:     def __init__(self, limit, window_ms):
# ex:         # TODO: Initialize
# ex:         pass
# ex:
# ex:     def allow_request(self, user_id, timestamp):
# ex:         # TODO: Implement
# ex:         return False`
      case "javascript":
        return `// ex: class RateLimiter {
// ex:     constructor(limit, windowMs) {
// ex:         // TODO: Initialize
// ex:     }
// ex:
// ex:     allowRequest(userId, timestamp) {
// ex:         // TODO: Implement
// ex:         return false;
// ex:     }
// ex: }`
      case "java":
      default:
        return `// ex: public class RateLimiter {
// ex:     public RateLimiter(int limit, long windowMs) {
// ex:         // TODO: Initialize
// ex:     }
// ex:
// ex:     public boolean allowRequest(String userId, long timestamp) {
// ex:         // TODO: Implement
// ex:         return false;
// ex:     }
// ex: }`
    }
  }

  // Set example code when language changes and code is empty
  useEffect(() => {
    const currentCode = data.codeTemplates[data.primaryLanguage].code.trim()
    if (!currentCode) {
      onUpdate({
        codeTemplates: {
          ...data.codeTemplates,
          [data.primaryLanguage]: {
            ...data.codeTemplates[data.primaryLanguage],
            code: getExampleCode(data.primaryLanguage),
          },
        },
      })
    }
  }, [data.primaryLanguage])

  const handleConvertCode = async () => {
    if (!data.codeTemplates[data.primaryLanguage].code.trim()) {
      alert("Please enter code first")
      return
    }

    setConverting(true)
    try {
      const nonPrimaryLanguages = getNonPrimaryLanguages(data.primaryLanguage)
      const updatedCodeTemplates = { ...data.codeTemplates }

      for (const targetLanguage of nonPrimaryLanguages) {
        try {
          const response = await interviewService.convertCode({
            sourceLanguage: data.primaryLanguage,
            targetLanguage,
            sourceCode: data.codeTemplates[data.primaryLanguage].code,
          })

          if (response?.success) {
            updatedCodeTemplates[targetLanguage] = {
              code: response.convertedCode,
              generated: true,
              reviewed: false,
            }
          } else if (response?.error) {
            console.error(`Failed to convert to ${targetLanguage}: ${response.error}`)
          }
        } catch (err) {
          console.error(`Failed to convert to ${targetLanguage}:`, err)
        }
      }

      // Apply all updates at once
      onUpdate({
        codeTemplates: updatedCodeTemplates,
      })
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="primary-lang">Language</Label>
        <Select value={data.primaryLanguage} onValueChange={(value) => onUpdate({ primaryLanguage: value as ProgrammingLanguage })}>
          <SelectTrigger id="primary-lang">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm font-semibold text-foreground">
        Write code, then AI will auto-convert to other languages
      </p>

      <div className="border rounded-lg overflow-hidden" style={{ height: "400px" }}>
        <Editor
          height="100%"
          language={data.primaryLanguage}
          value={data.codeTemplates[data.primaryLanguage].code}
          onChange={(value) =>
            onUpdate({
              codeTemplates: {
                ...data.codeTemplates,
                [data.primaryLanguage]: {
                  ...data.codeTemplates[data.primaryLanguage],
                  code: value || "",
                },
              },
            })
          }
          theme="vs-dark"
          defaultValue={getExampleCode(data.primaryLanguage)}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      <Button
        onClick={handleConvertCode}
        disabled={converting}
      >
        {converting ? "Converting..." : "✨ Generate Languages"}
      </Button>

      {/* Display generated code - only after generation */}
      {Object.values(data.codeTemplates).some((t) => t.generated) &&
        getNonPrimaryLanguages(data.primaryLanguage).map((lang) => (
          <div key={lang} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{lang.toUpperCase()}</Label>
              {data.codeTemplates[lang].generated && (
                <Button
                  size="sm"
                  onClick={() =>
                    onUpdate({
                      codeTemplates: {
                        ...data.codeTemplates,
                        [lang]: {
                          ...data.codeTemplates[lang],
                          reviewed: !data.codeTemplates[lang].reviewed,
                        },
                      },
                    })
                  }
                >
                  {data.codeTemplates[lang].reviewed ? "✓ Reviewed" : "Mark Reviewed"}
                </Button>
              )}
            </div>
            <div className="border rounded-lg overflow-hidden" style={{ height: "300px" }}>
              <Editor
                height="100%"
                language={lang}
                value={data.codeTemplates[lang].code}
                onChange={(value) =>
                  onUpdate({
                    codeTemplates: {
                      ...data.codeTemplates,
                      [lang]: {
                        ...data.codeTemplates[lang],
                        code: value || "",
                      },
                    },
                  })
                }
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        ))}

    </div>
  )
}

function StepTestCases({
  data,
  onUpdate,
}: {
  data: QuestionData
  onUpdate: (updates: Partial<QuestionData>) => void
}) {
  const addTest = () => {
    const newTest = {
      id: generateId("test"),
      name: "",
      description: "",
      setup: "",
      input: "",
      expectedOutput: "",
      visibleToCandidate: true,
      timeout: 5000,
    }
    onUpdate({ tests: [...data.tests, newTest] })
  }

  const updateTest = (index: number, updates: any) => {
    const newTests = [...data.tests]
    newTests[index] = { ...newTests[index], ...updates }
    onUpdate({ tests: newTests })
  }

  const removeTest = (index: number) => {
    onUpdate({ tests: data.tests.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      {data.tests.map((test, index) => (
        <Card key={test.id} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Test {index + 1}</h4>
              <button
                onClick={() => removeTest(index)}
                className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Remove
              </button>
            </div>

            <Input
              value={test.name}
              onChange={(e) => updateTest(index, { name: e.target.value })}
              placeholder="Basic Usage"
            />

            <Textarea
              value={test.description || ""}
              onChange={(e) => updateTest(index, { description: e.target.value })}
              placeholder="First request should be allowed"
              rows={2}
            />

            <Textarea
              value={test.setup || ""}
              onChange={(e) => updateTest(index, { setup: e.target.value })}
              placeholder="const limiter = new RateLimiter(2, 1000);"
              rows={4}
              className="bg-gray-950 text-gray-50 border-gray-800 font-mono text-sm"
            />

            <Textarea
              value={test.input}
              onChange={(e) => updateTest(index, { input: e.target.value })}
              placeholder="limiter.allowRequest('user1', 0)"
              rows={5}
              className="bg-gray-950 text-gray-50 border-gray-800 font-mono text-sm"
            />

            <Textarea
              value={test.expectedOutput}
              onChange={(e) => updateTest(index, { expectedOutput: e.target.value })}
              placeholder="true"
              rows={5}
              className="bg-gray-950 text-gray-50 border-gray-800 font-mono text-sm"
            />

            <div className="flex items-center gap-2">
              <Checkbox
                id={`visible-${index}`}
                checked={test.visibleToCandidate}
                onCheckedChange={(checked) => updateTest(index, { visibleToCandidate: checked })}
              />
              <Label htmlFor={`visible-${index}`} className="text-sm cursor-pointer">
                Show to candidate (sample test)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`timeout-${index}`}>Timeout (ms)</Label>
              <Input
                id={`timeout-${index}`}
                type="number"
                value={test.timeout}
                onChange={(e) => updateTest(index, { timeout: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </Card>
      ))}

      <Button onClick={addTest} variant="outline" className="w-full">
        + Add Test Case
      </Button>

      <div className="p-3 bg-muted rounded text-sm">
        <p className="font-medium mb-1">Test Summary</p>
        <p className="text-muted-foreground">
          • {data.tests.length} total tests
        </p>
        <p className="text-muted-foreground">
          • {data.tests.filter((t) => t.visibleToCandidate).length} visible to candidate
        </p>
        <p className="text-muted-foreground">
          • {data.tests.filter((t) => !t.visibleToCandidate).length} hidden
        </p>
      </div>
    </div>
  )
}

function StepAIConfiguration({
  data,
  onUpdate,
}: {
  data: QuestionData
  onUpdate: (updates: Partial<QuestionData>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">AI Behavior Preset</Label>
        <div className="space-y-2">
          {[
            {
              value: "helpful",
              label: "Helpful Guide",
              desc: "Friendly, proactive, provides code snippets",
            },
            {
              value: "minimal",
              label: "Minimal Helper",
              desc: "Answers only when asked, no volunteering",
            },
            { value: "socratic", label: "Socratic Method", desc: "Asks questions, guides with inquiry" },
            { value: "strict", label: "Strict Evaluator", desc: "Points out issues, challenges assumptions" },
          ].map((option) => (
            <div key={option.value} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted transition">
              <input
                type="radio"
                id={`ai-${option.value}`}
                name="aiTemplate"
                value={option.value}
                checked={data.aiPromptTemplate === option.value}
                onChange={(e) => onUpdate({ aiPromptTemplate: e.target.value as any })}
              />
              <label htmlFor={`ai-${option.value}`} className="flex-1 cursor-pointer">
                <p className="font-medium text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="custom-prompt"
          checked={data.useCustomPrompt}
          onCheckedChange={(checked) => onUpdate({ useCustomPrompt: checked as boolean })}
        />
        <Label htmlFor="custom-prompt" className="cursor-pointer">
          Use custom prompt instead
        </Label>
      </div>

      {data.useCustomPrompt && (
        <div className="space-y-2">
          <Label htmlFor="custom-ai-prompt">Custom AI Prompt</Label>
          <Textarea
            id="custom-ai-prompt"
            value={data.aiCustomPrompt || ""}
            onChange={(e) => onUpdate({ aiCustomPrompt: e.target.value })}
            placeholder={`You are a helpful coding assistant for a rate limiter problem.

BEHAVIOR:
- Provide code snippets when asked
- Explain concepts clearly
- Guide the candidate step-by-step
- Be encouraging and supportive

IMPORTANT RESTRICTIONS:
- Never provide complete solutions
- Intentionally provide weak implementations when first asked
- Only improve when explicitly questioned
- Encourage the candidate to think through problems`}
            rows={8}
          />
        </div>
      )}
    </div>
  )
}

function StepFollowUpQuestions({
  data,
  onUpdate,
}: {
  data: QuestionData
  onUpdate: (updates: Partial<QuestionData>) => void
}) {
  const addFollowUp = () => {
    const newFollowUp = {
      id: generateId("fq"),
      question: "",
      expectedAnswer: "",
    }
    onUpdate({ followUpQuestions: [...data.followUpQuestions, newFollowUp] })
  }

  const updateFollowUp = (index: number, updates: any) => {
    const newFollowUps = [...data.followUpQuestions]
    newFollowUps[index] = { ...newFollowUps[index], ...updates }
    onUpdate({ followUpQuestions: newFollowUps })
  }

  const removeFollowUp = (index: number) => {
    onUpdate({ followUpQuestions: data.followUpQuestions.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add questions for the interviewer to ask, and guidance on what to listen for
      </p>

      {data.followUpQuestions.map((followUp, index) => (
        <Card key={followUp.id} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Follow-Up Question {index + 1}</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFollowUp(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Remove
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`followup-q-${index}`}>Question</Label>
              <Textarea
                id={`followup-q-${index}`}
                value={followUp.question}
                onChange={(e) => updateFollowUp(index, { question: e.target.value })}
                placeholder="Walk me through your rate limiting algorithm. How does it work?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`followup-a-${index}`}>Expected Answer Guidance</Label>
              <Textarea
                id={`followup-a-${index}`}
                value={followUp.expectedAnswer}
                onChange={(e) => updateFollowUp(index, { expectedAnswer: e.target.value })}
                placeholder={`Strong candidates should:
• Explain sliding window or token bucket approach
• Mention timestamp tracking
• Discuss cleanup strategy

Red flags:
• Cannot explain own code
• Vague "it just works" responses`}
                rows={3}
              />
            </div>
          </div>
        </Card>
      ))}

      <Button onClick={addFollowUp} variant="outline" className="w-full">
        + Add Follow-Up Question
      </Button>
    </div>
  )
}

function StepPublish({ data }: { data: QuestionData }) {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/50">
        <h4 className="font-medium mb-3">Question Summary</h4>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium">Title</dt>
            <dd className="text-muted-foreground">{data.title}</dd>
          </div>
          <div>
            <dt className="font-medium">Category</dt>
            <dd className="text-muted-foreground">{data.category}</dd>
          </div>
          <div>
            <dt className="font-medium">Difficulty</dt>
            <dd className="text-muted-foreground">{data.difficulty}</dd>
          </div>
          <div>
            <dt className="font-medium">Languages</dt>
            <dd className="text-muted-foreground">Java, Python, JavaScript</dd>
          </div>
          <div>
            <dt className="font-medium">Test Cases</dt>
            <dd className="text-muted-foreground">
              {data.tests.length} total ({data.tests.filter((t) => t.visibleToCandidate).length} visible)
            </dd>
          </div>
          <div>
            <dt className="font-medium">AI Assistant</dt>
            <dd className="text-muted-foreground">
              {data.useCustomPrompt ? "Custom prompt" : data.aiPromptTemplate}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Follow-Up Questions</dt>
            <dd className="text-muted-foreground">{data.followUpQuestions.length} questions</dd>
          </div>
        </dl>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <p className="text-blue-900">
          ✓ Review the summary above and click <strong>Publish</strong> to make this question available for interviews,
          or click <strong>Save Draft</strong> to finish later.
        </p>
      </div>
    </div>
  )
}
