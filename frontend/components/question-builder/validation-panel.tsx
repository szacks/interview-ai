"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { validateAllTemplates, type ValidationResult } from "@/services/validationService"
import type { QuestionData } from "@/lib/types/question-builder"

interface ValidationPanelProps {
  questionData: QuestionData
}

export function ValidationPanel({ questionData }: ValidationPanelProps) {
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const handleValidate = async () => {
    setValidating(true)
    setValidationResult(null)

    try {
      const result = await validateAllTemplates(questionData.codeTemplates)
      setValidationResult(result)
    } catch (error) {
      console.error("Validation error:", error)
    } finally {
      setValidating(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Template Validation</h3>
            <p className="text-sm text-muted-foreground">
              Check if your code templates compile correctly
            </p>
          </div>
          <Button onClick={handleValidate} disabled={validating}>
            {validating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              "Validate Templates"
            )}
          </Button>
        </div>

        {validationResult && (
          <div className="space-y-3 mt-4">
            {/* Overall Status */}
            <Alert variant={validationResult.allValid ? "default" : "destructive"}>
              {validationResult.allValid ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <XCircle className="size-4" />
              )}
              <AlertDescription>
                {validationResult.allValid
                  ? "All templates compiled successfully!"
                  : "Some templates have compilation errors"}
              </AlertDescription>
            </Alert>

            {/* Per-Language Results */}
            <div className="grid gap-3">
              {Object.entries(validationResult.results).map(([lang, result]) => (
                <Card key={lang} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {result.success ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <XCircle className="size-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">{lang}</h4>
                      {result.success ? (
                        <p className="text-sm text-muted-foreground">
                          Template compiles successfully
                        </p>
                      ) : (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-destructive mb-1">
                            Compilation Errors:
                          </p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {result.errors}
                          </pre>
                        </div>
                      )}
                      {result.warnings && result.warnings.length > 0 && (
                        <div className="mt-2 flex items-start gap-2">
                          <AlertTriangle className="size-4 text-yellow-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Warnings:</p>
                            <ul className="text-xs text-muted-foreground list-disc list-inside">
                              {result.warnings.map((warning, idx) => (
                                <li key={idx}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Additional Info */}
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Note:</strong> This validation only checks if the template code compiles.
                Test cases cannot be validated until they are executed during an actual interview.
                Make sure to manually test your question after publishing.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </Card>
  )
}
