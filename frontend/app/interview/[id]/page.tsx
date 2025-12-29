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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Play,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Editor from "@monaco-editor/react"
import { useChatStore } from "@/stores/chatStore"
import { chatService } from "@/services/chatService"
import { codeService } from "@/services/codeService"
import { webSocketService } from "@/services/webSocketService"
import apiClient from "@/services/apiClient"
import { interviewService } from "@/services/interviewService"
import { useRouter } from "next/navigation"


export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()

  // Interview state
  const [notes, setNotes] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const [isPending, setIsPending] = useState(true) // Default to true, will be updated after fetch
  const [isLoadingInterview, setIsLoadingInterview] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isEndingInterview, setIsEndingInterview] = useState(false)
  const [interviewId, setInterviewId] = useState<string>("")
  const [interview, setInterview] = useState<any>(null)
  const [testMode, setTestMode] = useState(false) // Test mode: don't save completion

  // Code state
  const [candidateCode, setCandidateCode] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("javascript")

  // Timer state - avoid hydration mismatch
  const [elapsedTime, setElapsedTime] = useState("0:00")

  // Test and questions state
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([])
  const [expandedTests, setExpandedTests] = useState<number[]>([])
  const [expandedTestOperations, setExpandedTestOperations] = useState<number[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testsRun, setTestsRun] = useState(false)
  const [testResults, setTestResults] = useState<Array<any>>([])
  const [testCasesCache, setTestCasesCache] = useState<Map<number, any>>(new Map())
  const [executionError, setExecutionError] = useState<string | null>(null)

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
        console.log("[Interviewer] Question data:", interviewData?.question)
        console.log("[Interviewer] Follow-up questions:", interviewData?.question?.followUpQuestions)

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
        // Silently ignore errors during polling
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
        if (codeResponse && codeResponse.code) {
          setCandidateCode(codeResponse.code)
          if (codeResponse.language) {
            setCodeLanguage(codeResponse.language)
          }
          console.log('Latest code loaded:', codeResponse)
        }
      } catch (error) {
        // Log unexpected errors only
        console.debug("Error loading latest code:", error instanceof Error ? error.message : 'Unknown error')
      }
    }

    loadLatestCode()
  }, [interviewId, isPending])

  // Initialize code from question template if no previous code exists
  useEffect(() => {
    if (!interview?.question || !codeLanguage || candidateCode) return

    const question = interview.question
    let initialCode = ""

    if (codeLanguage === "javascript" && question.initialCodeJavascript) {
      initialCode = question.initialCodeJavascript
    } else if (codeLanguage === "python" && question.initialCodePython) {
      initialCode = question.initialCodePython
    } else if (codeLanguage === "java" && question.initialCodeJava) {
      initialCode = question.initialCodeJava
    }

    if (initialCode) {
      setCandidateCode(initialCode)
      console.log(`[Interviewer] Initialized ${codeLanguage} code from question template`)
    }
  }, [interview, codeLanguage, candidateCode])

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

  // Load test case details when a test is expanded
  useEffect(() => {
    const loadTestCases = async () => {
      for (const testIdx of expandedTests) {
        const test = testResults[testIdx]
        if (test && test.testCaseId && !testCasesCache.has(test.testCaseId)) {
          try {
            const testCase = await interviewService.getTestCaseById(test.testCaseId)
            setTestCasesCache((prev) => new Map(prev).set(test.testCaseId, testCase))
          } catch (error) {
            console.error(`Error loading test case ${test.testCaseId}:`, error)
          }
        }
      }
    }

    if (expandedTests.length > 0 && testResults.length > 0) {
      loadTestCases()
    }
  }, [expandedTests, testResults])

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const toggleTest = (index: number) => {
    setExpandedTests((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleRunTests = async () => {
    if (!interviewId || !candidateCode) return

    setIsRunningTests(true)
    setExecutionError(null)

    try {
      const result = await codeService.executeCode({
        interviewId: parseInt(interviewId),
        language: codeLanguage,
        code: candidateCode,
      })

      // Store full test details including error messages
      const testDetails = result.testDetails || []
      setTestResults(testDetails)
      setTestsRun(true)
      setActiveTab("tests")

      // Preload all test case details
      const newCache = new Map(testCasesCache)
      for (const test of testDetails) {
        if (test.testCaseId && !newCache.has(test.testCaseId)) {
          try {
            const testCase = await interviewService.getTestCaseById(test.testCaseId)
            newCache.set(test.testCaseId, testCase)
          } catch (error) {
            console.error(`Error loading test case ${test.testCaseId}:`, error)
          }
        }
      }
      setTestCasesCache(newCache)

      // Show error message if execution failed
      if (result.status !== "success" && result.errorMessage) {
        setExecutionError(result.errorMessage)
      }
    } catch (error) {
      console.error("Error running tests:", error)
      setExecutionError("Failed to execute code")
      setTestResults([{ testName: "Execution failed", passed: false }])
      setTestsRun(true)
      setActiveTab("tests")
    } finally {
      setIsRunningTests(false)
    }
  }

  // Use testResults state if available, otherwise fall back to interview data
  const displayTestCases = testResults.length > 0 ? testResults : (interview?.question?.testCases || [])
  const testsPassed = displayTestCases.filter((t: any) => t.passed).length
  const allTestsPassed = testsPassed === displayTestCases.length && displayTestCases.length > 0

  const followUpQuestions = interview?.question?.followUpQuestions || []

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

  const handleEndInterview = async () => {
    if (!interviewId) {
      console.error("[Interviewer] Interview ID not available")
      alert("Interview ID not found.")
      return
    }

    try {
      setIsEndingInterview(true)
      console.log("[Interviewer] Ending interview with ID:", interviewId)

      const interviewIdAsNumber = parseInt(interviewId, 10)
      if (isNaN(interviewIdAsNumber)) {
        throw new Error("Invalid interview ID: must be a number")
      }

      // If NOT in test mode, save the completion to the backend
      if (!testMode) {
        // Call backend API to complete the interview
        await interviewService.completeInterview(interviewIdAsNumber)
        console.log("[Interviewer] Interview ended successfully")
      } else {
        console.log("[Interviewer] TEST MODE: Skipping backend completion, going directly to results")
      }

      // Redirect to scoring page
      router.push(`/results/${interviewIdAsNumber}`)
    } catch (error: any) {
      console.error("[Interviewer] Error ending interview:", error?.message)
      alert(`Failed to end interview: ${error?.message || "Unknown error"}`)
    } finally {
      setIsEndingInterview(false)
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
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
                <div className="flex items-center gap-3">
                  {process.env.NODE_ENV === 'development' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted border border-dashed border-muted-foreground/30">
                      <input
                        type="checkbox"
                        id="test-mode"
                        checked={testMode}
                        onChange={(e) => setTestMode(e.target.checked)}
                        className="cursor-pointer"
                      />
                      <label htmlFor="test-mode" className="text-sm cursor-pointer text-muted-foreground">
                        Test mode (no save)
                      </label>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    onClick={handleEndInterview}
                    disabled={isEndingInterview}
                  >
                    {isEndingInterview ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="size-4 mr-2" />
                    )}
                    {isEndingInterview ? "Ending..." : "End Interview"}
                  </Button>
                </div>
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
          {/* Main Content Area with Code on Left and Tabs on Right */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Area */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
              <div className="px-4 py-2 border-b border-border bg-card/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="size-4" />
                  <span>Viewing candidate's code in real-time</span>
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
                    readOnly: false,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Tabs Section - Chat, Tests, Follow-ups */}
            <div className="w-[550px] flex flex-col border-r border-border overflow-hidden">
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
                          {testsPassed}/{displayTestCases.length}
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

                {/* AI Chat Tab */}
                <TabsContent value="chat" className="flex-1 m-0 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold mb-1">AI Conversation</h3>
                      <p className="text-xs text-muted-foreground">Monitor the candidate's questions and AI guidance</p>
                    </div>

                    {conversation.messages.map((msg, idx) => (
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
                                {msg.timestamp instanceof Date
                                  ? msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                  : new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="text-sm leading-relaxed space-y-2">
                              {msg.content.split(/```[\s\S]*?```|```/g).map((part, i) => {
                                const codeMatch = msg.content.match(/```([\s\S]*?)```/g);
                                if (i % 2 === 1 && codeMatch) {
                                  const codeContent = codeMatch[Math.floor(i / 2)]
                                    .replace(/```/g, '')
                                    .trim();
                                  return (
                                    <div key={i} className="bg-gray-800 rounded-lg overflow-hidden my-2 border border-gray-700">
                                      <pre className="text-gray-100 p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
                                        <code>{codeContent}</code>
                                      </pre>
                                    </div>
                                  );
                                }
                                return (
                                  <span key={i} className="whitespace-pre-wrap">
                                    {part}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {conversation.messages.length === 0 && (
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                          <HelpCircle className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-sm text-muted-foreground">No AI conversation yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tests Tab */}
                <TabsContent value="tests" className="flex-1 m-0 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border">
                    <button
                      onClick={handleRunTests}
                      disabled={isRunningTests}
                      className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
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
                    </button>
                  </div>

                  {testsRun && (
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="mb-4 p-3 rounded-lg border border-border bg-card">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">Test Summary</span>
                          <Badge variant={allTestsPassed ? "default" : "destructive"} className="text-xs">
                            {testsPassed} / {displayTestCases.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {allTestsPassed
                            ? "All tests passed!"
                            : "Some tests failed. Guide the candidate to fix issues."}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {displayTestCases.map((test: any, idx: number) => {
                          const isExpanded = expandedTests.includes(idx)
                          const testCaseDef = test.testCaseId ? testCasesCache.get(test.testCaseId) : null

                          return (
                            <div
                              key={idx}
                              className={`rounded-lg border overflow-hidden ${
                                test.passed ? "border-chart-3/30 bg-chart-3/5" : "border-destructive/30 bg-destructive/5"
                              }`}
                            >
                              <button
                                onClick={() => toggleTest(idx)}
                                className="w-full p-3 flex items-start gap-2 hover:bg-accent/5 transition-colors text-left"
                              >
                                {test.passed ? (
                                  <CheckCircle2 className="size-4 text-chart-3 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  {(() => {
                                    try {
                                      const ops = JSON.parse(testCaseDef?.operationsJson || '[]')
                                      const callCount = ops.filter((op: any) => op.type === 'call').length
                                      const createOp = ops.find((op: any) => op.type === 'create')
                                      const limit = createOp?.args?.[0]
                                      const description = testCaseDef?.description || test.testName

                                      let title = description
                                      if (limit !== undefined && callCount > 0) {
                                        title = `${description} - Limit: ${limit} requests, Requests made: ${callCount}`
                                      }

                                      return <span className="text-xs font-medium block">{title}</span>
                                    } catch (e) {
                                      return <span className="text-xs font-medium block">{testCaseDef?.description || test.testName}</span>
                                    }
                                  })()}
                                  {test.errorMessage && !test.passed && (
                                    <span className="text-xs text-destructive/70 block mt-0.5">{test.errorMessage}</span>
                                  )}
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="size-4 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <ChevronDown className="size-4 flex-shrink-0 mt-0.5" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="border-t border-current/10 p-3 bg-background/30 space-y-3">
                                  {test.errorMessage && (
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold mb-1 text-destructive">Error:</p>
                                      <pre className="text-xs bg-background rounded p-2 overflow-x-auto whitespace-pre-wrap break-words border border-border">
                                        {test.errorMessage}
                                      </pre>
                                    </div>
                                  )}

                                  {test.expected && (
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold mb-1">Expected:</p>
                                      <pre className="text-xs bg-background rounded p-2 overflow-x-auto border border-border">
                                        {test.expected}
                                      </pre>
                                    </div>
                                  )}

                                  {test.actual && (
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold mb-1">Actual:</p>
                                      <pre className="text-xs bg-background rounded p-2 overflow-x-auto border border-border">
                                        {test.actual}
                                      </pre>
                                    </div>
                                  )}

                                  {test.executionTimeMs > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      <Clock className="size-3 inline mr-1" />
                                      Execution time: {test.executionTimeMs}ms
                                    </div>
                                  )}

                                  {/* Test Case Definition Section */}
                                  {testCaseDef && testCaseDef.operationsJson && (
                                        <div>
                                          <button
                                            onClick={() => setExpandedTestOperations((prev) =>
                                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                                            )}
                                            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
                                          >
                                            {expandedTestOperations.includes(idx) ? (
                                              <ChevronUp className="size-3" />
                                            ) : (
                                              <ChevronDown className="size-3" />
                                            )}
                                            Show test
                                          </button>

                                          {expandedTestOperations.includes(idx) && (
                                            <pre className="text-xs bg-background rounded p-2 overflow-x-auto whitespace-pre-wrap break-words max-h-40 border border-border text-muted-foreground">
                                              {(() => {
                                                try {
                                                  const ops = JSON.parse(testCaseDef.operationsJson)
                                                  return JSON.stringify(ops, null, 2)
                                                } catch (e) {
                                                  return testCaseDef.operationsJson
                                                }
                                              })()}
                                            </pre>
                                          )}
                                        </div>
                                      )}
                                </div>
                              )}
                            </div>
                          )
                        })}
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

                {/* Follow-up Questions Tab */}
                <TabsContent value="questions" className="flex-1 m-0 overflow-y-auto">
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold mb-1">Follow-up Questions</h3>
                      <p className="text-xs text-muted-foreground">
                        Assess deeper understanding and problem-solving approach
                      </p>
                    </div>

                    {followUpQuestions && followUpQuestions.length > 0 ? (
                    <div className="space-y-2">
                      {followUpQuestions.map((q, idx) => {
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
                                      <Lightbulb className="size-3.5 text-chart-1" />
                                      <span className="font-semibold text-chart-1">Answer</span>
                                    </div>
                                    <p className="text-foreground leading-relaxed">{q.answer}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    ) : (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                          <HelpCircle className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-sm text-muted-foreground">No follow-up questions available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
