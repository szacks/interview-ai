"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Code2, Plus, Search, MoreVertical, Edit2, Copy, Trash2, Archive } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { interviewService } from "@/services/interviewService"
import type { Question } from "@/types/interview"
import QuestionsFilters from "@/frontend/interview-platform-mvp/components/questions/questions-filters"

export default function QuestionsPage() {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [selectedQuestionForDuplicate, setSelectedQuestionForDuplicate] = useState<Question | null>(null)
  const [duplicateTitle, setDuplicateTitle] = useState("")

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const data = await interviewService.getQuestions()
        setQuestions(data as Question[])
        setError(null)
      } catch (err) {
        setError("Failed to load questions")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  // Filter questions
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.description && question.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || (question as any).category === categoryFilter
    const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter
    const matchesStatus = statusFilter === "all" || (question as any).status === statusFilter

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus
  })

  // Separate company questions from platform questions
  const companyQuestions = filteredQuestions.filter((q) => (q as any).company_id)
  const platformQuestions = filteredQuestions.filter((q) => !(q as any).company_id)

  const handleDuplicate = async () => {
    if (!selectedQuestionForDuplicate || !duplicateTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the duplicated question",
        variant: "destructive",
      })
      return
    }

    try {
      // TODO: Implement duplicate endpoint on backend
      // For now, create a new question based on the selected one
      const duplicateData = {
        ...selectedQuestionForDuplicate,
        title: duplicateTitle,
        status: "draft",
      }
      await interviewService.createQuestion(duplicateData)

      toast({
        title: "Success",
        description: "Question duplicated successfully",
      })

      // Refresh questions list
      const data = await interviewService.getQuestions()
      setQuestions(data as Question[])

      // Reset dialog
      setDuplicateDialogOpen(false)
      setSelectedQuestionForDuplicate(null)
      setDuplicateTitle("")
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to duplicate question",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (questionId: number) => {
    if (!confirm("Are you sure you want to archive this question?")) {
      return
    }

    try {
      await interviewService.deleteQuestion(questionId)
      setQuestions(questions.filter((q) => q.id !== questionId))
      toast({
        title: "Success",
        description: "Question archived successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to archive question",
        variant: "destructive",
      })
    }
  }

  const QuestionCard = ({ question }: { question: Question }) => (
    <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-base truncate">{question.title}</h3>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {question.difficulty}
            </Badge>
            {((question as any).status === "DRAFT" || (question as any).status === "draft") && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '0.375rem',
                  paddingLeft: '0.375rem',
                  paddingRight: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: '#FBBF24',
                  color: '#78350F'
                }}
              >
                Draft
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{question.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-3">
            <span>Category: {(question as any).category || "N/A"}</span>
            {(question as any).usage_count && (
              <>
                <span>•</span>
                <span>Used {(question as any).usage_count} times</span>
              </>
            )}
            {(question as any).average_score && (
              <>
                <span>•</span>
                <span>Avg Score: {(question as any).average_score.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/questions/new?id=${question.id}`}>
            <Button size="sm" variant="outline">
              <Edit2 className="size-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedQuestionForDuplicate(question)
                  setDuplicateTitle(`${question.title} (Copy)`)
                  setDuplicateDialogOpen(true)
                }}
              >
                <Copy className="size-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(question.id)}
              >
                <Trash2 className="size-4 mr-2" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="size-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">InterviewAI - Questions</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Questions Library</h2>
            <p className="text-muted-foreground text-sm">Create and manage technical interview questions</p>
          </div>
          <Link href="/questions/new">
            <Button>
              <Plus className="size-4 mr-2" />
              New Question
            </Button>
          </Link>
        </div>

        {/* Filters - Using the questions-filters component */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm mb-6">
            {error}
          </div>
        ) : (
          <>
            {/* Company Questions */}
            {companyQuestions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Your Company Questions ({companyQuestions.length})</h3>
                <div className="space-y-3">
                  {companyQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              </div>
            )}

            {/* Platform Questions */}
            {platformQuestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Platform Questions ({platformQuestions.length})</h3>
                <div className="space-y-3">
                  {platformQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              </div>
            )}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <div className="size-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Search className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== "all" || difficultyFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first question to get started"}
                </p>
                {!searchQuery && categoryFilter === "all" && difficultyFilter === "all" && (
                  <Link href="/questions/new">
                    <Button>
                      <Plus className="size-4 mr-2" />
                      Create Question
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Question</DialogTitle>
            <DialogDescription>
              Create a copy of "{selectedQuestionForDuplicate?.title}" with a new title
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Title</label>
              <Input
                value={duplicateTitle}
                onChange={(e) => setDuplicateTitle(e.target.value)}
                placeholder="Enter new title..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDuplicateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleDuplicate}>
                Duplicate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
