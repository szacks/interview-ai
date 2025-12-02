import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Copy,
  Play,
  Eye,
  Trash2,
  XCircle,
  MoreVertical,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react"

interface Interview {
  id: number
  candidateName: string
  role: string
  questionTitle: string
  status: "pending" | "live" | "ended"
  createdAt: string
  startedAt?: string
  endedAt?: string
  token: string
}

interface InterviewListComponentProps {
  interviews: Interview[]
  onCopyLink?: (token: string) => void
  onDeleteInterview?: (interviewId: number) => void
  onEndInterview?: (interviewId: number) => void
  onViewResults?: (interviewId: number) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function InterviewListComponent({
  interviews,
  onCopyLink,
  onDeleteInterview,
  onEndInterview,
  onViewResults,
  isLoading = false,
  emptyMessage = "No interviews to display",
}: InterviewListComponentProps) {
  const getStatusBadge = (status: "pending" | "live" | "ended") => {
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
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const defaultHandlers = useMemo(
    () => ({
      copyLink: (token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/i/${token}`)
      },
    }),
    []
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full size-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="size-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Zap className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2 tracking-tight text-foreground">No interviews</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {interviews.map((interview) => (
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
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                <span>{interview.role}</span>
                <span>•</span>
                <span className="font-semibold text-foreground">{interview.questionTitle}</span>
                <span>•</span>
                <span>Created {formatDate(interview.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {interview.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => (onCopyLink || defaultHandlers.copyLink)(interview.token)}
                  >
                    <Copy className="size-4 mr-2" />
                    Copy Link
                  </Button>
                  <Link to={`/interview/${interview.id}`}>
                    <Button size="sm">
                      <Play className="size-4 mr-2" />
                      Start
                    </Button>
                  </Link>
                </>
              )}
              {interview.status === "live" && (
                <Link to={`/interview/${interview.id}`}>
                  <Button size="sm" className="bg-accent hover:bg-accent/90">
                    <Eye className="size-4 mr-2" />
                    View Live
                  </Button>
                </Link>
              )}
              {interview.status === "ended" && (
                <Button size="sm" variant="outline" onClick={() => onViewResults?.(interview.id)}>
                  <Eye className="size-4 mr-2" />
                  View Results
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {interview.status === "pending" && (
                    <DropdownMenuItem className="text-destructive" onClick={() => onDeleteInterview?.(interview.id)}>
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {interview.status === "live" && (
                    <DropdownMenuItem className="text-destructive" onClick={() => onEndInterview?.(interview.id)}>
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
  )
}
