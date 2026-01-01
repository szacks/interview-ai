"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import type { QuestionData, QuestionCategory, QuestionDifficulty } from "@/lib/types/question-builder"

interface StepBasicInfoProps {
  data: QuestionData
  onUpdate: (data: Partial<QuestionData>) => void
  onNext: () => void
}

const categories: { value: QuestionCategory; label: string }[] = [
  { value: "algorithms", label: "Algorithms" },
  { value: "data-structures", label: "Data Structures" },
  { value: "backend", label: "Backend" },
  { value: "frontend", label: "Frontend" },
  { value: "system-design", label: "System Design" },
  { value: "database", label: "Database" },
]

const difficulties: { value: QuestionDifficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "text-green-500" },
  { value: "medium", label: "Medium", color: "text-yellow-500" },
  { value: "hard", label: "Hard", color: "text-red-500" },
]

export function StepBasicInfo({ data, onUpdate, onNext }: StepBasicInfoProps) {
  const isValid = data.title.trim() !== "" && data.description.trim() !== ""

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">Provide basic details about your custom question</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Question Title</Label>
            <Input
              id="title"
              placeholder="e.g., Build a Rate Limiter"
              value={data.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Clear, descriptive title for the coding challenge</p>
          </div>

          {/* Category & Difficulty */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={data.category} onValueChange={(value: QuestionCategory) => onUpdate({ category: value })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={data.difficulty}
                onValueChange={(value: QuestionDifficulty) => onUpdate({ difficulty: value })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      <span className={diff.color}>{diff.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              placeholder="Brief summary of what the candidate needs to build..."
              rows={3}
              value={data.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              1-2 sentences summarizing the question (shown in question list)
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onNext} disabled={!isValid} size="lg">
          Next: Problem Description
        </Button>
      </div>
    </div>
  )
}
