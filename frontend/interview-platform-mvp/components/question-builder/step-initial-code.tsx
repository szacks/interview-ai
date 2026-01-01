"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Check, Info } from "lucide-react"
import type { QuestionData, ProgrammingLanguage } from "@/lib/types/question-builder"

interface StepInitialCodeProps {
  data: QuestionData
  onUpdate: (data: Partial<QuestionData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepInitialCode({ data, onUpdate, onNext, onBack }: StepInitialCodeProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const languages: { value: ProgrammingLanguage; label: string }[] = [
    { value: "java", label: "Java" },
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
  ]

  const hasGeneratedCode = Object.keys(data.codeTemplates).length > 1
  const isValid = data.codeTemplates[data.primaryLanguage]?.code.trim() !== ""

  const handleLanguageChange = (lang: ProgrammingLanguage) => {
    onUpdate({ primaryLanguage: lang })
  }

  const handleCodeChange = (code: string) => {
    onUpdate({
      codeTemplates: {
        ...data.codeTemplates,
        [data.primaryLanguage]: {
          code,
          generated: false,
          reviewed: true,
        },
      },
    })
  }

  const handleGenerateOtherLanguages = async () => {
    setIsGenerating(true)

    // Simulate API call to generate code
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const sourceCode = data.codeTemplates[data.primaryLanguage]?.code || ""

    // Mock generated code (in real app, call AI API)
    const mockGeneratedCode: Record<ProgrammingLanguage, string> = {
      java: `public class Solution {\n    // TODO: Implement\n    public boolean allowRequest(String userId, long timestamp) {\n        return false;\n    }\n}`,
      python: `class Solution:\n    def allow_request(self, user_id: str, timestamp: int) -> bool:\n        # TODO: Implement\n        return False`,
      javascript: `class Solution {\n    allowRequest(userId, timestamp) {\n        // TODO: Implement\n        return false;\n    }\n}`,
    }

    const newTemplates = { ...data.codeTemplates }

    languages.forEach((lang) => {
      if (lang.value !== data.primaryLanguage) {
        newTemplates[lang.value] = {
          code: mockGeneratedCode[lang.value],
          generated: true,
          reviewed: false,
        }
      }
    })

    onUpdate({ codeTemplates: newTemplates })
    setIsGenerating(false)
  }

  const markAsReviewed = (lang: ProgrammingLanguage) => {
    onUpdate({
      codeTemplates: {
        ...data.codeTemplates,
        [lang]: {
          ...data.codeTemplates[lang]!,
          reviewed: true,
        },
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Initial Code Template</h2>
        <p className="text-muted-foreground">Write starter code in one language, we'll convert to others</p>
      </div>

      <Alert className="mb-6">
        <Info className="size-4" />
        <AlertDescription>
          Write the initial code template in your preferred language. Leave TODO comments where candidates should
          implement their solution.
        </AlertDescription>
      </Alert>

      <Card className="p-6 mb-6">
        <div className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label>Primary Language (write code here first)</Label>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang.value}
                  variant={data.primaryLanguage === lang.value ? "default" : "outline"}
                  onClick={() => handleLanguageChange(lang.value)}
                  disabled={hasGeneratedCode}
                >
                  {lang.label}
                </Button>
              ))}
            </div>
            {hasGeneratedCode && (
              <p className="text-xs text-muted-foreground">
                Language locked after generation. Delete generated code to change.
              </p>
            )}
          </div>

          {/* Code Editor */}
          <div className="space-y-2">
            <Label htmlFor="code">{languages.find((l) => l.value === data.primaryLanguage)?.label} Template</Label>
            <Textarea
              id="code"
              placeholder={`class RateLimiter:\n    def __init__(self, limit: int, window_ms: int):\n        # TODO: Initialize your data structures\n        pass\n\n    def allow_request(self, user_id: str, timestamp: int) -> bool:\n        # TODO: Implement rate limiting logic\n        return False`}
              rows={15}
              className="font-mono text-sm"
              value={data.codeTemplates[data.primaryLanguage]?.code || ""}
              onChange={(e) => handleCodeChange(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          {!hasGeneratedCode && isValid && (
            <div className="space-y-2">
              <Button onClick={handleGenerateOtherLanguages} disabled={isGenerating} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                <Sparkles className="size-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Java & JavaScript"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Mark all templates as reviewed (without generating) to skip generation
                  const newTemplates = { ...data.codeTemplates }
                  ;(['java', 'python', 'javascript'] as ProgrammingLanguage[]).forEach((lang) => {
                    if (lang !== data.primaryLanguage && !newTemplates[lang]) {
                      newTemplates[lang] = {
                        code: '',
                        generated: false,
                        reviewed: true,
                      }
                    }
                  })
                  onUpdate({ codeTemplates: newTemplates })
                }}
                size="lg"
                className="w-full border-2 border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                ⏭️ Skip Generation (QA Testing)
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Generated Code Review */}
      {hasGeneratedCode && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Generated Code - Review & Edit</h3>

          {languages
            .filter((lang) => lang.value !== data.primaryLanguage)
            .map((lang) => {
              const template = data.codeTemplates[lang.value]
              if (!template) return null

              return (
                <Card key={lang.value} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{lang.label}</h4>
                        {template.generated && <Badge variant="outline">AI Generated</Badge>}
                        {template.reviewed && (
                          <Badge variant="default" className="bg-green-500">
                            <Check className="size-3 mr-1" />
                            Reviewed
                          </Badge>
                        )}
                      </div>
                      {!template.reviewed && (
                        <Button size="sm" variant="outline" onClick={() => markAsReviewed(lang.value)}>
                          <Check className="size-4 mr-2" />
                          Mark as Reviewed
                        </Button>
                      )}
                    </div>

                    <Textarea
                      rows={12}
                      className="font-mono text-sm"
                      value={template.code}
                      onChange={(e) => {
                        onUpdate({
                          codeTemplates: {
                            ...data.codeTemplates,
                            [lang.value]: {
                              ...template,
                              code: e.target.value,
                            },
                          },
                        })
                      }}
                    />

                    {!template.reviewed && (
                      <Alert>
                        <Info className="size-4" />
                        <AlertDescription>
                          AI-generated code. Please review for accuracy before proceeding.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              )
            })}
        </div>
      )}

      <div className="flex justify-between gap-3 mt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid || (hasGeneratedCode && Object.values(data.codeTemplates).filter((t) => t?.code).some((t) => t && !t.reviewed))}
          size="lg"
        >
          Next: Test Cases
        </Button>
      </div>
    </div>
  )
}
