# Validation with AI-Generated Implementation

## Concept

Use AI to generate a working implementation → Run tests against it → Validate tests work correctly

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Question Builder (Step 4)                         │
│                                                              │
│ 1. User clicks "Validate Tests with AI"                     │
│ 2. Send: template code + test cases + description           │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend: /api/code/validate-tests-with-ai                   │
│                                                              │
│ 1. Call Claude API to generate implementation               │
│ 2. Replace TODOs with working code                          │
│ 3. Run tests using existing DockerSandboxService            │
│ 4. Return: implementation + test results                    │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Validation Results Modal                          │
│                                                              │
│ • Show AI implementation (editable)                         │
│ • Show test results (pass/fail)                             │
│ • Allow user to re-run after editing                        │
│ • Discard implementation when done (not saved)              │
└─────────────────────────────────────────────────────────────┘
```

## API Design

### Request: POST `/api/code/validate-tests-with-ai`

```json
{
  "language": "javascript",
  "templateCode": "class RateLimiter {\n  constructor(limit, windowMs) {\n    // TODO: Implement\n  }\n  allowRequest(userId, timestamp) {\n    // TODO: Implement\n    return false;\n  }\n}",
  "description": "Implement a rate limiter that allows a maximum number of requests per user within a given time window.",
  "testCases": [
    {
      "name": "Basic usage",
      "input": "const limiter = new RateLimiter(2, 1000);\nconst result1 = limiter.allowRequest('user1', 0);",
      "expectedOutput": "true"
    }
  ]
}
```

### Response:

```json
{
  "success": true,
  "language": "javascript",
  "aiImplementation": "class RateLimiter {\n  constructor(limit, windowMs) {\n    this.limit = limit;\n    this.windowMs = windowMs;\n    this.requests = new Map();\n  }\n  allowRequest(userId, timestamp) {\n    if (!this.requests.has(userId)) {\n      this.requests.set(userId, []);\n    }\n    const userRequests = this.requests.get(userId);\n    const cutoff = timestamp - this.windowMs;\n    const filtered = userRequests.filter(t => t > cutoff);\n    this.requests.set(userId, filtered);\n    if (filtered.length < this.limit) {\n      filtered.push(timestamp);\n      return true;\n    }\n    return false;\n  }\n}",
  "testResults": {
    "totalTests": 5,
    "passedTests": 4,
    "failedTests": 1,
    "results": [
      {
        "testName": "Basic usage",
        "passed": true,
        "expected": "true",
        "actual": "true",
        "executionTimeMs": 12
      },
      {
        "testName": "Window reset",
        "passed": false,
        "expected": "true",
        "actual": "false",
        "error": "Expected true but got false. Your test expects the window to reset at 1100ms, but the limit is 1000ms. Check your test logic.",
        "executionTimeMs": 8
      }
    ]
  },
  "aiExplanation": "I implemented a sliding window rate limiter using a Map to store timestamps per user. The allowRequest method filters out old timestamps and checks if the count is below the limit."
}
```

## Implementation Steps

### Step 1: Backend Service

```java
// New file: TestValidationService.java

@Service
@Slf4j
public class TestValidationService {

    private final ClaudeService claudeService;
    private final TestRunnerService testRunnerService;
    private final DockerSandboxService dockerSandboxService;

    public TestValidationResponse validateTestsWithAI(TestValidationRequest request) {
        // 1. Generate AI implementation
        String aiPrompt = buildImplementationPrompt(
            request.getLanguage(),
            request.getTemplateCode(),
            request.getDescription(),
            request.getTestCases()
        );

        String aiImplementation = claudeService.generateImplementation(aiPrompt);

        // 2. Run tests against AI implementation
        List<TestCase> testCases = convertToTestCases(request.getTestCases());
        String testHarness = testRunnerService.generateTestHarness(
            request.getLanguage(),
            aiImplementation,
            testCases
        );

        DockerExecutionResult result = dockerSandboxService.execute(
            request.getLanguage(),
            testHarness
        );

        // 3. Parse results
        List<TestCaseResult> testResults = testRunnerService.parseResults(
            result.getStdout(),
            testCases
        );

        // 4. Generate explanation if tests fail
        String explanation = generateExplanation(testResults, aiImplementation);

        return TestValidationResponse.builder()
            .success(result.isSuccess())
            .language(request.getLanguage())
            .aiImplementation(aiImplementation)
            .testResults(testResults)
            .aiExplanation(explanation)
            .build();
    }

    private String buildImplementationPrompt(
        String language,
        String templateCode,
        String description,
        List<TestCaseDefinition> testCases
    ) {
        return String.format("""
            You are a senior software engineer. Implement the following problem:

            PROBLEM:
            %s

            TEMPLATE CODE:
            ```%s
            %s
            ```

            TEST CASES TO SATISFY:
            %s

            INSTRUCTIONS:
            1. Replace all TODO comments with working implementation
            2. Make all test cases pass
            3. Use simple, readable code
            4. Don't add extra methods or complexity
            5. Return ONLY the complete implementation code, no explanations

            IMPLEMENTATION:
            """,
            description,
            language,
            templateCode,
            formatTestCases(testCases)
        );
    }
}
```

### Step 2: Frontend Component

```typescript
// New component: TestValidationModal.tsx

export function TestValidationModal({
  questionData,
  onClose
}: TestValidationModalProps) {
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<TestValidationResponse | null>(null)
  const [editedImplementation, setEditedImplementation] = useState("")

  const handleValidate = async () => {
    setValidating(true)
    const response = await fetch(`${apiConfig.baseUrl}/code/validate-tests-with-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: questionData.primaryLanguage,
        templateCode: questionData.codeTemplates[questionData.primaryLanguage].code,
        description: questionData.description,
        testCases: questionData.tests
      })
    })

    const data = await response.json()
    setResult(data)
    setEditedImplementation(data.aiImplementation)
    setValidating(false)
  }

  const handleRetest = async () => {
    // Re-run tests with edited implementation
    setValidating(true)
    const response = await fetch(`${apiConfig.baseUrl}/code/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewId: -1, // Special validation mode
        language: questionData.primaryLanguage,
        code: editedImplementation
      })
    })

    const data = await response.json()
    setResult({ ...result, testResults: data.testDetails })
    setValidating(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Validation with AI</DialogTitle>
        </DialogHeader>

        {!result && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                AI will generate a working implementation and run your tests against it
                to verify they work correctly.
              </AlertDescription>
            </Alert>
            <Button onClick={handleValidate} disabled={validating}>
              {validating ? "Generating Implementation..." : "Validate Tests"}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Test Results Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Test Results</h3>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  {result.testResults.passedTests}/{result.testResults.totalTests}
                </div>
                <div className="text-sm text-muted-foreground">tests passed</div>
              </div>
            </Card>

            {/* AI Implementation */}
            <div>
              <h3 className="font-semibold mb-2">AI Generated Implementation</h3>
              <Editor
                height="300px"
                language={questionData.primaryLanguage}
                value={editedImplementation}
                onChange={(value) => setEditedImplementation(value || "")}
                theme="vs-dark"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can edit this implementation and re-run tests
              </p>
            </div>

            {/* Test Results Details */}
            <div>
              <h3 className="font-semibold mb-2">Test Details</h3>
              {result.testResults.results.map((test, idx) => (
                <Card key={idx} className="p-3 mb-2">
                  <div className="flex items-start gap-3">
                    {test.passed ? (
                      <CheckCircle2 className="size-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="size-5 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{test.testName}</h4>
                      {!test.passed && (
                        <div className="mt-2 text-sm">
                          <p>Expected: <code>{test.expected}</code></p>
                          <p>Actual: <code>{test.actual}</code></p>
                          {test.error && (
                            <p className="text-destructive mt-1">{test.error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleRetest} disabled={validating}>
                Re-run Tests
              </Button>
              <Button variant="outline" onClick={onClose}>
                {result.testResults.passedTests === result.testResults.totalTests
                  ? "Approve & Continue"
                  : "Close"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

### Step 3: Integration into Question Builder

```typescript
// In page.tsx, Step 4

{currentStep === 4 && (
  <>
    <StepTestCases data={questionData} onUpdate={updateQuestionData} />

    {/* Add validation button */}
    <div className="mt-6">
      <Button onClick={() => setShowTestValidation(true)}>
        🤖 Validate Tests with AI
      </Button>
    </div>

    {showTestValidation && (
      <TestValidationModal
        questionData={questionData}
        onClose={() => setShowTestValidation(false)}
      />
    )}
  </>
)}
```

## Cost Estimation

- **AI API call:** ~$0.01-0.05 per validation (depends on implementation size)
- **Docker execution:** negligible (existing infrastructure)
- **Frequency:** Only when question creator clicks "Validate"
- **Total:** ~$0.05-0.20 per question created (max 3-4 validations)

## Benefits

1. ✅ **Catches test bugs before publishing**
2. ✅ **Zero manual effort** - fully automated
3. ✅ **Educational** - shows working implementation
4. ✅ **Flexible** - user can edit and re-test
5. ✅ **Reuses existing infrastructure**
6. ✅ **No data pollution** - implementation discarded after validation

## Alternative: Lightweight Option

If you want to avoid AI costs initially, start with **Option 1 (AI only)** without user review:

- Click "Validate" → AI generates impl → Tests run → Show pass/fail
- No editing, no modal, just validation results
- Simpler UI, same validation benefit
- Can add user review later if needed

## Recommendation

Start with **Lightweight Option** → Add user review if needed → Implement full hybrid later

This gives you immediate value with minimal implementation effort.
