"use client"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Stepper } from "@/components/question-builder/stepper"
import { StepBasicInfo } from "@/components/question-builder/step-basic-info"
import { StepProblemDescription } from "@/components/question-builder/step-problem-description"
import { StepInitialCode } from "@/components/question-builder/step-initial-code"
import { StepTestCases } from "@/components/question-builder/step-test-cases"
import { StepAIConfiguration } from "@/components/question-builder/step-ai-configuration"
import { StepPreviewValidation } from "@/components/question-builder/step-preview-validation"
import type { QuestionData, QuestionBuilderStep } from "@/lib/types/question-builder"

const initialQuestionData: QuestionData = {
  title: "",
  category: "algorithms",
  difficulty: "medium",
  description: "",
  problemStatement: "",
  primaryLanguage: "python",
  codeTemplates: {},
  tests: [],
  aiPromptTemplate: "helpful",
  useCustomPrompt: false,
  followUpQuestions: [],
  status: "draft",
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default function NewQuestionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [questionData, setQuestionData] = useState<QuestionData>(initialQuestionData)

  const steps: QuestionBuilderStep[] = [
    { number: 1, title: "Basic Info", description: "Title & category", isComplete: false },
    { number: 2, title: "Problem", description: "Problem statement", isComplete: false },
    { number: 3, title: "Initial Code", description: "Code templates", isComplete: false },
    { number: 4, title: "Test Cases", description: "Add test cases", isComplete: false },
    { number: 5, title: "AI & Follow-up", description: "Configure AI", isComplete: false },
    { number: 6, title: "Preview & Publish", description: "Validate & publish", isComplete: false },
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = () => {
    console.log("[v0] Saving draft:", questionData)
    // TODO: Implement save draft API call
  }

  const updateQuestionData = (updates: Partial<QuestionData>) => {
    setQuestionData({ ...questionData, ...updates, updatedAt: new Date() })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo data={questionData} onUpdate={updateQuestionData} onNext={handleNext} />
      case 2:
        return (
          <StepProblemDescription
            data={questionData}
            onUpdate={updateQuestionData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <StepInitialCode data={questionData} onUpdate={updateQuestionData} onNext={handleNext} onBack={handleBack} />
        )
      case 4:
        return (
          <StepTestCases data={questionData} onUpdate={updateQuestionData} onNext={handleNext} onBack={handleBack} />
        )
      case 5:
        return (
          <StepAIConfiguration
            data={questionData}
            onUpdate={updateQuestionData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 6:
        return <StepPreviewValidation data={questionData} onUpdate={updateQuestionData} onBack={handleBack} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Create Custom Question</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="size-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <Stepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">{renderStep()}</main>
    </div>
  )
}
