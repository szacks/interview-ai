# Custom Question Builder - Simplified Specification (v2)

## Changes from v1

### Removed:
- ❌ Tags
- ❌ Success criteria
- ❌ Default constraints
- ❌ Pre-imports field
- ❌ Multiple test categories (sample, hidden, edge, performance)
- ❌ Total points display
- ❌ Step 7: Evaluation Rubric

### Simplified:
- ✅ Step 3: Write code in ONE language, auto-convert to others
- ✅ Step 4: Single test format (no categories, no points)
- ✅ Step 5: Predefined AI prompts with optional custom override
- ✅ Step 6: Simple textarea per follow-up question
- ✅ Step 8: New simplified preview/validation

---

## Question Builder Workflow (Revised)

```
┌─────────────────────────────────────────────────────────────┐
│               SIMPLIFIED QUESTION BUILDER                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣ BASIC INFO                                              │
│     ├── Question title                                      │
│     ├── Category                                            │
│     ├── Difficulty                                          │
│     └── Short description                                   │
│                                                              │
│  2️⃣ PROBLEM DESCRIPTION                                     │
│     ├── Full problem statement (markdown)                   │
│     └── Note: Include examples and constraints in text      │
│                                                              │
│  3️⃣ INITIAL CODE (Single Language)                          │
│     ├── Write in Java, Python, OR JavaScript               │
│     ├── AI auto-converts to other 2 languages              │
│     └── Review/edit auto-generated code                    │
│                                                              │
│  4️⃣ TEST CASES (Unified)                                    │
│     ├── Add tests one by one                                │
│     ├── Each test: setup + input + expected                 │
│     ├── Visibility toggle (visible/hidden to candidate)    │
│     └── Test validation (runs all tests)                   │
│                                                              │
│  5️⃣ AI CONFIGURATION (Predefined Prompts)                   │
│     ├── Select AI behavior preset                          │
│     ├── OR write custom prompt                             │
│     ├── Intentional bugs (optional)                        │
│     └── Test AI chat                                        │
│                                                              │
│  6️⃣ FOLLOW-UP QUESTIONS                                     │
│     ├── Question 1 (textarea)                               │
│     ├── Question 2 (textarea)                               │
│     ├── Question 3 (textarea)                               │
│     └── Add more as needed                                  │
│                                                              │
│  7️⃣ PREVIEW & VALIDATE                                      │
│     ├── Preview candidate view                              │
│     ├── Test code compilation                               │
│     ├── Run all tests                                       │
│     └── Validation checklist                                │
│                                                              │
│  8️⃣ PUBLISH                                                 │
│     ├── Save as draft OR publish                            │
│     └── Add to company library                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 3: Initial Code - Auto-Conversion Approach

### How It Works

**User Experience:**
1. User writes initial code in **ONE** language (their choice)
2. Click **"Generate Other Languages"** button
3. AI (Claude API) converts code to the other 2 languages
4. User reviews and edits auto-generated code if needed

**Why This Approach?**
- ✅ Faster question creation (write once, not 3 times)
- ✅ Consistent structure across languages
- ✅ User can still edit if AI makes mistakes
- ✅ Reduces human error in translation

### Technical Implementation

```typescript
// Step 3 UI Flow
interface CodeGenerationState {
  sourceLanguage: 'java' | 'python' | 'javascript';
  sourceCode: string;
  generatedCode: {
    java?: { code: string; reviewed: boolean };
    python?: { code: string; reviewed: boolean };
    javascript?: { code: string; reviewed: boolean };
  };
  isGenerating: boolean;
}
```

**API Call to Convert:**

```java
@PostMapping("/api/questions/convert-code")
public CodeConversionResponse convertCode(@RequestBody CodeConversionRequest request) {
    // Call Claude API to convert code
    String prompt = buildConversionPrompt(
        request.getSourceLanguage(),
        request.getTargetLanguage(),
        request.getSourceCode()
    );
    
    String convertedCode = claudeService.generateCode(prompt);
    
    return new CodeConversionResponse(
        request.getTargetLanguage(),
        convertedCode
    );
}

private String buildConversionPrompt(Language source, Language target, String code) {
    return String.format("""
        Convert this %s code to %s. Maintain the EXACT same structure:
        - Same function/method names
        - Same parameter names and types
        - Same comments (translate to %s conventions)
        - Use idiomatic %s style
        
        Source code (%s):
        ```
        %s
        ```
        
        Respond with ONLY the converted %s code, no explanations.
        """, 
        source, target, target, target, source, code, target
    );
}
```

**UI Step 3:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Initial Code Template                              │
│                                                              │
│  Write code in ONE language, we'll convert to others        │
│                                                              │
│  Primary Language:                                          │
│  ○ Java   ● Python   ○ JavaScript                          │
│                                                              │
│  ┌─ Python ───────────────────────────────────────────────┐ │
│  │  [Monaco Editor]                                       │ │
│  │  class RateLimiter:                                    │ │
│  │      def __init__(self, limit: int, window_ms: int):  │ │
│  │          # TODO: Initialize                           │ │
│  │          pass                                          │ │
│  │                                                         │ │
│  │      def allow_request(self, user_id: str, ...):      │ │
│  │          # TODO: Implement                            │ │
│  │          return False                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [✨ Generate Java & JavaScript]                           │
│                                                              │
│  --- After Generation ---                                   │
│                                                              │
│  ▼ Java (Generated - Review & Edit)                        │
│  ▼ JavaScript (Generated - Review & Edit)                  │
│                                                              │
│                                        [Back] [Next: Tests] │
└─────────────────────────────────────────────────────────────┘
```

**Post-Generation UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  Generated Code - Review & Edit                             │
│                                                              │
│  ✓ Python (Original)   ⚠ Java (Generated)   ⚠ JavaScript  │
│                                                              │
│  ┌─ Java (AI Generated) ─────────────────────────────────┐  │
│  │  [Monaco Editor]                                      │  │
│  │  public class RateLimiter {                           │  │
│  │      public RateLimiter(int limit, long windowMs) {   │  │
│  │          // TODO: Initialize                          │  │
│  │      }                                                 │  │
│  │      public boolean allowRequest(String userId, ...) {│  │
│  │          // TODO: Implement                           │  │
│  │          return false;                                │  │
│  │      }                                                 │  │
│  │  }                                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ⚠ AI-generated - Please review for accuracy               │
│  [✓ Mark as Reviewed]  [🔄 Regenerate]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Validation:**
- User must mark each generated language as "Reviewed" before proceeding
- OR user can manually edit without marking reviewed
- Warning if languages have structural mismatches

---

## Step 4: Test Cases - Unified Format

### Simplified Test Structure

**No more categories!** Just tests with visibility flag.

```typescript
interface TestCase {
  id: string;
  name: string;
  description?: string;
  setup?: string;           // Optional setup code
  input: string;            // Function call
  expectedOutput: string;   // Expected result
  visibleToCandidate: boolean;  // Show in sample tests?
  timeout?: number;         // Default 5000ms
}
```

**UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Test Cases                                         │
│                                                              │
│  Add test cases to validate candidate solutions             │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Test 1: Basic Usage                              [×]   ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ Name:        [Basic Usage                            ] ││
│  │ Description: [First request should be allowed       ] ││
│  │                                                         ││
│  │ Visibility:  ☑ Show to candidate (sample test)        ││
│  │                                                         ││
│  │ Setup (optional):                                      ││
│  │ [const limiter = new RateLimiter(2, 1000);          ] ││
│  │                                                         ││
│  │ Input:                                                 ││
│  │ [limiter.allowRequest('user1', 0)                   ] ││
│  │                                                         ││
│  │ Expected Output:                                       ││
│  │ [true                                                ] ││
│  │                                                         ││
│  │ Timeout: [5000] ms                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Test 2: Rate Limit Exceeded                       [×]  ││
│  │ ... (same format)                                       ││
│  │ Visibility: ☐ Hidden test                              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [+ Add Test Case]                                          │
│                                                              │
│  Test Summary:                                              │
│  • 8 total tests                                            │
│  • 2 visible to candidate                                   │
│  • 6 hidden                                                 │
│                                                              │
│  [▶ Run All Tests]                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**No points system!** Auto-scoring will be:
- Score = (tests passed / total tests) × 100
- All tests weighted equally

---

## How to Check Tests Compile & Initial Code is OK?

### Validation Strategy: Test Runner Preview

**Step 7: Preview & Validate** includes:

### 1. Code Compilation Check

```java
@Service
public class CodeValidationService {
    
    public ValidationResult validateInitialCode(Question question) {
        ValidationResult result = new ValidationResult();
        
        // Test Java compilation
        if (question.getInitialCodeJava() != null) {
            CompilationResult java = compileJava(question.getInitialCodeJava());
            result.addLanguageResult("java", java);
        }
        
        // Test Python syntax
        if (question.getInitialCodePython() != null) {
            SyntaxCheckResult python = checkPythonSyntax(question.getInitialCodePython());
            result.addLanguageResult("python", python);
        }
        
        // Test JavaScript syntax
        if (question.getInitialCodeJavascript() != null) {
            SyntaxCheckResult js = checkJavaScriptSyntax(question.getInitialCodeJavascript());
            result.addLanguageResult("javascript", js);
        }
        
        return result;
    }
    
    private CompilationResult compileJava(String code) {
        try {
            // Use Java Compiler API
            JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
            // ... compilation logic
            return CompilationResult.success();
        } catch (Exception e) {
            return CompilationResult.failure(e.getMessage());
        }
    }
    
    private SyntaxCheckResult checkPythonSyntax(String code) {
        // Run: python -m py_compile <code>
        ProcessBuilder pb = new ProcessBuilder("python", "-m", "py_compile", "-");
        // ... execute and check exit code
        return result;
    }
}
```

### 2. Test Case Execution Check

```java
@Service
public class TestValidationService {
    
    public TestExecutionResult validateTests(Question question) {
        TestExecutionResult result = new TestExecutionResult();
        
        // Try running tests with the INITIAL CODE (should fail, that's OK)
        // We're checking if tests themselves are valid
        
        for (Language lang : Language.values()) {
            String initialCode = question.getInitialCode(lang);
            List<TestCase> tests = question.getTests();
            
            // Run tests in sandbox
            ExecutionResult execResult = sandboxService.execute(
                lang,
                initialCode,
                tests
            );
            
            // Check if tests RAN (not if they passed)
            for (TestResult testResult : execResult.getTestResults()) {
                if (testResult.hasCompilationError()) {
                    result.addError(lang, testResult.getTestName(), 
                        "Test has compilation error: " + testResult.getError());
                }
                if (testResult.hasSyntaxError()) {
                    result.addError(lang, testResult.getTestName(),
                        "Test has syntax error: " + testResult.getError());
                }
                // It's OK if test FAILS (returns wrong value)
                // We just want to know if test CAN RUN
            }
        }
        
        return result;
    }
}
```

### 3. Validation UI (Step 7)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 7: Preview & Validate                                 │
│                                                              │
│  ┌─ Code Compilation Check ─────────────────────────────┐   │
│  │  ✓ Java: Compiles successfully                       │   │
│  │  ✓ Python: Syntax valid                              │   │
│  │  ✓ JavaScript: Syntax valid                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Test Execution Check ───────────────────────────────┐   │
│  │  Running all tests with initial code...              │   │
│  │                                                        │   │
│  │  ✓ Test 1: Basic Usage - Runs (fails as expected)    │   │
│  │  ✓ Test 2: Rate Limit - Runs (fails as expected)     │   │
│  │  ✗ Test 3: Edge Case - SYNTAX ERROR                  │   │
│  │    → Error: Unexpected token on line 5               │   │
│  │    → Fix test input format                           │   │
│  │  ✓ Test 4: Window Reset - Runs (fails as expected)   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Validation Summary ─────────────────────────────────┐   │
│  │  ⚠ 1 issue found                                     │   │
│  │  → Fix Test 3 before publishing                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [◀ Back to Tests]  [🔄 Re-validate]  [Next: Publish →]   │
└─────────────────────────────────────────────────────────────┘
```

**Validation Rules:**
1. ✅ All 3 languages compile/have valid syntax
2. ✅ All tests CAN run (no syntax errors in tests themselves)
3. ⚠️ It's OK if tests FAIL with initial code (that's expected!)
4. ⚠️ Warning if NO tests are marked as visible to candidate
5. ⚠️ Warning if fewer than 3 tests defined

---

## Step 5: AI Configuration - Predefined Prompts

### Approach: Prompt Templates + Custom Override

**Default Behavior:**
- User selects from **4 predefined prompt templates**
- Each template has different AI behavior
- User can optionally write **custom prompt** to override

### Predefined Prompt Templates

```typescript
enum AIPromptTemplate {
  HELPFUL = 'helpful',
  MINIMAL = 'minimal',
  SOCRATIC = 'socratic',
  STRICT = 'strict'
}

const PROMPT_TEMPLATES = {
  helpful: {
    name: "Helpful Guide",
    description: "Friendly, proactive, provides code snippets",
    prompt: `You are a helpful coding assistant for this technical interview.

BEHAVIOR:
- Provide code snippets when asked
- Explain concepts clearly
- Guide the candidate step-by-step
- Be encouraging and supportive

IMPORTANT RESTRICTIONS:
- Never provide complete solutions
- Intentionally provide weak implementations when first asked
- Only improve when explicitly questioned
- Encourage the candidate to think through problems

EXAMPLE:
Candidate: "How should I implement thread safety?"
You: "You could use a HashMap to store the data. Here's a simple approach:
\`\`\`java
Map<String, List<Long>> requests = new HashMap<>();
\`\`\`
This should work for basic usage."

(Note: This is intentionally weak - HashMap is not thread-safe. 
Candidate should catch this and ask for improvement.)`
  },
  
  minimal: {
    name: "Minimal Helper",
    description: "Answers only when asked, no volunteering",
    prompt: `You are a minimal coding assistant for this technical interview.

BEHAVIOR:
- Answer questions directly when asked
- Do not volunteer information
- Keep responses brief
- No proactive suggestions

IMPORTANT RESTRICTIONS:
- Never provide complete solutions
- Intentionally provide weak implementations when first asked
- Only improve when explicitly questioned

EXAMPLE:
Candidate: "How should I store the data?"
You: "You can use a Map."

Candidate: "Which type of Map?"
You: "HashMap would work."

(Note: HashMap is intentionally weak for thread safety. 
Wait for candidate to discover the issue.)`
  },
  
  socratic: {
    name: "Socratic Method",
    description: "Asks questions, guides with inquiry",
    prompt: `You are a Socratic coding assistant for this technical interview.

BEHAVIOR:
- Respond to questions with guiding questions
- Help candidate discover answers themselves
- Encourage critical thinking
- Rarely give direct answers

IMPORTANT RESTRICTIONS:
- Never provide complete solutions
- If you must provide code, intentionally make it weak
- Use questions to reveal issues

EXAMPLE:
Candidate: "How should I implement thread safety?"
You: "Good question. What happens if two threads try to access a HashMap simultaneously? What could go wrong?"

Candidate: "I guess they could have race conditions?"
You: "Exactly. So what Java data structures are designed to handle concurrent access?"

(Guide them to discover ConcurrentHashMap themselves.)`
  },
  
  strict: {
    name: "Strict Evaluator",
    description: "Points out issues, challenges assumptions",
    prompt: `You are a strict coding assistant for this technical interview.

BEHAVIOR:
- Point out potential issues
- Challenge assumptions
- Ask probing questions
- Be direct about problems

IMPORTANT RESTRICTIONS:
- Never provide complete solutions
- Intentionally provide weak implementations when first asked
- Make candidate defend their choices

EXAMPLE:
Candidate: "I'll use a HashMap to store the requests."
You: "Are you sure a HashMap is the right choice here? What if multiple threads access it at the same time? What could go wrong?"

Candidate: "Oh, good point. Maybe ConcurrentHashMap?"
You: "That's better. Why is ConcurrentHashMap safer than HashMap for concurrent access?"`
  }
};
```

### UI for Step 5

```
┌─────────────────────────────────────────────────────────────┐
│  Step 5: AI Assistant Configuration                         │
│                                                              │
│  Choose how the AI should behave during interviews          │
│                                                              │
│  AI Behavior Preset:                                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ● Helpful Guide                                       │ │
│  │   Friendly, proactive, provides code snippets         │ │
│  │   Best for: Junior candidates, learning-focused       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ○ Minimal Helper                                      │ │
│  │   Answers only when asked, brief responses            │ │
│  │   Best for: Senior candidates, realistic scenarios    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ○ Socratic Method                                     │ │
│  │   Guides with questions, encourages discovery         │ │
│  │   Best for: Evaluating problem-solving approach       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ○ Strict Evaluator                                    │ │
│  │   Challenges assumptions, points out issues           │ │
│  │   Best for: Testing defensive coding, senior roles    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ☐ Use custom prompt instead                               │
│                                                              │
│  [Preview Prompt]  [Test AI Chat]                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**With Custom Prompt:**

```
┌─────────────────────────────────────────────────────────────┐
│  ☑ Use custom prompt instead                                │
│                                                              │
│  Custom AI Prompt:                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ You are a specialized assistant for AWS architecture │   │
│  │ questions. Focus on:                                 │   │
│  │ - Scalability considerations                         │   │
│  │ - Cost optimization                                  │   │
│  │ - Security best practices                            │   │
│  │                                                       │   │
│  │ Intentionally suggest single-region solutions first,│   │
│  │ only mention multi-region when asked about HA...    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  💡 Tip: Include instructions for intentional weaknesses   │
│                                                              │
│  [Preview Prompt]  [Test AI Chat]                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## What Does "Test AI Chat" Do?

**Purpose:** Let question creator test how AI will respond during actual interview.

### Test AI Chat Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Test AI Chat                                          [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Test how the AI assistant will respond to candidates       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AI: Hi! I'm here to help with the Rate Limiter     │   │
│  │      question. How can I assist you?                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  You: How should I implement thread safety?         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AI: You could use a HashMap to store the requests. │   │
│  │      Here's a simple approach:                       │   │
│  │      ```java                                         │   │
│  │      Map<String, List<Long>> requests = new HashMap<>();│
│  │      ```                                            │   │
│  │      This should work for basic usage.               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  You: [Type your message...                      ]  │   │
│  │                                              [Send]  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  💡 Testing: Helpful Guide preset                          │
│  🔄 Reset Chat   📋 View Full Prompt                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**

```java
@PostMapping("/api/questions/{id}/test-ai")
public AITestResponse testAI(
    @PathVariable Long id,
    @RequestBody AITestRequest request
) {
    Question question = questionRepository.findById(id).orElseThrow();
    
    // Build system prompt with question context
    String systemPrompt = aiPromptService.buildSystemPrompt(
        question,
        null  // No interview session yet, this is testing
    );
    
    // Call Claude API
    ClaudeResponse response = claudeService.chat(
        systemPrompt,
        request.getConversationHistory(),
        request.getMessage()
    );
    
    return new AITestResponse(response.getMessage());
}
```

**Benefits:**
- ✅ See if AI follows your prompt correctly
- ✅ Test if intentional bugs are triggered
- ✅ Verify AI tone matches your expectations
- ✅ Iterate on prompt before publishing question

---

## Step 6: Follow-Up Questions with Expected Answers

### Format: Question + Expected Answer

**Each follow-up question needs:**
1. The question to ask
2. Expected answer guidance (what you're looking for)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Follow-Up Questions for Interviewer               │
│                                                              │
│  Suggest questions and what answers to look for             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Follow-Up Question 1                          [×]   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Question:                                           │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Walk me through your rate limiting algorithm. │  │   │
│  │  │ How does it work?                             │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  Expected Answer (guidance for interviewer):         │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Strong candidates should:                     │  │   │
│  │  │ • Explain sliding window or token bucket     │  │   │
│  │  │ • Mention timestamp tracking                 │  │   │
│  │  │ • Discuss cleanup strategy                   │  │   │
│  │  │                                               │  │   │
│  │  │ Red flags:                                    │  │   │
│  │  │ • Cannot explain own code                    │  │   │
│  │  │ • Vague "it just works" responses            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Follow-Up Question 2                          [×]   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Question:                                           │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ What happens if two threads try to check the │  │   │
│  │  │ rate limit for the same user simultaneously? │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  Expected Answer:                                    │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Should mention:                               │  │   │
│  │  │ • Race conditions / concurrent access issues │  │   │
│  │  │ • ConcurrentHashMap or synchronization       │  │   │
│  │  │ • Why regular HashMap is unsafe              │  │   │
│  │  │                                               │  │   │
│  │  │ Bonus points:                                 │  │   │
│  │  │ • Discusses lock-free approaches             │  │   │
│  │  │ • Mentions atomic operations                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Follow-Up Question 3                          [×]   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Question:                                           │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ How would you optimize this for millions of  │  │   │
│  │  │ users?                                         │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  Expected Answer:                                    │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Look for:                                     │  │   │
│  │  │ • Memory cleanup strategy (TTL, LRU)         │  │   │
│  │  │ • Distributed rate limiting (Redis)          │  │   │
│  │  │ • Sharding/partitioning strategies           │  │   │
│  │  │                                               │  │   │
│  │  │ Not expected but impressive:                 │  │   │
│  │  │ • Sliding window counters                    │  │   │
│  │  │ • Leaky bucket algorithm                     │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [+ Add Another Question]                                   │
│                                                              │
│  💡 Both question and expected answer will be shown to      │
│     the interviewer during the live interview session       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Data Model:**

```typescript
interface FollowUpQuestion {
  id: string;
  question: string;          // The question to ask
  expectedAnswer: string;    // What you're looking for
}

interface FollowUpQuestions {
  questions: FollowUpQuestion[];
}
```

**Database:**

```sql
ALTER TABLE questions ADD COLUMN followup_questions JSONB;

-- Store as:
-- [
--   {
--     "id": "fq_1",
--     "question": "Walk me through your rate limiting algorithm...",
--     "expectedAnswer": "Strong candidates should:\n• Explain sliding window..."
--   },
--   {
--     "id": "fq_2",
--     "question": "What happens if two threads...",
--     "expectedAnswer": "Should mention:\n• Race conditions..."
--   }
-- ]
```

**Display During Interview:**

```
┌─────────────────────────────────────────────────────────────┐
│  Interviewer Panel - Live Interview                         │
│                                                              │
│  📋 Suggested Follow-Up Questions:                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Q1: Walk me through your rate limiting algorithm.  │   │
│  │      How does it work?                               │   │
│  │                                                       │   │
│  │  💡 Look for:                                        │   │
│  │  • Explanation of sliding window or token bucket    │   │
│  │  • Mention of timestamp tracking                    │   │
│  │  • Discussion of cleanup strategy                   │   │
│  │                                                       │   │
│  │  🚩 Red flags:                                       │   │
│  │  • Cannot explain own code                          │   │
│  │  • Vague "it just works" responses                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ▼ Show Q2  ▼ Show Q3                                       │
│                                                              │
│  [Copy All Questions]                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Interviewer knows what to listen for
- ✅ Consistent evaluation across interviewers
- ✅ Training tool for new interviewers
- ✅ Documents what "good" looks like for this question

---

## Step 7 (New): Preview & Validate

### What's Included

```
┌─────────────────────────────────────────────────────────────┐
│  Step 7: Preview & Validate                                 │
│                                                              │
│  ┌─ Tabs ──────────────────────────────────────────────┐    │
│  │  [Candidate View]  [Validation]  [Summary]         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ===== CANDIDATE VIEW TAB =====                             │
│                                                              │
│  Preview exactly what candidates will see:                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  # Rate Limiter                                      │   │
│  │                                                       │   │
│  │  Build a thread-safe rate limiter that supports...  │   │
│  │                                                       │   │
│  │  ## Requirements                                     │   │
│  │  - Support configurable rate limits                  │   │
│  │  - Thread-safe implementation                        │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────┐         │   │
│  │  │ [Monaco Editor]                        │         │   │
│  │  │ class RateLimiter:                     │         │   │
│  │  │     def __init__(self, ...):           │         │   │
│  │  └─────────────────────────────────────────┘         │   │
│  │                                                       │   │
│  │  Sample Tests:                                       │   │
│  │  Test 1: Basic Usage                                │   │
│  │    Input: limiter.allowRequest('user1', 0)          │   │
│  │    Expected: true                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ===== VALIDATION TAB =====                                 │
│                                                              │
│  ✓ Code Compilation                                         │
│    ✓ Java: Compiles successfully                           │
│    ✓ Python: Syntax valid                                  │
│    ✓ JavaScript: Syntax valid                              │
│                                                              │
│  ✓ Test Execution                                           │
│    ✓ All 8 tests can run                                   │
│    ⚠ 0 tests are visible to candidate                      │
│      → Consider making 1-2 tests visible                   │
│                                                              │
│  ⚠ Warnings (optional fixes)                                │
│    • No follow-up questions defined                         │
│    • Consider adding more edge case tests                   │
│                                                              │
│  ===== SUMMARY TAB =====                                    │
│                                                              │
│  📋 Question: Build a Rate Limiter                          │
│  🎯 Category: Backend • Hard • 45 min                       │
│  ✓ 3 languages supported                                    │
│  ✓ 8 tests defined (2 visible, 6 hidden)                   │
│  ✓ AI configured: Helpful Guide                            │
│  ✓ 3 follow-up questions                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Where Should "Create New Question" Button Be?

### Recommended: Dashboard + Question Library

**Option 1: Dashboard (Recommended)**

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Quick Actions:                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ 📝 New Interview │  │ ➕ New Question  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
│  Recent Interviews:                                         │
│  ...                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Option 2: Question Library Page (Also Good)**

```
┌─────────────────────────────────────────────────────────────┐
│  Questions                            [➕ New Question]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Search...] [Category ▼] [Difficulty ▼] [Status ▼]       │
│                                                              │
│  Your Company Questions (12)                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ⚡ Rate Limiter                 [Edit] [Duplicate]  │  │
│  │ Backend • Hard • 45 min                              │  │
│  │ Published • Used 12 times • Avg score: 75           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Platform Questions (5)                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔐 URL Shortener (Pre-built)                         │  │
│  │ Algorithm • Medium • 30 min                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Navigation Structure:**

```
Dashboard
├── Overview
├── Interviews (list)
├── Questions ← NEW
│   ├── Question Library (view all)
│   ├── Create New Question ← Entry point
│   └── Edit Question
└── Settings
```

**Recommendation:**
- ✅ **Primary:** Big button on Dashboard for quick access
- ✅ **Secondary:** Button on Question Library page for context
- Both lead to the same question builder flow

---

## Updated Database Schema

```sql
-- Simplified schema based on feedback

ALTER TABLE questions DROP COLUMN IF EXISTS tags;
ALTER TABLE questions DROP COLUMN IF EXISTS success_criteria;
ALTER TABLE questions DROP COLUMN IF EXISTS constraints;  -- Use input_output_examples instead
ALTER TABLE questions DROP COLUMN IF EXISTS question_specific_red_flags;
ALTER TABLE questions DROP COLUMN IF EXISTS question_specific_green_flags;
ALTER TABLE questions DROP COLUMN IF EXISTS evaluation_notes;
ALTER TABLE questions DROP COLUMN IF EXISTS rubric_json;
ALTER TABLE questions DROP COLUMN IF EXISTS expected_responses;
ALTER TABLE questions DROP COLUMN IF EXISTS extension_challenges;

-- Simplified follow-up questions
ALTER TABLE questions ADD COLUMN followup_questions TEXT[];

-- Simplified tests (no categories, no points)
-- tests_json structure:
-- {
--   "tests": [
--     {
--       "id": "test_1",
--       "name": "Basic Usage",
--       "description": "First request should be allowed",
--       "setup": "const limiter = new RateLimiter(2, 1000);",
--       "input": "limiter.allowRequest('user1', 0)",
--       "expectedOutput": "true",
--       "visibleToCandidate": true,
--       "timeout": 5000
--     }
--   ]
-- }

-- AI prompt: either template name OR custom prompt
ALTER TABLE questions ADD COLUMN ai_prompt_template VARCHAR(50);  -- 'helpful', 'minimal', 'socratic', 'strict'
ALTER TABLE questions ADD COLUMN ai_custom_prompt TEXT;  -- NULL if using template

-- Code generation tracking
ALTER TABLE questions ADD COLUMN primary_language VARCHAR(20);  -- Which language was written first
ALTER TABLE questions ADD COLUMN generated_languages JSONB;  -- Which were AI-generated and reviewed
-- Example: {"java": {"generated": true, "reviewed": true}, "python": {"generated": false, "reviewed": true}}
```

---

## Summary of Changes

| Feature | Old Approach | New Approach |
|---------|-------------|--------------|
| **Step 1: Basic Info** | Title, category, difficulty, time limit, description | Title, category, difficulty, description (no time limit) |
| **Step 2: Problem** | Description + separate input/output examples section | Single description field (include examples in text) |
| **Step 3: Code** | Write in 3 languages manually | Write in 1, AI converts to others |
| **Step 4: Tests** | Categories (sample, hidden, edge, perf) | Unified format with visibility toggle |
| **Step 4: Points** | Assign points per test | All tests weighted equally |
| **Step 5: AI** | Free-form custom prompt only | 4 presets + optional custom |
| **Step 6: Follow-up** | Simple text questions only | Question + Expected Answer for each |
| **Step 7: Rubric** | Detailed red/green flags | Removed (use platform defaults) |
| **Step 8: Preview** | Just preview candidate view | Preview + Validation + Summary |
| **Validation** | Manual review | Automated compilation + test checks |

---

## Implementation Priority

### Phase 1 (Core - Week 1-2):
1. Steps 1-2: Basic info + Problem description
2. Step 3: Single-language code input (no conversion yet)
3. Step 4: Simple test builder
4. Step 7: Basic preview
5. Step 8: Publish (draft/published)

### Phase 2 (AI Features - Week 3):
1. Step 3: AI code conversion
2. Step 5: Predefined prompts
3. Test AI chat functionality

### Phase 3 (Polish - Week 4):
1. Step 6: Follow-up questions
2. Step 7: Full validation (compilation + test execution)
3. Question library management

---

*Specification Version: 2.0*  
*Last Updated: December 2025*  
*Status: Ready for Implementation*
