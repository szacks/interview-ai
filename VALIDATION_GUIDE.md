# Question Builder Validation Guide

## Problem Statement

**Question:** How can we validate code templates and test cases in Steps 3 & 4 of the question builder?

**Challenge:** Template code contains only function signatures (no implementation), and test cases are free-form text (not structured operations).

---

## What Can Be Validated ✅

### 1. **Template Code Syntax Validation** (IMPLEMENTED)
- ✅ Check if template code compiles
- ✅ Validate syntax errors
- ✅ Ensure class/method signatures are correct
- ✅ Works for Java, Python, JavaScript

**How it works:**
- Wraps template in minimal validation harness
- Compiles in Docker sandbox
- Returns compilation errors if any

**Implementation:**
- Backend: `/api/code/validate-syntax` endpoint
- Frontend: `validationService.ts`
- UI Component: `validation-panel.tsx`

### 2. **Test Case Structure Validation** (IMPLEMENTED)
- ✅ Validates test case has required fields (name, input, expectedOutput)
- ✅ Ensures at least 1 test case exists
- ✅ Client-side validation

**Implementation:**
- Already exists in `page.tsx` lines 164-173
- Can be enhanced with `validateTestCaseStructure()` from `validationService.ts`

---

## What CANNOT Be Validated ❌

### 1. **Test Execution**
- ❌ Cannot run tests without actual implementation
- ❌ Cannot verify expected outputs are correct
- ❌ Cannot validate test logic

**Why?** Template code has no implementation (just TODOs), so tests cannot execute.

### 2. **Test Case Operations**
- ❌ Frontend stores test cases as free-form text (`input`, `expectedOutput`)
- ❌ Backend needs structured JSON (`operationsJson`, `assertionsJson`)
- ❌ There's a **mapping gap** between frontend and backend test formats

**Example of the gap:**

Frontend (Step 4):
```typescript
{
  name: "Basic Usage",
  input: "limiter.allowRequest('user1', 0)",
  expectedOutput: "true"
}
```

Backend needs:
```json
{
  "operationsJson": [
    {"type": "create", "class": "RateLimiter", "var": "limiter", "args": [2, 1000]},
    {"type": "call", "var": "limiter", "method": "allowRequest", "args": ["user1", 0], "store": "result1"}
  ],
  "assertionsJson": {
    "result1": true
  }
}
```

---

## Implementation Guide

### Step 1: Add Validation to Question Builder

Add the validation panel to Step 3 or create a new validation step:

```typescript
// In frontend/app/questions/new/page.tsx

import { ValidationPanel } from "@/components/question-builder/validation-panel"

// Add to step 3 or create a new validation step
{currentStep === 3 && (
  <>
    <StepInitialCode data={questionData} onUpdate={updateQuestionData} />

    {/* Add validation panel after code generation */}
    {Object.values(questionData.codeTemplates).some((t) => t.generated) && (
      <div className="mt-6">
        <ValidationPanel questionData={questionData} />
      </div>
    )}
  </>
)}
```

### Step 2: Test the Validation

1. Create a question with template code
2. Click "Generate Languages" to convert code
3. Click "Validate Templates"
4. See compilation results for each language

### Step 3: Handle Validation Results

The validation panel will show:
- ✅ Green check if template compiles
- ❌ Red X with error details if compilation fails
- ⚠️ Warnings if any

---

## Future Enhancements

### Option 1: Structured Test Builder (Recommended)

Replace free-form test case input with a visual builder:

**UI Mockup:**
```
Test Case Builder
-----------------
Step 1: Create instance
  Class: [RateLimiter ▼]
  Variable name: [limiter]
  Arguments: [2, 1000]

Step 2: Call method
  Variable: [limiter ▼]
  Method: [allowRequest ▼]
  Arguments: ['user1', 0]
  Store result as: [result1]

Step 3: Assert
  Variable: [result1 ▼]
  Expected value: [true]

[+ Add Step]
```

This would:
- ✅ Generate proper `operationsJson` and `assertionsJson`
- ✅ Enable actual test execution during validation
- ✅ Provide better UX than free-form text

### Option 2: AI-Powered Test Parsing

Use AI to parse free-form test cases into structured JSON:
- Input: `limiter.allowRequest('user1', 0) should return true`
- Output: Structured operations + assertions JSON

Pros:
- ✅ Keeps simple UX
- ✅ No UI changes needed

Cons:
- ❌ Error-prone
- ❌ Requires AI API calls
- ❌ Harder to debug

### Option 3: Sample Implementation Validator

Allow question creators to provide a sample implementation for validation:

```typescript
interface QuestionData {
  // ... existing fields
  sampleImplementation?: {
    java?: string
    python?: string
    javascript?: string
  }
}
```

Then validation can:
1. Compile template + sample implementation
2. Run tests against sample implementation
3. Verify tests pass/fail as expected

---

## API Reference

### POST `/api/code/validate-syntax`

**Request:**
```json
{
  "language": "java|python|javascript",
  "code": "class RateLimiter { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "language": "java",
  "errors": null,
  "warnings": null
}
```

**Error Response:**
```json
{
  "success": false,
  "language": "java",
  "errors": "Solution.java:5: error: cannot find symbol\n    Map<String, List> requests = new HashMap<>();\n    ^",
  "warnings": null
}
```

---

## Files Created/Modified

### New Files:
1. `frontend/services/validationService.ts` - Validation API client
2. `frontend/components/question-builder/validation-panel.tsx` - Validation UI
3. `backend/src/main/java/com/example/interviewAI/dto/ValidationRequest.java` - Request DTO
4. `VALIDATION_GUIDE.md` - This guide

### Modified Files:
1. `backend/src/main/java/com/example/interviewAI/dto/ValidationResponse.java` - Added validation fields
2. `backend/src/main/java/com/example/interviewAI/controller/CodeController.java` - Added `/validate-syntax` endpoint

---

## Summary

**What works now:**
- ✅ Template code compilation validation
- ✅ Test case structure validation
- ✅ Syntax error detection for all languages

**What doesn't work:**
- ❌ Test execution validation (requires implementation)
- ❌ Free-form test cases → structured JSON conversion

**Recommendation:**
Use the template validation for now. For better test validation, implement a structured test builder (Option 1 above) in a future update.
