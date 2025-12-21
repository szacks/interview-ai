"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Code2,
  Copy,
  Users,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
  Terminal,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Star,
  Play,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Editor from "@monaco-editor/react"

// Mock data
const mockInterview = {
  id: 1,
  candidateName: "Sarah Johnson",
  role: "Senior Frontend Developer",
  question: {
    title: "URL Shortener",
    description:
      "Build a URL shortening service that converts long URLs into short, unique identifiers. Implement functions to shorten URLs and retrieve original URLs from shortened versions.",
    difficulty: "medium",
  },
  status: "live",
  startedAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
  candidateConnected: true,
  selectedLanguage: "javascript",
}

const mockCode = `function shortenUrl(longUrl) {
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
}`

const mockChatHistory = [
  {
    role: "candidate",
    message: "How should I handle collisions in the short code generation?",
    timestamp: new Date(Date.now() - 10 * 60000),
  },
  {
    role: "ai",
    message:
      "Great question! There are a few approaches to handle collisions:\n\n1. Check if the generated code exists before storing\n2. Use a counter-based approach\n3. Increase the length of the short code\n\nFor this problem, I recommend checking if the code exists and regenerating if there's a collision.",
    timestamp: new Date(Date.now() - 10 * 60000),
  },
  {
    role: "candidate",
    message: "Should I implement the database or just assume it exists?",
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    role: "ai",
    message:
      "For this interview, you can assume a simple key-value store exists. Focus on the core logic of URL shortening and retrieval. You can use a Map or object to simulate the database.",
    timestamp: new Date(Date.now() - 5 * 60000),
  },
]

const mockTestResults = [
  { name: "Should shorten a valid URL", passed: true },
  { name: "Should retrieve original URL", passed: true },
  { name: "Should handle multiple URLs", passed: false },
  { name: "Should generate unique codes", passed: true },
]

const mockFollowUpQuestions = [
  {
    question: "What happens if this API gets 10,000 requests per second?",
    answer:
      "The timestamps array would grow to 10,000 entries, using a lot of memory. We could use a sliding window counter with fixed buckets, or a token bucket algorithm. These use O(1) memory regardless of traffic.",
  },
  {
    question: "Can you think of a solution that uses fixed memory regardless of traffic?",
    hints: ["Think about dividing time into buckets", "What if you only stored counts, not timestamps?"],
    expectedApproach:
      "Sliding Window Counter - divide window into smaller buckets, store count per bucket, sum recent buckets",
  },
  {
    question: "What's the tradeoff between your current solution and a fixed-memory solution?",
    answer:
      "Current solution is precise but uses O(n) memory. Fixed-memory solutions are approximate but use O(1) memory. Current solution trades precision and simplicity for memory usage. Fixed-memory solutions like sliding window counter offer better scalability but sacrifice precision at bucket boundaries.",
    keyPoints: ["Precision vs memory", "Simplicity vs scalability", "Use case dependent"],
  },
  {
    question: "What if this needs to work across multiple servers?",
    hints: ["Where would you store the state?", "What about race conditions?"],
    expectedTopics: ["Redis/shared cache", "Atomic operations", "Eventual consistency", "Lua scripts for atomicity"],
  },
  {
    question: "How would you properly test a time-based function like this?",
    answer: "Inject the time function so tests don't depend on real time. Mock Date.now() to control the clock. Dependency injection for time source enables deterministic testing. Mock Date.now() to test boundary conditions and edge cases without waiting for real time to pass.",
  },
]

export default function InterviewSessionPage() {
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState("tests")
  const [isPending, setIsPending] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testsRun, setTestsRun] = useState(false)

  const getElapsedTime = () => {
    const elapsed = Date.now() - mockInterview.startedAt.getTime()
    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/i/xK9mPq2nR4vL`)
  }

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleRunTests = () => {
    setIsRunningTests(true)
    setTimeout(() => {
      setIsRunningTests(false)
      setTestsRun(true)
      setActiveTab("tests")
    }, 2000)
  }

  const testsPassed = mockTestResults.filter((t) => t.passed).length
  const allTestsPassed = testsPassed === mockTestResults.length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold">{mockInterview.candidateName}</h1>
                  {isPending ? (
                    <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                      <Clock className="size-3 mr-1" />
                      Pending
                    </Badge>
                  ) : (
                    <Badge className="bg-accent text-accent-foreground">
                      <div className="size-1.5 rounded-full bg-accent-foreground mr-1.5 animate-pulse" />
                      Live
                    </Badge>
                  )}
                  {!isPending && mockInterview.candidateConnected && (
                    <Badge variant="secondary" className="text-xs">
                      <Users className="size-3 mr-1" />
                      Candidate Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockInterview.role} • {mockInterview.question.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isPending && (
                <>
                  <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted">
                    <Clock className="size-4" />
                    <span className="font-mono">{getElapsedTime()}</span>
                  </div>
                </>
              )}
              {isPending ? (
                <>
                  <Button variant="outline" onClick={copyLink}>
                    <Copy className="size-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={() => setIsPending(false)}>
                    <PlayCircle className="size-4 mr-2" />
                    Start Interview
                  </Button>
                </>
              ) : (
                <Button variant="destructive">
                  <XCircle className="size-4 mr-2" />
                  End Interview
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {isPending ? (
        /* Pending State */
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            <div className="size-16 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <Users className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Waiting for candidate</h2>
            <p className="text-muted-foreground mb-8">
              Share the interview link with the candidate. Once they join, you can start the interview.
            </p>

            <div className="rounded-lg border border-border bg-card p-6 mb-6">
              <h3 className="font-semibold mb-4 text-left">Interview Details</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-24">Candidate:</span>
                  <span className="font-medium">{mockInterview.candidateName}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-24">Role:</span>
                  <span>{mockInterview.role}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-24">Question:</span>
                  <span>{mockInterview.question.title}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-24">Difficulty:</span>
                  <Badge variant="outline" className="text-xs">
                    {mockInterview.question.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 text-left">
              <h3 className="font-semibold mb-2">Question Description</h3>
              <p className="text-muted-foreground leading-relaxed">{mockInterview.question.description}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Live State */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content Area with Code and Chat Side by Side */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Area */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
              <div className="px-4 py-2 border-b border-border bg-card/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="size-4" />
                  <span>Viewing candidate's code in real-time</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {mockInterview.selectedLanguage}
                </Badge>
              </div>
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={mockInterview.selectedLanguage}
                  value={mockCode}
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
            </div>

            <div className="w-96 flex flex-col border-r border-border">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b border-border px-4 bg-card">
                  <TabsList className="bg-transparent p-0 h-auto w-full">
                    <TabsTrigger
                      value="chat"
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <HelpCircle className="size-4 mr-2" />
                      AI Chat
                    </TabsTrigger>
                    <TabsTrigger
                      value="tests"
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <PlayCircle className="size-4 mr-2" />
                      Tests
                      {testsRun && (
                        <Badge variant={allTestsPassed ? "default" : "destructive"} className="ml-2 text-xs">
                          {testsPassed}/{mockTestResults.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="questions"
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <HelpCircle className="size-4 mr-2" />
                      Follow-ups
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* AI Chat content to display conversation history */}
                <TabsContent value="chat" className="flex-1 m-0 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold mb-1">AI Conversation</h3>
                      <p className="text-xs text-muted-foreground">Monitor the candidate's questions and AI guidance</p>
                    </div>

                    {mockChatHistory.map((msg, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-lg p-3 ${
                              msg.role === "candidate"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">
                                {msg.role === "candidate" ? "Candidate" : "AI Assistant"}
                              </span>
                              <span className="text-xs opacity-70">
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {mockChatHistory.length === 0 && (
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                          <HelpCircle className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-sm text-muted-foreground">No AI conversation yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tests" className="flex-1 m-0 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border">
                    <Button onClick={handleRunTests} disabled={isRunningTests} size="sm" className="w-full">
                      {isRunningTests ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Running Tests...
                        </>
                      ) : (
                        <>
                          <Play className="size-4 mr-2" />
                          Run Tests
                        </>
                      )}
                    </Button>
                  </div>

                  {testsRun && (
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="mb-4 p-3 rounded-lg border border-border bg-card">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">Test Summary</span>
                          <Badge variant={allTestsPassed ? "default" : "destructive"} className="text-xs">
                            {testsPassed} / {mockTestResults.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {allTestsPassed
                            ? "All tests passed!"
                            : "Some tests failed. Guide the candidate to fix issues."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {mockTestResults.map((test, idx) => (
                          <div
                            key={idx}
                            className={`rounded-lg border p-3 flex items-start gap-2 ${
                              test.passed ? "border-chart-3/30 bg-chart-3/5" : "border-destructive/30 bg-destructive/5"
                            }`}
                          >
                            {test.passed ? (
                              <CheckCircle2 className="size-4 text-chart-3 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
                            )}
                            <span className="text-xs font-medium leading-relaxed">{test.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!testsRun && (
                    <div className="flex-1 flex items-center justify-center p-4">
                      <div className="text-center">
                        <Terminal className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">Click "Run Tests" to evaluate the code</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="questions" className="flex-1 m-0 overflow-y-auto">
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold mb-1">Follow-up Questions</h3>
                      <p className="text-xs text-muted-foreground">
                        Assess deeper understanding and problem-solving approach
                      </p>
                    </div>

                    <div className="space-y-2">
                      {mockFollowUpQuestions.map((q, idx) => {
                        const isExpanded = expandedQuestions.includes(idx)
                        return (
                          <div key={idx} className="rounded-lg border border-border bg-card overflow-hidden">
                            <button
                              onClick={() => toggleQuestion(idx)}
                              className="w-full p-3 flex items-start gap-2 hover:bg-accent/5 transition-colors text-left"
                            >
                              <span className="flex-shrink-0 size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="flex-1 text-sm font-medium leading-relaxed">{q.question}</span>
                              {isExpanded ? (
                                <ChevronUp className="size-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              ) : (
                                <ChevronDown className="size-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="px-3 pb-3 space-y-3 text-xs">
                                {q.answer && (
                                  <div className="p-2 rounded bg-chart-1/5 border border-chart-1/20">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Star className="size-3.5 text-chart-1" />
                                      <span className="font-semibold text-chart-1">Answer</span>
                                    </div>
                                    <p className="text-foreground leading-relaxed">{q.answer}</p>
                                  </div>
                                )}

                                {q.hints && (
                                  <div className="p-2 rounded bg-chart-2/5 border border-chart-2/20">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Lightbulb className="size-3.5 text-chart-2" />
                                      <span className="font-semibold text-chart-2">Hints</span>
                                    </div>
                                    <ul className="space-y-1">
                                      {q.hints.map((hint, i) => (
                                        <li key={i} className="text-foreground leading-relaxed flex gap-1.5">
                                          <span className="text-chart-2">•</span>
                                          <span>{hint}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {q.keyPoints && (
                                  <div className="p-2 rounded bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Target className="size-3.5 text-primary" />
                                      <span className="font-semibold text-primary">Key Points</span>
                                    </div>
                                    <ul className="space-y-1">
                                      {q.keyPoints.map((point, i) => (
                                        <li key={i} className="text-foreground leading-relaxed flex gap-1.5">
                                          <span className="text-primary">•</span>
                                          <span>{point}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {q.expectedApproach && (
                                  <div className="p-2 rounded bg-muted border border-border">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Code2 className="size-3.5 text-muted-foreground" />
                                      <span className="font-semibold text-foreground">Expected Approach</span>
                                    </div>
                                    <p className="text-foreground leading-relaxed">{q.expectedApproach}</p>
                                  </div>
                                )}

                                {q.expectedTopics && (
                                  <div className="p-2 rounded bg-muted border border-border">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Code2 className="size-3.5 text-muted-foreground" />
                                      <span className="font-semibold text-foreground">Expected Topics</span>
                                    </div>
                                    <ul className="space-y-1">
                                      {q.expectedTopics.map((topic, i) => (
                                        <li key={i} className="text-foreground leading-relaxed flex gap-1.5">
                                          <span className="text-muted-foreground">•</span>
                                          <span>{topic}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Notes Section at Bottom */}
          <div className="border-t border-border bg-card">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Interview Notes</h3>
                <Button variant="outline" size="sm">
                  Save Notes
                </Button>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes during the interview..."
                className="min-h-24 resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
