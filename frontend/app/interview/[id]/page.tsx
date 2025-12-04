"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Code2,
  Copy,
  Users,
  MessageSquare,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  StickyNote,
  Eye,
  ArrowLeft,
  Terminal,
} from "lucide-react"
import Link from "next/link"
import Editor from "@monaco-editor/react"
import { useChatStore } from "@/stores/chatStore"
import { chatService } from "@/services/chatService"
import { webSocketService } from "@/services/webSocketService"

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

export default function InterviewSessionPage() {
  // Interview state
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState("code")
  const [isPending, setIsPending] = useState(false)
  const [interviewId] = useState("1") // Get from params in real implementation

  // Chat state and hooks
  const scrollRef = useRef<HTMLDivElement>(null)
  const conversation = useChatStore((state) => state.getConversation(interviewId))
  const addMessage = useChatStore((state) => state.addMessage)
  const setConnectionStatus = useChatStore((state) => state.setConnectionStatus)
  const loadHistory = useChatStore((state) => state.loadHistory)

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await chatService.getChatHistory(interviewId)
        const messages = history.map((msg) => ({
          id: msg.id.toString(),
          role: msg.role as "candidate" | "ai",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          senderName: msg.senderName,
        }))
        loadHistory(interviewId, messages)
      } catch (error) {
        console.error("Error loading chat history", error)
      }
    }

    loadChatHistory()
  }, [interviewId, loadHistory])

  // Connect to WebSocket on mount
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await webSocketService.connect(interviewId)

        webSocketService.onMessage((message) => {
          addMessage(interviewId, message)
        })

        webSocketService.onConnectionChange((connected) => {
          setConnectionStatus(interviewId, connected)
        })
      } catch (error) {
        console.error("Error connecting to WebSocket", error)
      }
    }

    connectWebSocket()

    return () => {
      webSocketService.disconnect()
    }
  }, [interviewId, addMessage, setConnectionStatus])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversation.messages])

  const getElapsedTime = () => {
    const elapsed = Date.now() - mockInterview.startedAt.getTime()
    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/i/xK9mPq2nR4vL`)
  }

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
                <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted">
                  <Clock className="size-4" />
                  <span className="font-mono">{getElapsedTime()}</span>
                </div>
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
            {/* Code and Tests Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b border-border px-4">
                  <TabsList className="bg-transparent p-0 h-auto">
                    <TabsTrigger
                      value="code"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <Code2 className="size-4 mr-2" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger
                      value="tests"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <PlayCircle className="size-4 mr-2" />
                      Tests
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                  <div className="h-full flex flex-col">
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
                </TabsContent>

                <TabsContent value="tests" className="flex-1 m-0 overflow-hidden">
                  <div className="h-full p-4 overflow-y-auto">
                    <div className="space-y-2">
                      {mockTestResults.map((test, idx) => (
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
                    </div>
                    <div className="mt-4 p-4 rounded-lg border border-border bg-card">
                      <div className="text-sm text-muted-foreground mb-1">Test Results</div>
                      <div className="text-2xl font-bold">
                        {mockTestResults.filter((t) => t.passed).length} / {mockTestResults.length} Passed
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* AI Chat Sidebar - Read-only for Interviewer */}
            <div className="w-96 border-l border-border bg-card flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="size-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">AI Chat</h3>
                    <p className="text-xs text-muted-foreground">
                      {conversation.isConnected ? "● Connected" : "○ Disconnected"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages - Read Only */}
              <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollRef}>
                <div className="space-y-4">
                  {conversation.messages.map((msg, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === "candidate" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                        }`}
                      >
                        {msg.role === "candidate" ? (
                          <Terminal className="size-4" />
                        ) : (
                          <MessageSquare className="size-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">
                            {msg.role === "candidate" ? "Candidate" : "AI Assistant"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {conversation.messages.length === 0 && !conversation.hasHistory && (
                    <div className="text-center text-xs text-muted-foreground py-8">
                      No messages yet
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer - Read-only indicator */}
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">Read-only view of candidate&apos;s AI conversation</p>
              </div>
            </div>
          </div>

          {/* Notes Section at Bottom */}
          <div className="h-48 border-t border-border bg-card flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="size-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Interview Notes</h3>
                <span className="text-xs text-muted-foreground">• Private, visible only to you</span>
              </div>
              <Button variant="outline" size="sm">
                Save Notes
              </Button>
            </div>
            <div className="flex-1 p-4">
              <Textarea
                placeholder="Take notes during the interview..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
