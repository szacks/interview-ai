"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Code2,
  Plus,
  Search,
  MoreVertical,
  Copy,
  Play,
  Trash2,
  Eye,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { interviewService } from "@/services/interviewService"
import { evaluationService } from "@/services/evaluationService"
import type { Question, Interview } from "@/types/interview"

export default function DashboardPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Backend data states
  const [allInterviews, setAllInterviews] = useState<Interview[]>([])
  const [weekInterviews, setWeekInterviews] = useState<Interview[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evaluationStatuses, setEvaluationStatuses] = useState<Record<number, { isDraft: boolean; updatedAt?: string }>>({})
  const [loadingEvaluations, setLoadingEvaluations] = useState(false)

  // Form states
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [candidateName, setCandidateName] = useState("")
  const [role, setRole] = useState("")
  const [creating, setCreating] = useState(false)

  // Fetch interviews and questions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [allInterviewsData, weekInterviewsData, questionsData] = await Promise.all([
          interviewService.getInterviews(),
          interviewService.getInterviewsFromLastSevenDays(),
          interviewService.getQuestions(),
        ])
        setAllInterviews(allInterviewsData as Interview[])
        setWeekInterviews(weekInterviewsData as Interview[])
        setQuestions(questionsData)
        setError(null)
      } catch (err) {
        setError("Failed to load data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch evaluation statuses for completed interviews
  useEffect(() => {
    const fetchEvaluationStatuses = async () => {
      const completedInterviews = allInterviews.filter(i => i.status === 'completed' || i.status === 'ended')

      if (completedInterviews.length === 0) {
        return
      }

      try {
        setLoadingEvaluations(true)
        const statuses: Record<number, { isDraft: boolean; updatedAt?: string }> = {}

        await Promise.all(
          completedInterviews.map(async (interview) => {
            try {
              const evaluation = await evaluationService.getEvaluation(interview.id)
              statuses[interview.id] = {
                isDraft: evaluation.isDraft ?? true,
                updatedAt: evaluation.updatedAt,
              }
            } catch (err) {
              // If evaluation doesn't exist, mark as draft
              statuses[interview.id] = { isDraft: true }
            }
          })
        )

        setEvaluationStatuses(statuses)
      } catch (err) {
        console.error("Failed to fetch evaluation statuses:", err)
      } finally {
        setLoadingEvaluations(false)
      }
    }

    if (allInterviews.length > 0) {
      fetchEvaluationStatuses()
    }
  }, [allInterviews])

  const handleCreateInterview = async () => {
    if (!selectedQuestionId) {
      setError("Please select a question")
      return
    }

    if (!candidateName.trim()) {
      setError("Candidate name is required")
      return
    }

    try {
      setCreating(true)
      setError(null)

      // Create candidate with the provided name
      const candidate = await interviewService.createCandidate(
        candidateName.trim(),
        `${candidateName.trim().toLowerCase().replace(/\s+/g, '.')}@candidate.local`
      )

      // Create interview with the newly created candidate
      await interviewService.createInterview({
        questionId: selectedQuestionId,
        candidateId: candidate.id,
        language: "javascript", // Language will be selected by candidate when they start
        scheduledAt: new Date().toISOString(),
      })

      // Reset form
      setSelectedQuestionId(null)
      setCandidateName("")
      setRole("")
      setCreateDialogOpen(false)

      // Refresh interviews list
      const [updatedAllInterviews, updatedWeekInterviews] = await Promise.all([
        interviewService.getInterviews(),
        interviewService.getInterviewsFromLastSevenDays(),
      ])
      setAllInterviews(updatedAllInterviews as Interview[])
      setWeekInterviews(updatedWeekInterviews as Interview[])
    } catch (err) {
      setError("Failed to create interview")
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  // Determine which interviews to show
  const interviewsToDisplay = searchQuery ? allInterviews : weekInterviews

  // Filter interviews based on search query
  const filteredInterviews = interviewsToDisplay.filter((interview: Interview) => {
    const candidateName = interview.candidateName || interview.candidate?.name || ""
    const questionTitle = interview.questionTitle || interview.question?.title || ""
    const matchesSearch =
      candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      questionTitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
      case "live":
        return (
          <Badge className="bg-accent text-accent-foreground">
            <div className="size-1.5 rounded-full bg-accent-foreground mr-1.5 animate-pulse" />
            Live
          </Badge>
        )
      case "scheduled":
      case "pending":
        return (
          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
            <Clock className="size-3 mr-1" />
            Pending
          </Badge>
        )
      case "completed":
      case "cancelled":
      case "ended":
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="size-3 mr-1" />
            Ended
          </Badge>
        )
      default:
        return null
    }
  }

  const copyToClipboard = async (token: string) => {
    try {
      const url = `${window.location.origin}/i/${token}`
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied!",
        description: "Interview link has been copied to your clipboard.",
        duration: 2000,
      })
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to your clipboard.",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleDeleteInterview = async (interviewId: number) => {
    if (!confirm("Are you sure you want to delete this interview?")) {
      return
    }

    try {
      setAllInterviews(allInterviews.filter(i => i.id !== interviewId))
      setWeekInterviews(weekInterviews.filter(i => i.id !== interviewId))
    } catch (err) {
      console.error("Failed to delete interview:", err)
      alert("Failed to delete interview")
    }
  }

  const handleEndInterview = async (interviewId: number) => {
    if (!confirm("Are you sure you want to end this interview?")) {
      return
    }

    try {
      // Update interview status to completed
      await interviewService.updateInterviewStatus(interviewId, "completed")

      // Refresh interviews list
      const [updatedAllInterviews, updatedWeekInterviews] = await Promise.all([
        interviewService.getInterviews(),
        interviewService.getInterviewsFromLastSevenDays(),
      ])
      setAllInterviews(updatedAllInterviews as Interview[])
      setWeekInterviews(updatedWeekInterviews as Interview[])
    } catch (err) {
      console.error("Failed to end interview:", err)
      alert("Failed to end interview")
    }
  }

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
              <div>
                <h1 className="text-xl font-semibold">InterviewAI</h1>
                <p className="text-xs text-muted-foreground">Acme Inc.</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    JD
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="size-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Interviews</h2>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "Search results across all interviews" : "Last 7 days - live, draft, and submitted"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/questions/new">
              <Button variant="outline">
                <Plus className="size-4 mr-2" />
                New Question
              </Button>
            </Link>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                New Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Interview</DialogTitle>
                <DialogDescription>Set up a new interview session for a candidate</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Select a Question</Label>
                  <p className="text-xs text-muted-foreground">Click to select a question. The candidate will choose their programming language when they start the interview.</p>
                  <div className="space-y-2 mt-3">
                    {questions.map((q) => {
                      const isSelected = selectedQuestionId === q.id
                      return (
                        <div
                          key={q.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedQuestionId(isSelected ? null : q.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 size-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}>
                              {isSelected && <div className="size-2 bg-white rounded-full" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">{q.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {q.difficulty}
                                </Badge>
                                {q.timeLimitMinutes && (
                                  <span className="text-xs text-muted-foreground">{q.timeLimitMinutes} min</span>
                                )}
                              </div>
                              {isSelected && (
                                <p className="text-xs text-muted-foreground leading-relaxed mt-2 max-h-24 overflow-y-auto">{q.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">
                    Candidate Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="candidate-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className={candidateName.trim() === "" ? "border-destructive/50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="role"
                    type="text"
                    placeholder="e.g., Senior Frontend Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateInterview}
                  disabled={creating || !selectedQuestionId || !candidateName.trim()}
                >
                  {creating ? "Creating Interview..." : "Create Interview"}
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Interviews List */}
        <div className="space-y-3">
          {filteredInterviews.map((interview) => (
            <div
              key={interview.id}
              className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg truncate">{interview.candidateName || interview.candidate?.name || "Unnamed Candidate"}</h3>
                    {getStatusBadge(interview.status)}
                    {(interview.status === "completed" || interview.status === "ended") && evaluationStatuses[interview.id]?.isDraft && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '0.375rem',
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',
                        paddingBottom: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: '#FBBF24',
                        color: '#78350F'
                      }}>
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {interview.role && <span>{interview.role}</span>}
                    {interview.role && <span>•</span>}
                    <span className="font-medium text-foreground">{interview.questionTitle || interview.question?.title || "N/A"}</span>
                    <span>•</span>
                    <span>Created {interview.createdAt ? new Date(interview.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(interview.status === "scheduled" || interview.status === "pending") && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(interview.token || interview.interviewLinkToken)}>
                        <Copy className="size-4 mr-2" />
                        Copy Link
                      </Button>
                      <Link href={`/interview/${interview.id}`}>
                        <Button size="sm">
                          <Play className="size-4 mr-2" />
                          Start
                        </Button>
                      </Link>
                    </>
                  )}
                  {(interview.status === "in_progress" || interview.status === "live") && (
                    <Link href={`/interview/${interview.id}`}>
                      <Button size="sm" className="bg-accent hover:bg-accent/90">
                        <Eye className="size-4 mr-2" />
                        View Live
                      </Button>
                    </Link>
                  )}
                  {(interview.status === "completed" || interview.status === "cancelled" || interview.status === "ended") && (
                    <Link href={`/results/${interview.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="size-4 mr-2" />
                        View Results
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(interview.status === "scheduled" || interview.status === "pending") && (
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInterview(interview.id)}>
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                      {(interview.status === "in_progress" || interview.status === "live") && (
                        <DropdownMenuItem className="text-destructive" onClick={() => handleEndInterview(interview.id)}>
                          <XCircle className="size-4 mr-2" />
                          End Interview
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInterviews.length === 0 && (
          <div className="text-center py-12">
            <div className="size-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No interviews found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search"
                : "No interviews in the last 7 days"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4 mr-2" />
                Create Interview
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
