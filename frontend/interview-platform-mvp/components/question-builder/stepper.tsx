"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
  description: string
  isComplete: boolean
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCurrent = step.number === currentStep
          const isComplete = step.isComplete || step.number < currentStep
          const isClickable = step.number < currentStep || step.number === currentStep

          return (
            <li key={step.number} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => isClickable && onStepClick?.(step.number)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left",
                  isCurrent && "bg-primary/10 border border-primary",
                  !isCurrent && isComplete && "hover:bg-muted cursor-pointer",
                  !isCurrent && !isComplete && "opacity-50 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-8 rounded-full shrink-0 transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && !isComplete && "bg-primary text-primary-foreground",
                    !isCurrent && !isComplete && "bg-muted text-muted-foreground",
                  )}
                >
                  {isComplete && step.number < currentStep ? (
                    <Check className="size-4" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-foreground",
                      !isCurrent && isComplete && "text-foreground",
                      !isCurrent && !isComplete && "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
              </button>
              {index < steps.length - 1 && <div className="h-px w-8 bg-border shrink-0" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
