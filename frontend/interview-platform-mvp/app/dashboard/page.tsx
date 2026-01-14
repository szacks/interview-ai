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
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { interviewService } from "@/services/interviewService"
import type { InterviewListResponse, Question } from "@/types/interview"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null)

  const [interviews, setInterviews] = useState<InterviewListResponse[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  const [candidateName, setCandidateName] = useState("")
  const [role, setRole] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [interviewsData, questionsData] = await Promise.all([
          interviewService.getInterviews(),
          interviewService.getQuestions(),
        ])
        setInterviews(interviewsData)
        setQuestions(questionsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load interviews or questions. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateInterview = async () => {
    if (!selectedQuestionId || !candidateName) {
      alert("Please select a question and enter candidate name")
      return
    }

    try {
      setCreating(true)
      // For now, create a candidate with the provided name
      const candidate = await interviewService.createCandidate(candidateName, `${candidateName.replace(/\s+/g, "").toLowerCase()}@candidate.local`)

      // Create the interview
      await interviewService.createInterview({
        questionId: selectedQuestionId,
        candidateId: candidate.id,
        language: "java", // Default language, could be made selectable
      })

      // Reset form
      setCandidateName("")
      setRole("")
      setSelectedQuestionId(null)
      setCreateDialogOpen(false)

      // Refresh interviews list
      const updatedInterviews = await interviewService.getInterviews()
      setInterviews(updatedInterviews)
    } catch (err) {
      console.error("Error creating interview:", err)
      alert("Failed to create interview. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      (interview.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (interview.questionTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-accent text-accent-foreground">
            <div className="size-1.5 rounded-full bg-accent-foreground mr-1.5 animate-pulse" />
            Live
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
            <Clock className="size-3 mr-1" />
            Pending
          </Badge>
        )
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

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/i/${token}`)
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
            <p className="text-muted-foreground text-sm">Manage and conduct technical interviews</p>
          </div>
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
                <DialogDescription>Set up a new interview session for a candidate. Select a question from your company's library.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-5 animate-spin text-muted-foreground mr-2" />
                      <p className="text-muted-foreground">Loading questions...</p>
                    </div>
                  ) : questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No questions available. Create one first in the Questions section.</p>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q) => {
                        const isExpanded = expandedQuestionId === q.id
                        const isSelected = selectedQuestionId === q.id
                        return (
                          <div
                            key={q.id}
                            className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                              isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setSelectedQuestionId(isSelected ? null : q.id)
                              setExpandedQuestionId(isExpanded ? null : q.id)
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{q.title}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {q.difficulty}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{q.timeLimitMinutes} min</span>
                                </div>
                                {isExpanded && (
                                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">{q.description}</p>
                                )}
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="size-5 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronDown className="size-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">
                    Candidate Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="candidate-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="role"
                    type="text"
                    placeholder="Senior Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleCreateInterview} disabled={creating || !selectedQuestionId || !candidateName}>
                  {creating ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Interview"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading interviews...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-500 bg-red-50 p-4">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Filters */}
        {!loading && (
          <>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
                        <h3 className="font-semibold text-lg truncate">{interview.candidateName || "Unnamed Candidate"}</h3>
                        {getStatusBadge(interview.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{interview.questionTitle}</span>
                        <span>•</span>
                        <span>Created {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {interview.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(interview.interviewLinkToken)}>
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
                      {interview.status === "in_progress" && (
                        <Link href={`/interview/${interview.id}`}>
                          <Button size="sm" className="bg-accent hover:bg-accent/90">
                            <Eye className="size-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      )}
                      {interview.status === "completed" && (
                        <Link href={`/results/${interview.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="size-4 mr-2" />
                            View Results
                          </Button>
                        </Link>
                      )}
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
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first interview to get started"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="size-4 mr-2" />
                    Create Interview
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
