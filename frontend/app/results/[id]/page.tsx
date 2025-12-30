"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Code2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Save,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Editor from "@monaco-editor/react"
import { evaluationService, EvaluationResponse } from "@/services/evaluationService"
import { chatService } from "@/services/chatService"
import { codeService } from "@/services/codeService"
import apiClient from "@/services/apiClient"
import type { ChatMessageResponse } from "@/types/chat"

interface TestResult {
  name: string
  passed: boolean
}

interface ScoringSection {
  id: string
  title: string
  description: string
  whatToAssess: string[]
  questions: string[]
  redFlags: string[]
  greenFlags: string[]
}

const scoringSections: ScoringSection[] = [
  {
    id: "communication",
    title: "Communication",
    description: "Can they explain their thinking clearly?",
    whatToAssess: [
      "Can explain solution step-by-step",
      "Uses correct technical terminology",
      "Can trace through examples",
      "Responsive to clarifying questions",
    ],
    questions: [
      "Walk me through your solution. How does it work?",
      "Can you explain this part in more detail?",
      "Let me give you an example - can you trace through?",
    ],
    redFlags: [
      "Can't explain the code",
      "Gets defensive when questioned",
      "Can't trace through own examples",
      "Uses vague explanations",
    ],
    greenFlags: [
      "Clear step-by-step explanation",
      "Uses correct terminology naturally",
      "Adjusts explanation for different levels",
      "Asks clarifying questions back",
    ],
  },
  {
    id: "algorithmic",
    title: "Algorithmic Thinking",
    description: "Do they think about edge cases and alternatives?",
    whatToAssess: [
      "Identifies edge cases proactively",
      "Considers alternative approaches",
      "Discusses time/space tradeoffs",
      "Tests boundary conditions",
    ],
    questions: [
      "What edge cases did you consider?",
      "Are there alternative approaches?",
      "What are the time and space complexity tradeoffs?",
      "Did you test with boundary conditions?",
    ],
    redFlags: [
      "Didn't think about edge cases",
      "Only one approach considered",
      "Can't identify potential issues",
      "No discussion of complexity",
    ],
    greenFlags: [
      "Proactively mentions edge cases",
      "Discusses multiple approaches with tradeoffs",
      "Identifies time/space complexity",
      "Tests with specific edge cases",
    ],
  },
  {
    id: "problemSolving",
    title: "Problem Solving",
    description: "Is their code clean and do they debug systematically?",
    whatToAssess: [
      "Code is clean and readable",
      "Proper error handling",
      "Systematic debugging approach",
      "Willing to refactor for clarity",
    ],
    questions: [
      "Walk me through your code structure",
      "How did you debug when tests failed?",
      "Can you refactor this section?",
      "How do you handle errors?",
    ],
    redFlags: [
      "Tried random things until it worked",
      "Code is messy and hard to follow",
      "No error handling",
      "Gets defensive about code quality",
    ],
    greenFlags: [
      "Clean, readable code",
      "Comprehensive error handling",
      "Systematic debugging approach",
      "Willing to refactor",
    ],
  },
  {
    id: "aiCollaboration",
    title: "AI Collaboration",
    description: "Do they use AI effectively and understand it?",
    whatToAssess: [
      "Used AI for implementation help",
      "Understands AI-generated code",
      "Tests AI suggestions before using",
      "Reviews and improves upon AI code",
    ],
    questions: [
      "Did you use AI to help? Where?",
      "Can you explain the AI-generated parts?",
      "Did you test the AI code?",
      "Did you improve anything the AI wrote?",
    ],
    redFlags: [
      "Just copied AI code as-is",
      "Didn't test AI suggestions",
      "Can't explain AI parts",
      "Gets defensive about AI usage",
    ],
    greenFlags: [
      "Tested each suggestion before using",
      "Reviewed and found bugs",
      "Refactored for clarity",
      "Questioned approaches and tried alternatives",
    ],
  },
]

export default function ScoringPage() {
  const params = useParams()
  const router = useRouter()
  const interviewId = Number(params.id)

  // Loading states
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Data from API
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessageResponse[]>([])
  const [code, setCode] = useState("")
  const [testResults, setTestResults] = useState<TestResult[]>([])

  // Form state
  const [adjustAutoScore, setAdjustAutoScore] = useState(false)
  const [autoScoreAdjusted, setAutoScoreAdjusted] = useState(0)
  const [autoScoreReason, setAutoScoreReason] = useState("")

  const [manualScores, setManualScores] = useState({
    communication: 0,
    algorithmic: 0,
    problemSolving: 0,
    aiCollaboration: 0,
  })

  const [notes, setNotes] = useState({
    communication: "",
    algorithmic: "",
    problemSolving: "",
    aiCollaboration: "",
  })

  const [customObservations, setCustomObservations] = useState("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [reviewSectionExpanded, setReviewSectionExpanded] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch evaluation data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!interviewId || isNaN(interviewId)) {
        setError("Invalid interview ID")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch evaluation, chat history, code, and code execution results in parallel
        const [evalData, chatData, codeData, executionData] = await Promise.all([
          evaluationService.getEvaluation(interviewId),
          chatService.getChatHistory(interviewId).catch(() => []),
          codeService.getLatestCode(interviewId).catch(() => null),
          evaluationService.getCodeExecutionResults(interviewId).catch(() => null),
        ])

        setChatHistory(chatData)

        console.log("[Results] Interview ID:", interviewId)
        console.log("[Results] Code data received:", codeData)
        if (codeData && codeData.code) {
          console.log("[Results] Code submission ID:", codeData.id, "Language:", codeData.language, "Timestamp:", codeData.timestamp, "Length:", codeData.code.length)
          console.log("[Results] First 100 chars:", codeData.code.substring(0, 100))
          setCode(codeData.code)
        } else {
          console.log("[Results] No code data or empty code received:", codeData)
          setCode("")
        }

        // Use real test results from code execution and update evaluation with correct test counts
        if (executionData && executionData.testDetails && Array.isArray(executionData.testDetails)) {
          // Map backend TestCaseResult (testName, passed) to frontend TestResult (name, passed)
          const mappedResults = executionData.testDetails.map((test: any) => ({
            name: test.testName || test.name || "Test",
            passed: test.passed === true,
          }))
          setTestResults(mappedResults)

          // Count actual passed tests from execution data
          const actualTestsPassed = mappedResults.filter((t: any) => t.passed).length
          const actualTestsTotal = mappedResults.length

          // Update evaluation with real test counts
          evalData.testsPassed = actualTestsPassed
          evalData.testsTotal = actualTestsTotal

          // Also update auto score if available from execution
          if (executionData.autoScore !== undefined) {
            evalData.autoScoreOriginal = executionData.autoScore
          }
        }

        setEvaluation(evalData)

        // Populate form with existing evaluation data
        if (evalData) {
          let autoScore = evalData.autoScoreOriginal || 0

          // Override with real auto score from test execution if available
          if (executionData && executionData.autoScore !== undefined) {
            autoScore = executionData.autoScore
          }

          if (evalData.autoScoreAdjusted !== undefined && evalData.autoScoreAdjusted !== null) {
            setAdjustAutoScore(true)
            setAutoScoreAdjusted(evalData.autoScoreAdjusted)
            setAutoScoreReason(evalData.autoScoreAdjustedReason || "")
          } else {
            setAutoScoreAdjusted(autoScore)
          }

          setManualScores({
            communication: evalData.manualScoreCommunication || 0,
            algorithmic: evalData.manualScoreAlgorithmic || 0,
            problemSolving: evalData.manualScoreProblemSolving || 0,
            aiCollaboration: evalData.manualScoreAiCollaboration || 0,
          })

          setNotes({
            communication: evalData.notesCommunication || "",
            algorithmic: evalData.notesAlgorithmic || "",
            problemSolving: evalData.notesProblemSolving || "",
            aiCollaboration: evalData.notesAiCollaboration || "",
          })

          setCustomObservations(evalData.customObservations || "")
        }
      } catch (err) {
        console.error("Failed to fetch evaluation data:", err)
        setError("Failed to load evaluation data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [interviewId])

  // Handle submit evaluation
  const handleSubmit = async () => {
    if (!evaluation) return

    try {
      setSubmitting(true)
      await evaluationService.submitEvaluation({
        interviewId,
        autoScoreAdjusted: adjustAutoScore ? autoScoreAdjusted : undefined,
        autoScoreAdjustedReason: adjustAutoScore ? autoScoreReason : undefined,
        manualScoreCommunication: manualScores.communication,
        manualScoreAlgorithmic: manualScores.algorithmic,
        manualScoreProblemSolving: manualScores.problemSolving,
        manualScoreAiCollaboration: manualScores.aiCollaboration,
        notesCommunication: notes.communication,
        notesAlgorithmic: notes.algorithmic,
        notesProblemSolving: notes.problemSolving,
        notesAiCollaboration: notes.aiCollaboration,
        customObservations,
        isDraft: false,
      })
      router.push("/dashboard")
    } catch (err) {
      console.error("Failed to submit evaluation:", err)
      setError("Failed to submit evaluation")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!evaluation) return

    try {
      setSavingDraft(true)
      setError(null)
      setSuccessMessage(null)
      const updated = await evaluationService.saveDraft({
        interviewId,
        autoScoreAdjusted: adjustAutoScore ? autoScoreAdjusted : undefined,
        autoScoreAdjustedReason: adjustAutoScore ? autoScoreReason : undefined,
        manualScoreCommunication: manualScores.communication,
        manualScoreAlgorithmic: manualScores.algorithmic,
        manualScoreProblemSolving: manualScores.problemSolving,
        manualScoreAiCollaboration: manualScores.aiCollaboration,
        notesCommunication: notes.communication,
        notesAlgorithmic: notes.algorithmic,
        notesProblemSolving: notes.problemSolving,
        notesAiCollaboration: notes.aiCollaboration,
        customObservations,
      })
      setEvaluation(updated)
      setSuccessMessage("Draft saved successfully!")
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("Failed to save draft:", err)
      setError("Failed to save draft")
    } finally {
      setSavingDraft(false)
    }
  }

  // Handle export as PDF
  const handleExport = async () => {
    try {
      setIsExporting(true)
      const response = await apiClient.get(`/interview-evaluations/export/pdf/${interviewId}`, {
        responseType: 'arraybuffer',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `interview_evaluation_${interviewId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to export PDF:", err)
      setError("Failed to export PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const calculateManualScore = () => {
    const total =
      manualScores.communication + manualScores.algorithmic + manualScores.problemSolving + manualScores.aiCollaboration
    // Each parameter is 1-5, so max total is 20. Normalize to 100: (total / 20) * 100
    return Math.round((total / 20) * 100)
  }

  const calculateFinalScore = () => {
    const autoScore = adjustAutoScore ? autoScoreAdjusted : (evaluation?.autoScoreOriginal || 0)
    const manualScore = calculateManualScore()
    return Math.round(autoScore * 0.4 + manualScore * 0.6)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading evaluation...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !evaluation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="size-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="size-8 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground mb-4">Evaluation not found</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const getFinalScoreInterpretation = (score: number) => {
    if (score >= 91) return { text: "Exceptional", color: "text-chart-3", icon: CheckCircle2 }
    if (score >= 81) return { text: "Strong", color: "text-chart-3", icon: CheckCircle2 }
    if (score >= 71) return { text: "Good", color: "text-chart-4", icon: CheckCircle2 }
    if (score >= 51) return { text: "Concerning", color: "text-destructive", icon: XCircle }
    return { text: "Not Ready", color: "text-destructive", icon: XCircle }
  }

  const finalScore = calculateFinalScore()
  const interpretation = getFinalScoreInterpretation(finalScore)
  const manualScore = calculateManualScore()
  const ScoreIcon = interpretation.icon

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold">{evaluation.candidateName || "Unknown Candidate"}</h1>
                  <Badge variant="secondary">
                    <CheckCircle2 className="size-3 mr-1" />
                    {evaluation.interviewStatus === "completed" ? "Interview Completed" : evaluation.interviewStatus}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {evaluation.questionTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Download className="size-4 mr-2" />
                )}
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Main Content - Scoring */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-chart-3" />
                  Auto Score Review (40% weight)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Test Results</div>
                    <div className="text-2xl font-bold">
                      {evaluation.testsPassed || 0} / {evaluation.testsTotal || 0} tests passed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Auto Score</div>
                    <div className="text-3xl font-bold text-chart-3">
                      {evaluation.autoScoreOriginal || 0}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="adjust-score"
                      checked={adjustAutoScore}
                      onCheckedChange={(checked) => {
                        setAdjustAutoScore(checked as boolean)
                        if (!checked) {
                          setAutoScoreAdjusted(evaluation.autoScoreOriginal || 0)
                          setAutoScoreReason("")
                        }
                      }}
                    />
                    <Label htmlFor="adjust-score" className="cursor-pointer">
                      Manually adjust auto score
                    </Label>
                  </div>

                  {adjustAutoScore && (
                    <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={autoScoreAdjusted}
                          onChange={(e) => setAutoScoreAdjusted(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">/ 100</span>
                      </div>
                      <div className="space-y-2">
                        <Label>Why adjust? (required)</Label>
                        <Textarea
                          placeholder="Explain why you're adjusting the score..."
                          value={autoScoreReason}
                          onChange={(e) => setAutoScoreReason(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Manual Assessment (60% weight)
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Score each parameter from 1-5 - all parameters have equal weight (25% each)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {scoringSections.map((section, index) => {
                  const isExpanded = expandedSections[section.id]
                  const currentScore = manualScores[section.id as keyof typeof manualScores]

                  return (
                    <div key={section.id} className="border rounded-lg">
                      {/* Section Header */}
                      <div className="p-4 bg-muted/30">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-semibold">
                                {index + 1}. {section.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                25% weight
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => toggleSection(section.id)} className="ml-2">
                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Score (1-5)</Label>
                            <span className="text-xl font-bold">{currentScore}/5</span>
                          </div>
                          <Slider
                            value={[currentScore]}
                            onValueChange={([value]) => setManualScores({ ...manualScores, [section.id]: value })}
                            min={0}
                            max={5}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Expanded Guidance */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 border-t">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="size-4 text-chart-4" />
                              <span className="font-medium text-sm">What to Assess</span>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {section.whatToAssess.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground list-disc">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="size-4 text-primary" />
                              <span className="font-medium text-sm">Questions to Ask</span>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {section.questions.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground list-disc">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="size-4 text-destructive" />
                                <span className="font-medium text-sm">Red Flags</span>
                              </div>
                              <ul className="space-y-1 ml-6">
                                {section.redFlags.map((item, i) => (
                                  <li key={i} className="text-sm text-muted-foreground list-disc">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="size-4 text-chart-3" />
                                <span className="font-medium text-sm">Green Flags</span>
                              </div>
                              <ul className="space-y-1 ml-6">
                                {section.greenFlags.map((item, i) => (
                                  <li key={i} className="text-sm text-muted-foreground list-disc">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="p-4 border-t bg-muted/10">
                        <Label className="text-sm mb-2 block">Notes (optional)</Label>
                        <Textarea
                          placeholder={`Your observations about ${section.title.toLowerCase()}...`}
                          value={notes[section.id as keyof typeof notes]}
                          onChange={(e) => setNotes({ ...notes, [section.id]: e.target.value })}
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Growth signals, cultural fit, role-specific notes, overall impressions..."
                  value={customObservations}
                  onChange={(e) => setCustomObservations(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary & Review */}
          <div className="space-y-6">
            <Card className="">
              <CardHeader>
                <CardTitle>Final Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <ScoreIcon className={`size-8 ${interpretation.color}`} />
                    <div className="text-5xl font-bold">
                      {finalScore}
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <Badge className={interpretation.color} variant="outline">
                    {interpretation.text} Candidate
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium mb-2">Score Breakdown</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Auto Score (40%)</span>
                      <span className="font-medium">
                        {adjustAutoScore ? autoScoreAdjusted : (evaluation.autoScoreOriginal || 0)} × 0.4 ={" "}
                        {Math.round((adjustAutoScore ? autoScoreAdjusted : (evaluation.autoScoreOriginal || 0)) * 0.4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Manual Score (60%)</span>
                      <span className="font-medium">
                        {manualScore} × 0.6 = {Math.round(manualScore * 0.6)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-sm font-medium mb-2">
                      Manual Score Calculation
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Sum of all parameters normalized to 100
                      </div>
                    </div>
                    <div className="space-y-1">
                      {scoringSections.map((section) => {
                        const score = manualScores[section.id as keyof typeof manualScores]
                        return (
                          <div key={section.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{section.title}</span>
                            <span className="font-medium">
                              {score}/5
                              <span className="text-xs text-muted-foreground ml-1">(25%)</span>
                            </span>
                          </div>
                        )
                      })}
                      <div className="pt-2 border-t flex justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>
                          {manualScores.communication +
                            manualScores.algorithmic +
                            manualScores.problemSolving +
                            manualScores.aiCollaboration}
                          /20 = {manualScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive text-center mb-2">{error}</div>
                )}
                {successMessage && (
                  <div className="text-sm text-green-600 text-center mb-2 flex items-center justify-center gap-2">
                    <CheckCircle className="size-4" />
                    {successMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitting || savingDraft}
                  >
                    {submitting ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="size-4 mr-2" />
                    )}
                    {submitting ? "Submitting..." : "Submit Evaluation"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleSaveDraft}
                    disabled={submitting || savingDraft}
                  >
                    {savingDraft ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : null}
                    {savingDraft ? "Saving..." : "Save Draft"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interview Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{evaluation.duration || 0} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tests Passed</span>
                  <span className="font-medium">
                    {evaluation.testsPassed || 0}/{evaluation.testsTotal || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <Badge variant="outline">{evaluation.language || "N/A"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {evaluation.isDraft ? (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      Draft
                    </Badge>
                  ) : (
                    <Badge variant="default">
                      Submitted
                    </Badge>
                  )}
                </div>
                {evaluation.updatedAt && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground text-xs">Last Updated</span>
                    <span className="text-xs font-medium">
                      {new Date(evaluation.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setReviewSectionExpanded(!reviewSectionExpanded)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    Interview Review Materials
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    View submitted code, test results, and AI conversation history
                  </p>
                </div>
                {reviewSectionExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
              </div>
            </CardHeader>

            {reviewSectionExpanded && (
              <CardContent className="pt-0">
                <Tabs defaultValue="code" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="code">
                      <Code2 className="size-4 mr-2" />
                      Code Solution
                    </TabsTrigger>
                    <TabsTrigger value="tests">
                      <CheckCircle2 className="size-4 mr-2" />
                      Test Results
                    </TabsTrigger>
                    <TabsTrigger value="chat">
                      <MessageSquare className="size-4 mr-2" />
                      AI Conversation
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="code">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="h-96">
                        {code ? (
                          <Editor
                            height="100%"
                            language={evaluation.language || "javascript"}
                            value={code}
                            theme="vs-dark"
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              fontSize: 14,
                              scrollBeyondLastLine: false,
                            }}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            No code submission found
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tests">
                    <div className="space-y-2">
                      {testResults.length > 0 ? (
                        testResults.map((test, idx) => (
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
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No test results available
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="chat">
                    <div className="space-y-4">
                      {chatHistory.length > 0 ? (
                        chatHistory.map((chat, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div
                              className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                chat.role === "user" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                              }`}
                            >
                              {chat.role === "user" ? (
                                <FileText className="size-4" />
                              ) : (
                                <MessageSquare className="size-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {chat.role === "user" ? "Candidate" : "AI Assistant"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{chat.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No AI conversation history available
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
