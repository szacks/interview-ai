"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreVertical,
  Copy,
  Play,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { interviewService } from "@/services/interviewService"
import { evaluationService } from "@/services/evaluationService"
import type { Question, Interview } from "@/types/interview"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function DashboardPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  // Backend data states
  const [allInterviews, setAllInterviews] = useState<Interview[]>([])
  const [weekInterviews, setWeekInterviews] = useState<Interview[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [evaluationStatuses, setEvaluationStatuses] = useState<Record<number, { isDraft: boolean; updatedAt?: string }>>({})

  // Change question dialog state
  const [changeQuestionDialogOpen, setChangeQuestionDialogOpen] = useState(false)
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null)
  const [selectedNewQuestionId, setSelectedNewQuestionId] = useState<number | null>(null)
  const [changingQuestion, setChangingQuestion] = useState(false)

  // Fetch interviews and questions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allInterviewsData, weekInterviewsData, questionsData] = await Promise.all([
          interviewService.getInterviews(),
          interviewService.getInterviewsFromLastSevenDays(),
          interviewService.getQuestions(),
        ])
        setAllInterviews(allInterviewsData as Interview[])
        setWeekInterviews(weekInterviewsData as Interview[])
        setQuestions(questionsData)
      } catch (err) {
        console.error(err)
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
      }
    }

    if (allInterviews.length > 0) {
      fetchEvaluationStatuses()
    }
  }, [allInterviews])

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

  const handleOpenChangeQuestion = (interviewId: number) => {
    setSelectedInterviewId(interviewId)
    setSelectedNewQuestionId(null)
    setChangeQuestionDialogOpen(true)
  }

  const handleChangeQuestion = async () => {
    if (!selectedInterviewId || !selectedNewQuestionId) {
      toast({
        title: "Error",
        description: "Please select a question",
        variant: "destructive",
      })
      return
    }

    try {
      setChangingQuestion(true)
      await interviewService.changeQuestion(selectedInterviewId, selectedNewQuestionId)

      // Refresh interviews list
      const [updatedAllInterviews, updatedWeekInterviews] = await Promise.all([
        interviewService.getInterviews(),
        interviewService.getInterviewsFromLastSevenDays(),
      ])
      setAllInterviews(updatedAllInterviews as Interview[])
      setWeekInterviews(updatedWeekInterviews as Interview[])

      toast({
        title: "Success",
        description: "Question changed successfully",
      })
      setChangeQuestionDialogOpen(false)
    } catch (err) {
      console.error("Failed to change question:", err)
      toast({
        title: "Error",
        description: "Failed to change question",
        variant: "destructive",
      })
    } finally {
      setChangingQuestion(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Interviews</h2>
            {searchQuery && (
              <p className="text-muted-foreground text-sm">Search results across all interviews</p>
            )}
          </div>
          <Link href="/interviews/new">
            <Button>
              <Plus className="size-4 mr-2" />
              New Interview
            </Button>
          </Link>
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
                  {(interview.status === "scheduled" || interview.status === "pending" || interview.status === "in_progress" || interview.status === "live") && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(interview.status === "scheduled" || interview.status === "pending") && (
                          <>
                            <DropdownMenuItem onClick={() => handleOpenChangeQuestion(interview.id)}>
                              <Edit className="size-4 mr-2" />
                              Change Question
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInterview(interview.id)}>
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                        {(interview.status === "in_progress" || interview.status === "live") && (
                          <DropdownMenuItem className="text-destructive" onClick={() => handleEndInterview(interview.id)}>
                            <XCircle className="size-4 mr-2" />
                            End Interview
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              {searchQuery
                ? "Try adjusting your search"
                : "No interviews in the last 7 days"}
            </p>
            {!searchQuery && (
              <Link href="/interviews/new">
                <Button>
                  <Plus className="size-4 mr-2" />
                  Create Interview
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Change Question Dialog */}
        {changeQuestionDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg border border-border shadow-lg max-w-2xl w-full mx-4">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Change Question</h2>
                <p className="text-sm text-muted-foreground mt-1">Select a new question for this interview</p>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedNewQuestionId(q.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedNewQuestionId === q.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">{q.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{q.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {q.difficulty}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setChangeQuestionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangeQuestion}
                  disabled={!selectedNewQuestionId || changingQuestion}
                >
                  {changingQuestion ? "Changing..." : "Change Question"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}
