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
import { codeService } from "@/services/codeService"
import { webSocketService } from "@/services/webSocketService"
import apiClient from "@/services/apiClient"
import { interviewService } from "@/services/interviewService"

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

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Interview state
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState("code")
  const [isPending, setIsPending] = useState(true) // Default to true, will be updated after fetch
  const [isLoadingInterview, setIsLoadingInterview] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [interviewId, setInterviewId] = useState<string>("")
  const [interview, setInterview] = useState<any>(null)

  // Code state
  const [candidateCode, setCandidateCode] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("javascript")

  // Timer state - avoid hydration mismatch
  const [elapsedTime, setElapsedTime] = useState("0:00")

  // Chat state and hooks
  const scrollRef = useRef<HTMLDivElement>(null)
  const codeDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const conversation = useChatStore((state) => state.getConversation(interviewId))
  const addMessage = useChatStore((state) => state.addMessage)
  const setConnectionStatus = useChatStore((state) => state.setConnectionStatus)
  const loadHistory = useChatStore((state) => state.loadHistory)

  // Extract interview ID from params on mount
  useEffect(() => {
    const extractId = async () => {
      try {
        const resolvedParams = await params
        if (resolvedParams.id) {
          setInterviewId(resolvedParams.id)
          console.log("[Interviewer] Interview ID from URL:", resolvedParams.id)
        }
      } catch (error) {
        console.error("Error extracting interview ID from params:", error)
      }
    }

    extractId()
  }, [params])

  // Verify interview exists and fetch status when interviewId is available
  useEffect(() => {
    if (!interviewId) return

    const verifyInterview = async () => {
      try {
        console.log("[Interviewer] Verifying interview exists with ID:", interviewId)
        const interviewData = await apiClient.get(`/interviews/${interviewId}`)
        console.log("[Interviewer] Interview found:", interviewData)
        console.log("[Interviewer] Interview status:", interviewData?.status)

        // Store the interview data for use in UI
        setInterview(interviewData)

        // Set isPending to true if interview status is "scheduled"
        if (interviewData?.status === "scheduled") {
          console.log("[Interviewer] Setting isPending to true - interview is scheduled")
          setIsPending(true)
        } else {
          console.log("[Interviewer] Setting isPending to false - interview is already", interviewData?.status)
          setIsPending(false)
        }
      } catch (error: any) {
        console.error("[Interviewer] Interview not found or error fetching:", error?.message)
        console.error("[Interviewer] Status:", error?.status)
        setIsPending(false)
      } finally {
        setIsLoadingInterview(false)
      }
    }

    verifyInterview()
  }, [interviewId])

  // Load chat history when interviewId is available
  useEffect(() => {
    if (!interviewId) return

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

  // Set up code update listener FIRST (before WebSocket)
  useEffect(() => {
    const handleCodeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      const codeUpdate = customEvent.detail
      setCandidateCode(codeUpdate.code)
      setCodeLanguage(codeUpdate.language)
      console.log('Code updated from WebSocket:', codeUpdate)
    }

    window.addEventListener('codeUpdate', handleCodeUpdate)
    return () => {
      window.removeEventListener('codeUpdate', handleCodeUpdate)
    }
  }, [])

  // Update elapsed time every second (client-side only to avoid hydration mismatch)
  useEffect(() => {
    if (!interview?.startedAt) return

    const timer = setInterval(() => {
      const startTime = new Date(interview.startedAt).getTime()
      const elapsed = Date.now() - startTime
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [interview?.startedAt])

  // Poll interview status to detect when interview is started (transitions from pending to live)
  useEffect(() => {
    if (!interviewId || isPending === false) return

    const pollInterval = setInterval(async () => {
      try {
        const interview = await apiClient.get(`/interviews/${interviewId}`)
        console.log("[Interviewer Poll] Current status:", interview?.status, "isPending:", isPending)

        // If status changed from "scheduled" to "in_progress", transition to live
        if (interview?.status === "in_progress" && isPending === true) {
          console.log("[Interviewer Poll] Interview started, transitioning to live view")
          setIsPending(false)
        }
      } catch (error) {
        console.debug("[Interviewer Poll] Error polling status:", error)
      }
    }, 1000) // Poll every 1 second

    return () => clearInterval(pollInterval)
  }, [interviewId, isPending])

  // Load latest candidate code when interviewId is available
  useEffect(() => {
    if (!interviewId || isPending) return

    const loadLatestCode = async () => {
      try {
        const codeResponse = await codeService.getLatestCode(interviewId)
        setCandidateCode(codeResponse.code)
        setCodeLanguage(codeResponse.language)
        console.log('Latest code loaded:', codeResponse)
      } catch (error) {
        console.error("Error loading candidate code:", error)
      }
    }

    loadLatestCode()
  }, [interviewId, isPending])

  // Connect to WebSocket when interviewId is available
  useEffect(() => {
    if (!interviewId) return

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

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/i/xK9mPq2nR4vL`)
  }

  const handleStartInterview = async () => {
    if (!interviewId) {
      console.error("[Interviewer] Interview ID not available")
      alert("Interview ID not found. Please refresh the page.")
      return
    }

    try {
      setIsStarting(true)
      console.log("[Interviewer] Starting interview with ID:", interviewId, "Type:", typeof interviewId)

      // Call backend API to start the interview using the service
      const interviewIdAsNumber = parseInt(interviewId, 10)
      if (isNaN(interviewIdAsNumber)) {
        throw new Error("Invalid interview ID: must be a number")
      }

      const response = await interviewService.startInterview(interviewIdAsNumber)
      console.log("[Interviewer] API Response:", response)

      // Update local state to show live view
      setIsPending(false)
      console.log("[Interviewer] Interview started successfully")
    } catch (error: any) {
      console.error("[Interviewer] Full error object:", error)
      console.error("[Interviewer] Error starting interview:", error?.message)
      console.error("[Interviewer] Error details:", {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        response: error?.response,
      })
      alert(`Failed to start interview: ${error?.message || "Unknown error"}`)
    } finally {
      setIsStarting(false)
    }
  }

  // Show loading while fetching interview data
  if (isLoadingInterview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview...</p>
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold">{interview?.candidate?.name || "Candidate"}</h1>
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
                </div>
                <p className="text-sm text-muted-foreground">
                  {interview?.question?.title || "Loading question..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isPending && (
                <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted">
                  <Clock className="size-4" />
                  <span className="font-mono">{elapsedTime}</span>
                </div>
              )}
              {isPending ? (
                <>
                  <Button variant="outline" onClick={copyLink}>
                    <Copy className="size-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={handleStartInterview} disabled={isStarting}>
                    <PlayCircle className="size-4 mr-2" />
                    {isStarting ? "Starting..." : "Start Interview"}
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
                  <span className="font-medium">{interview?.candidate?.name || "Loading..."}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-24">Question:</span>
                  <span>{interview?.question?.title || "Loading..."}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-24">Difficulty:</span>
                  <Badge variant="outline" className="text-xs">
                    {interview?.question?.difficulty || "medium"}
                  </Badge>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground min-w-24">Language:</span>
                  <span className="capitalize">{interview?.language || "javascript"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 text-left">
              <h3 className="font-semibold mb-2">Question Description</h3>
              <p className="text-muted-foreground leading-relaxed">{interview?.question?.description || "Loading question description..."}</p>
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
                        <span>Shared code editor - Candidate sees your edits in real-time</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {codeLanguage}
                      </Badge>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <Editor
                        height="100%"
                        language={codeLanguage}
                        value={candidateCode}
                        onChange={(value) => {
                          setCandidateCode(value || '')
                          // Send updated code to candidate via WebSocket (with debounce)
                          if (interviewId && webSocketService.isConnected()) {
                            // Clear previous debounce timer
                            if (codeDebounceRef.current) {
                              clearTimeout(codeDebounceRef.current)
                            }
                            // Set new debounce timer
                            codeDebounceRef.current = setTimeout(() => {
                              webSocketService.publishCodeUpdate(value || '', codeLanguage)
                              console.log('[Interviewer] Code update sent to candidate')
                            }, 200)
                          }
                        }}
                        theme="vs-dark"
                        options={{
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

            {/* AI Chat Sidebar - Live sync with Candidate */}
            <div className="w-96 border-l border-border bg-card flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="size-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Candidate AI Chat</h3>
                    <p className="text-xs text-muted-foreground">
                      {conversation.isConnected ? "● Live Sync" : "○ Syncing..."}
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
                            {msg.timestamp instanceof Date
                              ? msg.timestamp.toLocaleTimeString()
                              : new Date(msg.timestamp).toLocaleTimeString()}
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

              {/* Footer - Live sync indicator */}
              <div className="p-4 border-t border-border bg-accent/5">
                <p className="text-xs text-muted-foreground text-center">
                  Live synchronized with candidate&apos;s AI conversation
                </p>
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
