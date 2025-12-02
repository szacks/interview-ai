import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Search, ChevronDown, ChevronUp } from "lucide-react"
import { InterviewListComponent } from "@/components/InterviewListComponent"

// Mock data
const mockInterviews: Array<{
  id: number
  candidateName: string
  role: string
  questionId: number
  questionTitle: string
  status: "pending" | "live" | "ended"
  createdAt: string
  startedAt?: string
  endedAt?: string
  token: string
}> = [
  {
    id: 1,
    candidateName: "Sarah Johnson",
    role: "Senior Frontend Developer",
    questionId: 1,
    questionTitle: "URL Shortener",
    status: "live",
    createdAt: "2025-01-15T10:30:00",
    startedAt: "2025-01-15T11:00:00",
    token: "xK9mPq2nR4vL",
  },
  {
    id: 2,
    candidateName: "Michael Chen",
    role: "Backend Engineer",
    questionId: 2,
    questionTitle: "Shopping Cart API",
    status: "pending",
    createdAt: "2025-01-15T09:00:00",
    token: "aB3cD4eF5gH6",
  },
  {
    id: 3,
    candidateName: "Emily Rodriguez",
    role: "Full Stack Developer",
    questionId: 3,
    questionTitle: "Task Manager",
    status: "ended",
    createdAt: "2025-01-14T14:00:00",
    startedAt: "2025-01-14T14:30:00",
    endedAt: "2025-01-14T15:15:00",
    token: "iJ7kL8mN9oP0",
  },
  {
    id: 4,
    candidateName: "David Park",
    role: "Software Engineer",
    questionId: 1,
    questionTitle: "URL Shortener",
    status: "ended",
    createdAt: "2025-01-14T10:00:00",
    startedAt: "2025-01-14T10:30:00",
    endedAt: "2025-01-14T11:00:00",
    token: "qR1sT2uV3wX4",
  },
]

const questions = [
  {
    id: 1,
    title: "URL Shortener",
    difficulty: "medium",
    description:
      "Build a URL shortening service that generates short aliases for long URLs. The service should accept a long URL, generate a unique short code, and store the mapping. When users visit the short URL, they should be redirected to the original long URL. Consider edge cases like duplicate URLs, invalid URLs, and short code collisions.",
    timeLimit: 45,
  },
  {
    id: 2,
    title: "Shopping Cart API",
    difficulty: "medium",
    description:
      "Design and implement a RESTful API for a shopping cart system. The API should support operations like adding items to the cart, removing items, updating quantities, and calculating the total price with tax and discounts. Consider thread safety for concurrent requests and implement proper validation for product availability and pricing.",
    timeLimit: 60,
  },
  {
    id: 3,
    title: "Task Manager",
    difficulty: "easy",
    description:
      "Create a simple task management system where users can create, read, update, and delete tasks. Each task should have a title, description, status (pending, in-progress, completed), and due date. Implement filtering by status and sorting by due date. Focus on clean code structure and basic CRUD operations.",
    timeLimit: 30,
  },
]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null)

  const filteredInterviews = mockInterviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.questionTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/i/${token}`)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Interviews</h2>
            <p className="text-muted-foreground text-base font-medium">Manage and conduct technical interviews</p>
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
                <DialogDescription>Set up a new interview session for a candidate</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <div className="space-y-3">
                    {questions.map((q) => {
                      const isExpanded = expandedQuestionId === q.id
                      return (
                        <div
                          key={q.id}
                          className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{q.title}</h3>
                                <Badge variant="outline" className="text-sm font-medium">
                                  {q.difficulty}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-medium">{q.timeLimit} min</span>
                              </div>
                              {isExpanded && (
                                <p className="text-base text-muted-foreground leading-relaxed mt-3">{q.description}</p>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-name">
                    Candidate Name <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="candidate-name" type="text" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="role" type="text" placeholder="Senior Developer" />
                </div>
                <Button className="w-full">Create Interview</Button>
              </div>
            </DialogContent>
          </Dialog>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interviews List */}
        <InterviewListComponent
          interviews={filteredInterviews}
          onCopyLink={copyToClipboard}
          emptyMessage={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first interview to get started"
          }
        />
      </div>
    </div>
  )
}
