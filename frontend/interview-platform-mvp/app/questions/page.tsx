"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Copy, ArrowLeft, Loader2 } from "lucide-react"
import { QuestionsFilters } from "@/components/questions/questions-filters"
import { apiClient } from "@/services/apiClient"

interface Question {
  id: number
  title: string
  category: string
  difficulty: string
  status: string
  usageCount: number
  averageScore: number
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.get("/questions")
        console.log("Fetched questions:", data)
        setQuestions(data || [])
      } catch (err) {
        console.error("Error fetching questions:", err)
        setError("Failed to load questions. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading questions...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 border-red-500 bg-red-50">
            <p className="text-red-700 font-semibold">{error}</p>
          </Card>
        )}

        {/* Questions List */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Company Questions ({questions.length})</h2>
            </div>

            {questions.length > 0 ? (
              questions.map((question) => (
                <Card key={question.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{question.title}</h3>
                        <Badge variant="outline" className="capitalize">
                          {question.category?.replace("-", " ") || "Uncategorized"}
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
                        <Badge variant={question.status === "PUBLISHED" ? "default" : "secondary"}>
                          {question.status?.toLowerCase() || "draft"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Used {question.usageCount || 0} times</span>
                        {question.status === "PUBLISHED" && (
                          <span>Avg score: {question.averageScore ? Math.round(question.averageScore) : "N/A"}%</span>
                        )}
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
              ))
            ) : (
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
          </div>
        )}
      </main>
    </div>
  )
}
