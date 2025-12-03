"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Code2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
} from "lucide-react"
import Link from "next/link"
import Editor from "@monaco-editor/react"

// Mock data
const mockResult = {
  id: 1,
  candidateName: "Sarah Johnson",
  role: "Senior Frontend Developer",
  question: "URL Shortener",
  difficulty: "medium",
  status: "ended",
  startedAt: "2025-01-15T11:00:00",
  endedAt: "2025-01-15T11:45:00",
  duration: 45,
  language: "javascript",
  automatedScore: 75,
  testsPassed: 3,
  testsTotal: 4,
  code: `function shortenUrl(longUrl) {
  // Generate a unique short code
  const shortCode = generateShortCode();
  
  // Store mapping in database
  urlDatabase.set(shortCode, longUrl);
  
  return \`https://short.url/\${shortCode}\`;
}

function generateShortCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getLongUrl(shortCode) {
  return urlDatabase.get(shortCode);
}`,
  chatHistory: [
    {
      role: "candidate",
      message: "How should I handle collisions in the short code generation?",
      timestamp: "11:10 AM",
    },
    {
      role: "ai",
      message: "Great question! There are a few approaches to handle collisions...",
      timestamp: "11:10 AM",
    },
    {
      role: "candidate",
      message: "Should I implement the database or just assume it exists?",
      timestamp: "11:25 AM",
    },
    {
      role: "ai",
      message: "For this interview, you can assume a simple key-value store exists...",
      timestamp: "11:25 AM",
    },
  ],
  testResults: [
    { name: "Should shorten a valid URL", passed: true },
    { name: "Should retrieve original URL", passed: true },
    { name: "Should handle multiple URLs", passed: false },
    { name: "Should generate unique codes", passed: true },
  ],
  interviewerNotes:
    "Candidate showed good problem-solving approach. Asked relevant questions about implementation details.",
  scorecard: {
    understanding: 8,
    problemSolving: 7,
    aiCollaboration: 9,
    communication: 8,
    strengths: "",
    weaknesses: "",
  },
}

export default function ResultsPage() {
  const [scorecard, setScorecard] = useState(mockResult.scorecard)
  const [recommendation, setRecommendation] = useState<"hire" | "maybe" | "no" | null>(null)

  const calculateFinalScore = () => {
    const manualScore =
      ((scorecard.understanding + scorecard.problemSolving + scorecard.aiCollaboration + scorecard.communication) / 4) *
      10
    return Math.round(mockResult.automatedScore * 0.4 + manualScore * 0.6)
  }

  const getRecommendationBadge = () => {
    if (!recommendation) return null

    const config = {
      hire: { text: "Hire", icon: TrendingUp, className: "bg-chart-3 text-white" },
      maybe: { text: "Maybe", icon: Minus, className: "bg-chart-4 text-white" },
      no: { text: "No Hire", icon: TrendingDown, className: "bg-destructive text-destructive-foreground" },
    }

    const { text, icon: Icon, className } = config[recommendation]

    return (
      <Badge className={className}>
        <Icon className="size-3 mr-1" />
        {text}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold">{mockResult.candidateName}</h1>
                  <Badge variant="secondary">
                    <CheckCircle2 className="size-3 mr-1" />
                    Completed
                  </Badge>
                  {getRecommendationBadge()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockResult.role} • {mockResult.question}
                </p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="size-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Automated Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{mockResult.automatedScore}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Based on test results</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tests Passed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {mockResult.testsPassed} / {mockResult.testsTotal}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round((mockResult.testsPassed / mockResult.testsTotal) * 100)}% success rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{mockResult.duration} min</div>
                  <p className="text-sm text-muted-foreground mt-1">Completed interview</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Final Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{calculateFinalScore()}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Combined assessment</p>
                </CardContent>
              </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="code" className="space-y-4">
              <TabsList>
                <TabsTrigger value="code">
                  <Code2 className="size-4 mr-2" />
                  Code Solution
                </TabsTrigger>
                <TabsTrigger value="chat">
                  <MessageSquare className="size-4 mr-2" />
                  AI Conversation
                </TabsTrigger>
                <TabsTrigger value="tests">
                  <CheckCircle2 className="size-4 mr-2" />
                  Test Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Submitted Code</CardTitle>
                      <Badge variant="outline">{mockResult.language}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-96 overflow-hidden rounded-b-lg">
                      <Editor
                        height="100%"
                        language={mockResult.language}
                        value={mockResult.code}
                        theme="vs-dark"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {mockResult.interviewerNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interviewer Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{mockResult.interviewerNotes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="chat" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Conversation Log</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockResult.chatHistory.map((chat, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div
                          className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            chat.role === "candidate" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                          }`}
                        >
                          {chat.role === "candidate" ? (
                            <FileText className="size-4" />
                          ) : (
                            <MessageSquare className="size-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {chat.role === "candidate" ? "Candidate" : "AI Assistant"}
                            </span>
                            <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{chat.message}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Test Execution Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mockResult.testResults.map((test, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 flex items-center gap-3 ${
                          test.passed ? "border-chart-3/30 bg-chart-3/5" : "border-destructive/30 bg-destructive/5"
                        }`}
                      >
                        {test.passed ? (
                          <CheckCircle2 className="size-5 text-chart-3 flex-shrink-0" />
                        ) : (
                          <XCircle className="size-5 text-destructive flex-shrink-0" />
                        )}
                        <span className="text-sm">{test.name}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Scorecard Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Scorecard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Problem Understanding</Label>
                      <span className="text-sm font-medium">{scorecard.understanding}/10</span>
                    </div>
                    <Slider
                      value={[scorecard.understanding]}
                      onValueChange={([value]) => setScorecard({ ...scorecard, understanding: value })}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Problem Solving</Label>
                      <span className="text-sm font-medium">{scorecard.problemSolving}/10</span>
                    </div>
                    <Slider
                      value={[scorecard.problemSolving]}
                      onValueChange={([value]) => setScorecard({ ...scorecard, problemSolving: value })}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">AI Collaboration</Label>
                      <span className="text-sm font-medium">{scorecard.aiCollaboration}/10</span>
                    </div>
                    <Slider
                      value={[scorecard.aiCollaboration]}
                      onValueChange={([value]) => setScorecard({ ...scorecard, aiCollaboration: value })}
                      max={10}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Communication</Label>
                      <span className="text-sm font-medium">{scorecard.communication}/10</span>
                    </div>
                    <Slider
                      value={[scorecard.communication]}
                      onValueChange={([value]) => setScorecard({ ...scorecard, communication: value })}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Strengths</Label>
                  <Textarea
                    placeholder="What did the candidate do well?"
                    value={scorecard.strengths}
                    onChange={(e) => setScorecard({ ...scorecard, strengths: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Areas for Improvement</Label>
                  <Textarea
                    placeholder="What could be improved?"
                    value={scorecard.weaknesses}
                    onChange={(e) => setScorecard({ ...scorecard, weaknesses: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Recommendation</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={recommendation === "hire" ? "default" : "outline"}
                      onClick={() => setRecommendation("hire")}
                      className={recommendation === "hire" ? "bg-chart-3 hover:bg-chart-3/90" : ""}
                    >
                      <TrendingUp className="size-4 mr-1" />
                      Hire
                    </Button>
                    <Button
                      variant={recommendation === "maybe" ? "default" : "outline"}
                      onClick={() => setRecommendation("maybe")}
                      className={recommendation === "maybe" ? "bg-chart-4 hover:bg-chart-4/90" : ""}
                    >
                      <Minus className="size-4 mr-1" />
                      Maybe
                    </Button>
                    <Button
                      variant={recommendation === "no" ? "destructive" : "outline"}
                      onClick={() => setRecommendation("no")}
                    >
                      <TrendingDown className="size-4 mr-1" />
                      No
                    </Button>
                  </div>
                </div>

                <Button className="w-full">Save Scorecard</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
