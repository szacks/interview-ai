"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code2, Play, Send, Loader2, CheckCircle2, XCircle, Clock, MessageSquare, Terminal } from "lucide-react"
import Editor from "@monaco-editor/react"
import { useParams } from "next/navigation"

// Mock data
const mockQuestion = {
  title: "URL Shortener",
  description:
    "Build a URL shortening service that converts long URLs into short, unique identifiers. Implement functions to shorten URLs and retrieve original URLs from shortened versions.",
  difficulty: "medium",
  timeLimit: 30,
  initialCode: {
    javascript: `function shortenUrl(longUrl) {
  // Your code here
}

function getLongUrl(shortCode) {
  // Your code here
}`,
    python: `def shorten_url(long_url):
    # Your code here
    pass

def get_long_url(short_code):
    # Your code here
    pass`,
    java: `public class UrlShortener {
    public String shortenUrl(String longUrl) {
        // Your code here
        return null;
    }

    public String getLongUrl(String shortCode) {
        // Your code here
        return null;
    }
}`,
  },
}

const mockChatHistory = [
  {
    role: "ai",
    message:
      "Hello! I'm here to help you during the interview. Feel free to ask me questions about the problem, discuss approaches, or get clarification on requirements.",
    timestamp: new Date(),
  },
]

type InterviewStatus = "waiting" | "live" | "ended"

interface InterviewData {
  id: number
  status: string
  company?: {
    id: number
    name: string
    logoUrl?: string
  }
  question?: {
    id: number
    title: string
    description: string
    difficulty: string
    timeLimitMinutes: number
  }
}

export default function CandidateInterviewPage() {
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<InterviewStatus>("waiting") // Can be: waiting, live, ended
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(mockQuestion.initialCode.javascript)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState(mockChatHistory)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<Array<{ name: string; passed: boolean }>>([])
  const [showChat, setShowChat] = useState(false)
  const [startTime] = useState(Date.now())

  // Fetch interview data using token
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
        const response = await fetch(`${apiBaseUrl}/interviews/link/${token}`)
        if (!response.ok) {
          throw new Error("Failed to fetch interview data")
        }
        const data: InterviewData = await response.json()
        setInterviewData(data)

        // Map backend status to frontend status
        if (data.status === "scheduled" || data.status === "pending") {
          setStatus("waiting")
        } else if (data.status === "in_progress") {
          setStatus("live")
        } else if (data.status === "completed") {
          setStatus("ended")
        }

        // Update code with question initial code if available
        if (data.question) {
          const initialCode =
            mockQuestion.initialCode[language as keyof typeof mockQuestion.initialCode]
          setCode(initialCode)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        // Keep waiting status on error
        setStatus("waiting")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchInterviewData()
    }
  }, [token])

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    setCode(mockQuestion.initialCode[newLanguage as keyof typeof mockQuestion.initialCode])
  }

  const handleRunTests = () => {
    setIsRunning(true)
    // Simulate test execution
    setTimeout(() => {
      setTestResults([
        { name: "Should shorten a valid URL", passed: true },
        { name: "Should retrieve original URL", passed: true },
        { name: "Should handle multiple URLs", passed: false },
        { name: "Should generate unique codes", passed: true },
      ])
      setIsRunning(false)
    }, 2000)
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    const newMessage = {
      role: "candidate" as const,
      message: chatMessage,
      timestamp: new Date(),
    }

    setChatHistory([...chatHistory, newMessage])
    setChatMessage("")

    // Simulate AI response
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai" as const,
          message: "I understand your question. Let me help you think through this...",
          timestamp: new Date(),
        },
      ])
    }, 1000)
  }

  const getElapsedTime = () => {
    const elapsed = Date.now() - startTime
    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (status === "waiting") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {/* Company Logo */}
          {interviewData?.company?.logoUrl ? (
            <div className="mb-6">
              <img
                src={interviewData.company.logoUrl}
                alt={interviewData.company.name}
                className="h-16 w-auto mx-auto"
              />
            </div>
          ) : (
            <div className="size-16 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
              <Code2 className="size-8 text-primary" />
            </div>
          )}

          {/* Interview Session Title */}
          <h1 className="text-2xl font-bold mb-2">Interview with {interviewData?.company?.name || "Company"}</h1>

          {/* Question Title */}
          {interviewData?.question?.title && (
            <h2 className="text-lg font-semibold text-primary mb-4">{interviewData.question.title}</h2>
          )}

          {/* Waiting Message */}
          <p className="text-muted-foreground mb-8">
            Waiting for the interviewer to start the session. Please stay on this page.
          </p>

          {/* What to Expect */}
          <div className="rounded-lg border border-border bg-card p-6 text-left">
            <h2 className="font-semibold mb-4">What to expect</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <CheckCircle2 className="size-5 text-primary flex-shrink-0 mt-0.5" />
                <span>You'll have access to a code editor with multiple language support</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-5 text-primary flex-shrink-0 mt-0.5" />
                <span>An AI assistant will be available to help you during the interview</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-5 text-primary flex-shrink-0 mt-0.5" />
                <span>You can run tests to check your solution</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-5 text-primary flex-shrink-0 mt-0.5" />
                <span>The interviewer will observe your coding process in real-time</span>
              </li>
            </ul>
          </div>

          {/* Connection Status */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="size-2 rounded-full bg-accent animate-pulse" />
            <span>Connected and ready</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === "ended") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="size-16 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Interview Complete</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for completing the interview. Your responses have been submitted successfully.
          </p>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold mb-4 text-left">Next Steps</h2>
            <p className="text-sm text-muted-foreground text-left leading-relaxed">
              The interviewer will review your solution and provide feedback. You should hear back from the hiring team
              within the next few days.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{mockQuestion.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {mockQuestion.difficulty}
                  </Badge>
                  <span>•</span>
                  <span>{mockQuestion.timeLimit} minutes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted">
                <Clock className="size-4" />
                <span className="font-mono">{getElapsedTime()}</span>
              </div>
              <Button>
                <CheckCircle2 className="size-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question Panel */}
          <div className="border-b border-border bg-card p-4">
            <h2 className="font-semibold mb-2">Problem Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{mockQuestion.description}</p>
          </div>

          {/* Editor Controls */}
          <div className="border-b border-border bg-card/50 px-4 py-2 flex items-center justify-between">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRunTests} disabled={isRunning}>
              {isRunning ? (
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

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="border-t border-border bg-card p-4 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Test Results</h3>
                <span className="text-sm text-muted-foreground">
                  {testResults.filter((t) => t.passed).length} / {testResults.length} Passed
                </span>
              </div>
              <div className="space-y-2">
                {testResults.map((test, idx) => (
                  <div
                    key={idx}
                    className={`text-sm flex items-center gap-2 p-2 rounded ${
                      test.passed ? "bg-chart-3/10 text-chart-3" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {test.passed ? (
                      <CheckCircle2 className="size-4 flex-shrink-0" />
                    ) : (
                      <XCircle className="size-4 flex-shrink-0" />
                    )}
                    <span>{test.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-96 border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <MessageSquare className="size-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Ask me anything</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className="flex gap-3">
                <div
                  className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    chat.role === "candidate" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  }`}
                >
                  {chat.role === "candidate" ? <Terminal className="size-4" /> : <MessageSquare className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    {chat.role === "candidate" ? "You" : "AI Assistant"}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">The AI and interviewer can see this conversation</p>
          </div>
        </div>
      </div>
    </div>
  )
}
