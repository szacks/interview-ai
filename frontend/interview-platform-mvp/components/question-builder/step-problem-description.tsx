"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import type { QuestionData } from "@/lib/types/question-builder"

interface StepProblemDescriptionProps {
  data: QuestionData
  onUpdate: (data: Partial<QuestionData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepProblemDescription({ data, onUpdate, onNext, onBack }: StepProblemDescriptionProps) {
  const isValid = data.problemStatement.trim() !== ""

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Problem Description</h2>
        <p className="text-muted-foreground">Write the full problem statement candidates will see</p>
      </div>

      <Alert className="mb-6">
        <Info className="size-4" />
        <AlertDescription>
          Use markdown formatting. Include requirements, examples, constraints, and edge cases in your description.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="problem">Full Problem Statement (Markdown)</Label>
            <Textarea
              id="problem"
              placeholder={`## Problem\n\nImplement a rate limiter that...\n\n## Requirements\n\n- Must be thread-safe\n- Support configurable limits\n\n## Example\n\n\`\`\`python\nlimiter = RateLimiter(limit=5, window=60000)\nlimiter.allow_request("user1", 0)  # True\n\`\`\`\n\n## Constraints\n\n- 1 ≤ limit ≤ 1000\n- Time in milliseconds`}
              rows={20}
              className="font-mono text-sm"
              value={data.problemStatement}
              onChange={(e) => onUpdate({ problemStatement: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              This will be rendered as markdown for candidates. Include all examples and constraints here.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between gap-3 mt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid} size="lg">
          Next: Initial Code
        </Button>
      </div>
    </div>
  )
}
