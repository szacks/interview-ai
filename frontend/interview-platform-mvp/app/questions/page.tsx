import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Copy, ArrowLeft } from "lucide-react"
import { QuestionsFilters } from "@/components/questions/questions-filters"

// Mock data for demonstration
const mockQuestions = [
  {
    id: "1",
    title: "Rate Limiter Implementation",
    category: "backend",
    difficulty: "hard",
    status: "published",
    usageCount: 12,
    avgScore: 75,
  },
  {
    id: "2",
    title: "Binary Tree Traversal",
    category: "algorithms",
    difficulty: "medium",
    status: "published",
    usageCount: 8,
    avgScore: 82,
  },
  {
    id: "3",
    title: "URL Shortener Design",
    category: "system-design",
    difficulty: "hard",
    status: "draft",
    usageCount: 0,
    avgScore: 0,
  },
]

export default function QuestionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Questions Library</h1>
                <p className="text-sm text-muted-foreground">Manage your custom coding questions</p>
              </div>
            </div>
            <Link href="/questions/new">
              <Button>
                <Plus className="size-4 mr-2" />
                New Question
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <QuestionsFilters />

        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Company Questions ({mockQuestions.length})</h2>
          </div>

          {mockQuestions.map((question) => (
            <Card key={question.id} className="p-6 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{question.title}</h3>
                    <Badge variant="outline" className="capitalize">
                      {question.category.replace("-", " ")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        question.difficulty === "easy"
                          ? "border-green-500 text-green-500"
                          : question.difficulty === "medium"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-red-500 text-red-500"
                      }
                    >
                      {question.difficulty}
                    </Badge>
                    <Badge variant={question.status === "published" ? "default" : "secondary"}>{question.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Used {question.usageCount} times</span>
                    {question.status === "published" && <span>Avg score: {question.avgScore}%</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/questions/${question.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Copy className="size-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {mockQuestions.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first custom coding question to get started with technical interviews.
              </p>
              <Link href="/questions/new">
                <Button>
                  <Plus className="size-4 mr-2" />
                  Create First Question
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
