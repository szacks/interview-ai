"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, MessageSquare } from "lucide-react"
import type { QuestionData, AIPromptTemplate, FollowUpQuestion } from "@/lib/types/question-builder"

interface StepAIConfigurationProps {
  data: QuestionData
  onUpdate: (data: Partial<QuestionData>) => void
  onNext: () => void
  onBack: () => void
}

const aiTemplates: { value: AIPromptTemplate; label: string; description: string }[] = [
  {
    value: "helpful",
    label: "Helpful Guide",
    description: "Friendly, proactive, provides code snippets. Best for junior candidates.",
  },
  {
    value: "minimal",
    label: "Minimal Helper",
    description: "Answers only when asked, brief responses. Best for senior candidates.",
  },
  {
    value: "socratic",
    label: "Socratic Method",
    description: "Guides with questions, encourages discovery. Best for problem-solving evaluation.",
  },
  {
    value: "strict",
    label: "Strict Evaluator",
    description: "Challenges assumptions, points out issues. Best for senior roles.",
  },
]

export function StepAIConfiguration({ data, onUpdate, onNext, onBack }: StepAIConfigurationProps) {
  const [showAITest, setShowAITest] = useState(false)

  const addFollowUpQuestion = () => {
    const newQuestion: FollowUpQuestion = {
      id: `fq_${Date.now()}`,
      question: "",
      expectedAnswer: "",
    }
    onUpdate({
      followUpQuestions: [...data.followUpQuestions, newQuestion],
    })
  }

  const updateFollowUp = (id: string, updates: Partial<FollowUpQuestion>) => {
    onUpdate({
      followUpQuestions: data.followUpQuestions.map((fq) => (fq.id === id ? { ...fq, ...updates } : fq)),
    })
  }

  const deleteFollowUp = (id: string) => {
    onUpdate({
      followUpQuestions: data.followUpQuestions.filter((fq) => fq.id !== id),
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">AI Configuration & Follow-Up Questions</h2>
        <p className="text-muted-foreground">
          Configure how the AI assistant should behave and add follow-up questions for interviewers
        </p>
      </div>

      {/* AI Configuration */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">AI Assistant Behavior</h3>

        <div className="space-y-3 mb-6">
          {aiTemplates.map((template) => (
            <button
              key={template.value}
              onClick={() => onUpdate({ aiPromptTemplate: template.value, useCustomPrompt: false })}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                data.aiPromptTemplate === template.value && !data.useCustomPrompt
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`size-4 rounded-full border-2 ${
                    data.aiPromptTemplate === template.value && !data.useCustomPrompt
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                />
                <h4 className="font-medium">{template.label}</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-6">{template.description}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              id="custom-prompt"
              checked={data.useCustomPrompt}
              onCheckedChange={(checked) => onUpdate({ useCustomPrompt: !!checked })}
            />
            <Label htmlFor="custom-prompt" className="font-medium">
              Use custom prompt instead
            </Label>
          </div>

          {data.useCustomPrompt && (
            <div className="space-y-2">
              <Label>Custom AI Prompt</Label>
              <Textarea
                placeholder="You are a specialized assistant for this interview. Your behavior should..."
                rows={8}
                value={data.aiCustomPrompt || ""}
                onChange={(e) => onUpdate({ aiCustomPrompt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Include instructions for intentional weaknesses or specific guidance for the AI
              </p>
            </div>
          )}

          <Button variant="outline" onClick={() => setShowAITest(!showAITest)}>
            <MessageSquare className="size-4 mr-2" />
            {showAITest ? "Hide" : "Test"} AI Chat
          </Button>

          {showAITest && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                AI chat testing will be available after publishing. This allows you to simulate how the AI will respond
                to candidates.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Follow-Up Questions */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Follow-Up Questions for Interviewer</h3>
          <p className="text-sm text-muted-foreground">
            Suggest questions and what answers to look for during the interview
          </p>
        </div>

        <div className="space-y-4">
          {data.followUpQuestions.map((fq, index) => (
            <Card key={fq.id} className="p-4 bg-muted/50">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium">Follow-Up Question {index + 1}</h4>
                <Button variant="ghost" size="sm" onClick={() => deleteFollowUp(fq.id)}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea
                    placeholder="Walk me through your algorithm. How does it work?"
                    rows={2}
                    value={fq.question}
                    onChange={(e) => updateFollowUp(fq.id, { question: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expected Answer (guidance for interviewer)</Label>
                  <Textarea
                    placeholder={`Strong candidates should:\n• Explain the approach clearly\n• Mention key concepts\n• Discuss edge cases\n\nRed flags:\n• Cannot explain own code\n• Vague responses`}
                    rows={5}
                    value={fq.expectedAnswer}
                    onChange={(e) => updateFollowUp(fq.id, { expectedAnswer: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    What you're looking for in the answer. Will be shown to the interviewer during the session.
                  </p>
                </div>
              </div>
            </Card>
          ))}

          <Button variant="outline" onClick={addFollowUpQuestion} className="w-full bg-transparent">
            <Plus className="size-4 mr-2" />
            Add Follow-Up Question
          </Button>
        </div>
      </Card>

      <div className="flex justify-between gap-3 mt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          Next: Preview & Publish
        </Button>
      </div>
    </div>
  )
}
