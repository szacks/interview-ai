"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Database,
  Code2,
  Boxes,
  Network,
  FileText,
  ChevronRight,
  User,
  Briefcase,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { interviewService } from "@/services/interviewService"
import type { Question } from "@/types/interview"

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "algorithm":
      return <Code2 className="size-5" />
    case "data_structures":
      return <Boxes className="size-5" />
    case "backend":
      return <Database className="size-5" />
    case "frontend":
      return <FileText className="size-5" />
    case "system_design":
      return <Database className="size-5" />
    case "database":
      return <Network className="size-5" />
    default:
      return <Code2 className="size-5" />
  }
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "medium":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "hard":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    default:
      return ""
  }
}

export default function NewInterviewPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [questionSearchQuery, setQuestionSearchQuery] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [candidateName, setCandidateName] = useState("")
  const [role, setRole] = useState("")

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [creatingInterview, setCreatingInterview] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const allQuestions = await interviewService.getQuestions()
        setQuestions(allQuestions)
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load questions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentStep === 2) {
      fetchQuestions()
    }
  }, [currentStep, toast])

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(questionSearchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(questionSearchQuery.toLowerCase())
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId)

  const handleCreateInterview = async () => {
    if (!candidateName.trim()) {
      toast({
        title: "Error",
        description: "Candidate name is required",
        variant: "destructive",
      })
      return
    }

    if (!selectedQuestionId) {
      toast({
        title: "Error",
        description: "Please select a question",
        variant: "destructive",
      })
      return
    }

    try {
      setCreatingInterview(true)
      const response = await interviewService.createInterview({
        questionId: selectedQuestionId,
        candidateName: candidateName.trim(),
        role: role.trim() || undefined,
      })
      toast({
        title: "Success",
        description: "Interview created successfully",
      })
      router.push(`/dashboard`)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create interview",
        variant: "destructive",
      })
    } finally {
      setCreatingInterview(false)
    }
  }

  const handleContinueToQuestions = () => {
    if (candidateName.trim()) {
      setCurrentStep(2)
    } else {
      toast({
        title: "Error",
        description: "Please enter candidate name",
        variant: "destructive",
      })
    }
  }

  const handleBackToCandidate = () => {
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Create Interview</h1>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 1 ? "Step 1: Candidate Information" : "Step 2: Select Question (Optional)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <div className="size-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <span className="text-sm font-medium">Candidate</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <div className="size-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <span className="text-sm font-medium">Question</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Flex to fill remaining space */}
      <div className="flex-1 overflow-auto">
      {currentStep === 1 && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border rounded-2xl p-8 md:p-12 shadow-sm">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-4">
                  <User className="size-8" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Candidate Information</h2>
                <p className="text-muted-foreground">Who will be taking this interview?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="candidate-name" className="text-base">
                    Candidate Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    <Input
                      id="candidate-name"
                      placeholder="e.g., Jane Doe"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="pl-11 h-12 text-base"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-base">
                    Role <span className="text-sm text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    <Input
                      id="role"
                      placeholder="e.g., Senior Frontend Developer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="pl-11 h-12 text-base"
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleContinueToQuestions}
                  disabled={!candidateName.trim()}
                  className="w-full h-12 text-base mt-8"
                >
                  Continue to Question Selection
                  <ChevronRight className="size-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="container mx-auto px-4 py-8 pb-24">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleBackToCandidate}>
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span className="font-medium">{candidateName}</span>
                  {role && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground text-sm">{role}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Select a Question <span className="text-destructive">*</span></h3>
                  <p className="text-sm text-muted-foreground mt-1">You can change the question later as long as the interview hasn't gone live</p>
                </div>
                <p className="text-sm text-muted-foreground">{filteredQuestions.length} questions available</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  placeholder="Search questions by title or description..."
                  value={questionSearchQuery}
                  onChange={(e) => setQuestionSearchQuery(e.target.value)}
                  className="pl-11 h-12 text-base"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Question Cards Grid */}
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin">
                  <Code2 className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">Loading questions...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`text-left p-5 rounded-lg border transition-all hover:shadow-lg ${
                      selectedQuestionId === q.id
                        ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`p-2.5 rounded-lg ${
                          selectedQuestionId === q.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {getCategoryIcon(q.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1.5 line-clamp-2 leading-snug">{q.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{q.shortDescription}</p>
                      </div>
                    </div>

                    {/* Card Footer - Metadata */}
                    <div className="flex items-center gap-2 flex-wrap mt-4">
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </Badge>
                      {(q as any).timeLimitMinutes && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {(q as any).timeLimitMinutes} min
                        </div>
                      )}
                    </div>

                    {/* Selected Indicator */}
                    {selectedQuestionId === q.id && (
                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <CheckCircle2 className="size-4" />
                          Selected
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="size-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-2xl">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex-1">
                {selectedQuestionId ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-muted-foreground">Selected Question</div>
                      <div className="font-semibold truncate">{selectedQuestion?.title}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-destructive font-medium">Please select a question to continue</div>
                )}
              </div>
              <Button
                size="lg"
                onClick={handleCreateInterview}
                disabled={creatingInterview || !selectedQuestionId}
                className="min-w-48"
              >
                {creatingInterview ? "Creating..." : "Create Interview"}
                <ChevronRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
