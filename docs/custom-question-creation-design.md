# Custom Question Creation Feature - Design Document

## Table of Contents
1. [Feature Overview](#feature-overview)
2. [Data Model Changes](#data-model-changes)
3. [Configuration Fields](#configuration-fields)
4. [UI/UX Design](#uiux-design)
5. [API Endpoints](#api-endpoints)
6. [Additional Features](#additional-features)
7. [Implementation Phases](#implementation-phases)
8. [Security & Permissions](#security--permissions)

---

## Feature Overview

### Purpose
Enable companies to create, manage, and customize their own interview questions with full control over:
- Question content and difficulty
- Initial code templates for multiple languages
- Test cases and validation logic
- AI interviewer behavior and prompts
- Scoring rubrics and evaluation criteria
- Follow-up questions and conversation flow

### Key Benefits
- **Customization**: Companies can tailor questions to their specific tech stack and requirements
- **Scalability**: Build a library of questions for different roles and seniority levels
- **Flexibility**: Adjust AI interviewer behavior to match company interview philosophy
- **Reusability**: Share questions across teams or keep them private
- **Analytics**: Track question performance and candidate success rates

---

## Data Model Changes

### 1. Enhanced Question Entity

**New Fields to Add:**
```java
@Entity
@Table(name = "questions")
public class Question {
    // Existing fields...

    // NEW: Company & Ownership
    @Column(name = "company_id")
    private Long companyId;  // null = platform question, non-null = company-specific

    @Column(name = "created_by_user_id")
    private Long createdByUserId;  // User who created this question

    @Column(name = "is_public")
    private Boolean isPublic;  // true = shareable, false = private to company

    @Column(name = "is_template")
    private Boolean isTemplate;  // true = starter template, false = regular question

    @Column(name = "parent_question_id")
    private Long parentQuestionId;  // For questions cloned from templates

    // NEW: Categorization & Organization
    @Column(name = "category")
    private String category;  // "algorithms", "system-design", "debugging", "api-design", etc.

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;  // JSON array: ["react", "frontend", "optimization"]

    @Column(name = "role_level")
    private String roleLevel;  // "junior", "mid", "senior", "staff", "principal"

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;  // Expected completion time

    // NEW: AI Prompt Customization
    @Column(name = "ai_system_prompt", columnDefinition = "TEXT")
    private String aiSystemPrompt;  // Custom system prompt for AI interviewer

    @Column(name = "ai_behavior_guidelines", columnDefinition = "TEXT")
    private String aiBehaviorGuidelines;  // JSON: specific do's and don'ts for AI

    @Column(name = "ai_hint_strategy")
    private String aiHintStrategy;  // "minimal", "moderate", "generous", "socratic"

    @Column(name = "ai_focus_areas", columnDefinition = "TEXT")
    private String aiFocusAreas;  // JSON: ["edge-cases", "optimization", "testing", etc.]

    // NEW: Advanced Configuration
    @Column(name = "code_execution_enabled")
    private Boolean codeExecutionEnabled;  // Enable/disable code running

    @Column(name = "allowed_resources", columnDefinition = "TEXT")
    private String allowedResources;  // JSON: {"docs": true, "stackoverflow": false, "google": true}

    @Column(name = "evaluation_criteria_json", columnDefinition = "TEXT")
    private String evaluationCriteriaJson;  // Detailed criteria beyond basic rubric

    @Column(name = "grading_weights_json", columnDefinition = "TEXT")
    private String gradingWeightsJson;  // Custom weights for scoring categories

    // NEW: Metadata & Analytics
    @Column(name = "times_used")
    private Integer timesUsed;  // How many interviews used this question

    @Column(name = "average_score")
    private Double averageScore;  // Average candidate performance

    @Column(name = "average_completion_time_minutes")
    private Double averageCompletionTimeMinutes;

    @Column(name = "pass_rate")
    private Double passRate;  // Percentage of candidates who passed

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "version")
    private Integer version;  // Version number for tracking changes

    @Column(name = "status")
    private String status;  // "draft", "active", "archived", "under_review"

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Existing fields remain the same...
}
```

### 2. New Entity: QuestionVersion (Change History)

```java
@Entity
@Table(name = "question_versions")
public class QuestionVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "changed_by_user_id")
    private Long changedByUserId;

    @Column(name = "change_summary", columnDefinition = "TEXT")
    private String changeSummary;  // What changed in this version

    @Column(name = "question_snapshot", columnDefinition = "TEXT")
    private String questionSnapshot;  // JSON snapshot of entire question

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### 3. New Entity: QuestionTemplate

```java
@Entity
@Table(name = "question_templates")
public class QuestionTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;  // "Algorithm Problem", "System Design", "Bug Fix", etc.

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    private String category;

    @Column(name = "icon")
    private String icon;  // Icon identifier for UI

    @Column(name = "template_config", columnDefinition = "TEXT")
    private String templateConfig;  // JSON with default structure

    @Column(name = "is_system_template")
    private Boolean isSystemTemplate;  // Platform-provided vs user-created

    @Column(name = "times_used")
    private Integer timesUsed;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### 4. New Entity: AiPromptPreset

```java
@Entity
@Table(name = "ai_prompt_presets")
public class AiPromptPreset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;  // "Socratic Method", "Direct Helper", "Minimal Hints", etc.

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "system_prompt", columnDefinition = "TEXT")
    private String systemPrompt;

    @Column(name = "behavior_guidelines", columnDefinition = "TEXT")
    private String behaviorGuidelines;

    @Column(name = "hint_strategy")
    private String hintStrategy;

    @Column(name = "company_id")
    private Long companyId;  // null = platform preset, non-null = company-specific

    @Column(name = "is_public")
    private Boolean isPublic;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

---

## Configuration Fields

### Core Question Configuration

#### 1. Basic Information
```json
{
  "title": "string (required, unique per company)",
  "description": "text (required) - Rich text with markdown support",
  "category": "enum (required)",
  "tags": ["string array"],
  "difficulty": "easy | medium | hard | expert",
  "roleLevel": "junior | mid | senior | staff | principal",
  "timeLimitMinutes": "integer (required)",
  "estimatedDurationMinutes": "integer",
  "status": "draft | active | archived | under_review"
}
```

#### 2. Language & Code Configuration
```json
{
  "supportedLanguages": ["java", "python", "javascript", "typescript", "go", "rust"],
  "initialCode": {
    "java": "string (code template)",
    "python": "string (code template)",
    "javascript": "string (code template)",
    "typescript": "string (code template)",
    "go": "string (code template)",
    "rust": "string (code template)"
  },
  "codeExecutionEnabled": "boolean",
  "defaultLanguage": "string"
}
```

#### 3. Requirements & Criteria
```json
{
  "requirements": [
    {
      "id": "string",
      "text": "string (required)",
      "priority": "must-have | should-have | nice-to-have",
      "category": "functionality | performance | edge-cases | testing"
    }
  ],
  "evaluationCriteria": [
    {
      "name": "Code Quality",
      "description": "Clean, readable, maintainable code",
      "maxScore": 10,
      "weight": 0.25,
      "rubric": [
        {"score": 1, "description": "Poor quality..."},
        {"score": 5, "description": "Average quality..."},
        {"score": 10, "description": "Excellent quality..."}
      ]
    }
  ]
}
```

#### 4. Test Cases Configuration
```json
{
  "testCases": [
    {
      "testName": "string (required)",
      "description": "text",
      "category": "basic | edge-case | performance | stress",
      "isHidden": "boolean",
      "points": "integer",
      "timeout": "integer (ms)",
      "operationsJson": "text (JSON)",
      "assertionsJson": "text (JSON)",
      "expectedOutput": "any",
      "orderIndex": "integer"
    }
  ],
  "testConfiguration": {
    "showHiddenTests": "boolean",
    "allowPartialCredit": "boolean",
    "stopOnFirstFailure": "boolean",
    "testTimeout": "integer (ms)"
  }
}
```

#### 5. Follow-Up Questions Configuration
```json
{
  "followUpQuestions": [
    {
      "questionText": "string (required)",
      "category": "optimization | edge-cases | scalability | design-choices",
      "expectedAnswer": "text",
      "keyPoints": ["string array"],
      "difficulty": "easy | medium | hard",
      "triggerCondition": {
        "type": "always | on-test-pass | on-test-fail | on-time-remaining",
        "value": "any"
      },
      "orderIndex": "integer"
    }
  ]
}
```

#### 6. AI Interviewer Configuration (Most Important!)
```json
{
  "aiConfiguration": {
    "systemPrompt": {
      "usePreset": "boolean",
      "presetId": "long (optional)",
      "customPrompt": "text - Custom system prompt for AI interviewer",
      "additionalContext": "text - Extra context to add to prompt"
    },

    "behaviorGuidelines": {
      "hintStrategy": "minimal | moderate | generous | socratic | custom",
      "customGuidelines": [
        {
          "type": "do | dont",
          "context": "when-asked-about-X | when-stuck | when-wrong-approach",
          "instruction": "string"
        }
      ],
      "exampleInteractions": [
        {
          "candidateQuestion": "string",
          "goodResponse": "string",
          "badResponse": "string"
        }
      ]
    },

    "focusAreas": {
      "emphasize": ["edge-cases", "optimization", "testing", "documentation"],
      "deemphasize": ["syntax-errors", "minor-style-issues"]
    },

    "responseStyle": {
      "verbosity": "concise | balanced | detailed",
      "tone": "professional | friendly | casual | strict",
      "codeInResponses": "always-provide | only-when-asked | never-provide",
      "proactiveHelp": "boolean"
    },

    "restrictions": {
      "allowDirectSolutions": "boolean",
      "allowArchitectureAdvice": "boolean",
      "allowDebugging": "boolean",
      "allowOptimizationSuggestions": "boolean"
    },

    "evaluationFocus": {
      "trackMetrics": [
        "ai-collaboration-quality",
        "question-quality",
        "independence-vs-reliance",
        "iterative-improvement"
      ],
      "weightsForMetrics": {
        "ai-collaboration-quality": 0.3,
        "technical-correctness": 0.4,
        "code-quality": 0.2,
        "communication": 0.1
      }
    }
  }
}
```

#### 7. Intentional Bugs & Common Pitfalls
```json
{
  "intentionalBugs": [
    {
      "name": "string",
      "description": "text",
      "difficulty": "common | subtle | rare",
      "category": "logic | performance | memory | concurrency | edge-case",
      "expectedDiscovery": "ai-should-hint | ai-should-reveal | candidate-should-find"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "string",
      "howToIdentify": "string",
      "aiResponse": "if-candidate-makes-this-mistake-ai-should-say-this"
    }
  ]
}
```

#### 8. Resources & References
```json
{
  "allowedResources": {
    "documentation": "boolean",
    "stackoverflow": "boolean",
    "google": "boolean",
    "customLinks": ["url array"]
  },
  "referenceLinks": [
    {
      "title": "string",
      "url": "string",
      "description": "text",
      "showToCandidate": "before-interview | during-interview | never"
    }
  ],
  "hints": [
    {
      "hintText": "string",
      "revealCondition": "on-request | after-X-minutes | on-struggle",
      "pointDeduction": "integer"
    }
  ]
}
```

#### 9. Grading & Scoring
```json
{
  "gradingConfiguration": {
    "autoGrade": "boolean",
    "gradingWeights": {
      "testsPassed": 0.4,
      "codeQuality": 0.2,
      "aiCollaboration": 0.2,
      "problemSolving": 0.1,
      "communication": 0.1
    },
    "passingScore": 70,
    "rubric": {
      "understanding": {
        "weight": 0.25,
        "criteria": ["..."]
      },
      "problemSolving": {
        "weight": 0.25,
        "criteria": ["..."]
      }
    }
  }
}
```

#### 10. Metadata & Organization
```json
{
  "metadata": {
    "companyId": "long",
    "createdByUserId": "long",
    "isPublic": "boolean",
    "isTemplate": "boolean",
    "parentQuestionId": "long (if cloned)",
    "version": "integer",
    "status": "draft | active | archived",
    "sharedWithCompanies": ["long array - company IDs"]
  }
}
```

---

## UI/UX Design

### Page Structure: Question Builder

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Create New Question                                        │
│  [Save Draft] [Preview] [Save & Activate]                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (Left - 20% width)                                         │
│                                                                      │
│  Progress Checklist:                                                │
│  ✓ 1. Basic Info                                                    │
│  ✓ 2. Requirements                                                  │
│  ○ 3. Code Templates                                                │
│  ○ 4. Test Cases                                                    │
│  ○ 5. AI Configuration ⭐                                           │
│  ○ 6. Follow-ups                                                    │
│  ○ 7. Grading Rubric                                                │
│  ○ 8. Preview & Test                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  MAIN CONTENT AREA (Right - 80% width)                              │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Step 1: Basic Information                                    │ │
│  │                                                               │ │
│  │  Question Title *                                             │ │
│  │  [________________________________]                           │ │
│  │                                                               │ │
│  │  Category *                                                   │ │
│  │  [Dropdown: Algorithm, System Design, Debugging, etc.]        │ │
│  │                                                               │ │
│  │  Tags                                                         │ │
│  │  [react] [frontend] [+Add Tag]                                │ │
│  │                                                               │ │
│  │  Difficulty *        Role Level *                             │ │
│  │  [○Easy ○Med ●Hard]  [Dropdown: Junior/Mid/Senior]            │ │
│  │                                                               │ │
│  │  Time Limit (minutes) *                                       │ │
│  │  [30] minutes                                                 │ │
│  │                                                               │ │
│  │  Question Description * (Markdown supported)                  │ │
│  │  ┌─────────────────────────────────────────────────┐         │ │
│  │  │ [B] [I] [Code] [Link] [Preview]                 │         │ │
│  │  │                                                  │         │ │
│  │  │ Build a rate limiter that controls how many...  │         │ │
│  │  │                                                  │         │ │
│  │  │ **Example:**                                     │         │ │
│  │  │ ```js                                            │         │ │
│  │  │ const limiter = new RateLimiter(3, 1000);        │         │ │
│  │  │ ```                                              │         │ │
│  │  └─────────────────────────────────────────────────┘         │ │
│  │                                                               │ │
│  │  [← Back]                              [Continue to Step 2 →] │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 2: Requirements Configuration

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 2: Requirements & Objectives                                  │
│                                                                      │
│  Define what the candidate needs to accomplish:                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Requirement 1                                   [Must Have ▾] │ │
│  │ ┌────────────────────────────────────────────────────────────┐ │ │
│  │ │ Implement allowRequest() method that returns boolean      │ │ │
│  │ └────────────────────────────────────────────────────────────┘ │ │
│  │ Category: [Functionality ▾]                        [🗑️ Remove] │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Requirement 2                                 [Should Have ▾] │ │
│  │ ┌────────────────────────────────────────────────────────────┐ │ │
│  │ │ Handle edge cases like time window expiration            │ │ │
│  │ └────────────────────────────────────────────────────────────┘ │ │
│  │ Category: [Edge Cases ▾]                           [🗑️ Remove] │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [+ Add Requirement]                                                 │
│                                                                      │
│  Common Pitfalls & Intentional Bugs (Optional)                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Pitfall: Memory grows unbounded                               │ │
│  │ How to identify: Array keeps growing without cleanup          │ │
│  │ AI should: [○ Hint  ●  Let them discover  ○ Directly mention] │ │
│  │                                                    [🗑️ Remove] │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [+ Add Common Pitfall]                                             │
│                                                                      │
│  [← Back to Step 1]                        [Continue to Step 3 →]   │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 3: Code Templates

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 3: Initial Code Templates                                     │
│                                                                      │
│  Provide starter code for each supported language:                  │
│                                                                      │
│  Supported Languages: ☑ JavaScript  ☑ Python  ☑ Java  ☐ TypeScript │
│                                                                      │
│  ┌─ JavaScript ─────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  class RateLimiter {                                          │  │
│  │    constructor(maxRequests, windowMs) {                       │  │
│  │      // TODO: Initialize the rate limiter                     │  │
│  │    }                                                          │  │
│  │                                                               │  │
│  │    allowRequest() {                                           │  │
│  │      // TODO: Return true if request allowed, false if limit  │  │
│  │      return false;                                            │  │
│  │    }                                                          │  │
│  │  }                                                            │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [Import from file] [Generate from description] [Copy from template]│
│                                                                      │
│  ┌─ Python ──────────────────────────────────────────────────────┐ │
│  │                                                               │  │
│  │  class RateLimiter:                                           │  │
│  │      def __init__(self, max_requests, window_ms):             │  │
│  │          # TODO: Initialize                                   │  │
│  │          pass                                                 │  │
│  │                                                               │  │
│  │      def allow_request(self):                                 │  │
│  │          # TODO: Implementation                               │  │
│  │          return False                                         │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [Import from file] [Generate from description] [Copy from template]│
│                                                                      │
│  [← Back to Step 2]                        [Continue to Step 4 →]   │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 4: Test Cases

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 4: Test Cases                                                 │
│                                                                      │
│  [+ Add Test Case]  [Import from JSON]  [Generate from description] │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▼ Test Case 1: Basic functionality                            │ │
│  │                                                                │ │
│  │   Test Name: allows requests under limit                      │ │
│  │   Category: [Basic ▾]                                          │ │
│  │   Visible to candidate: [● Yes  ○ Hidden]                      │ │
│  │   Points: [10]                                                 │ │
│  │                                                                │ │
│  │   Test Operations (JSON):                                      │ │
│  │   ┌──────────────────────────────────────────────────────────┐ │ │
│  │   │ [                                                        │ │ │
│  │   │   {                                                      │ │ │
│  │   │     "type": "create",                                    │ │ │
│  │   │     "class": "RateLimiter",                              │ │ │
│  │   │     "var": "limiter",                                    │ │ │
│  │   │     "args": [3, 1000]                                    │ │ │
│  │   │   },                                                     │ │ │
│  │   │   {                                                      │ │ │
│  │   │     "type": "call",                                      │ │ │
│  │   │     "var": "limiter",                                    │ │ │
│  │   │     "method": "allowRequest",                            │ │ │
│  │   │     "storeAs": "r1"                                      │ │ │
│  │   │   }                                                      │ │ │
│  │   │ ]                                                        │ │ │
│  │   └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │   Expected Results (JSON):                                     │ │
│  │   ┌──────────────────────────────────────────────────────────┐ │ │
│  │   │ {                                                        │ │ │
│  │   │   "r1": true,                                            │ │ │
│  │   │   "r2": true,                                            │ │ │
│  │   │   "r3": true                                             │ │ │
│  │   │ }                                                        │ │ │
│  │   └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │   [▶ Test Now]                                   [🗑️ Remove]   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▼ Test Case 2: Rate limit exceeded                            │ │
│  │   ...                                                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Test Configuration:                                                │
│  ☑ Show hidden tests after interview ends                           │
│  ☑ Allow partial credit                                            │
│  ☐ Stop on first failure                                            │
│  Test timeout: [5000] ms                                            │
│                                                                      │
│  [← Back to Step 3]                        [Continue to Step 5 →]   │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 5: AI Interviewer Configuration ⭐ (MOST IMPORTANT)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 5: AI Interviewer Configuration                               │
│                                                                      │
│  Configure how the AI interviewer should behave during interviews   │
│                                                                      │
│  ┌─ System Prompt ─────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  [● Use Preset  ○ Custom Prompt]                             │   │
│  │                                                              │   │
│  │  Preset: [Socratic Method ▾]                                 │   │
│  │                                                              │   │
│  │  📝 Description:                                             │   │
│  │  The AI will guide candidates through questioning rather    │   │
│  │  than providing direct answers. Encourages critical         │   │
│  │  thinking and self-discovery.                               │   │
│  │                                                              │   │
│  │  [Preview Preset]  [Customize This Preset]                   │   │
│  │                                                              │   │
│  │  Available Presets:                                          │   │
│  │  • Socratic Method - Question-based guidance                │   │
│  │  • Direct Helper - Provides clear, direct assistance         │   │
│  │  • Minimal Hints - Only helps when stuck                     │   │
│  │  • Code Review Style - Focuses on code quality feedback      │   │
│  │  • Debugging Partner - Collaborative debugging approach      │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Custom Instructions (Optional) ──────────────────────────────┐  │
│  │                                                               │  │
│  │  Add specific instructions for this question:                │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │ When discussing rate limiting, emphasize the trade-off  │ │  │
│  │  │ between memory usage and accuracy. If the candidate     │ │  │
│  │  │ implements a basic solution, ask about what happens     │ │  │
│  │  │ with 10,000 requests per second.                        │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─ Hint Strategy ────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  How should AI provide hints?                                 │ │
│  │  [○ Minimal  ● Moderate  ○ Generous  ○ Custom]                 │ │
│  │                                                                │ │
│  │  ⚙️ Moderate Settings:                                         │ │
│  │  • Provides hints after candidate struggles for 2-3 minutes   │ │
│  │  • Gives conceptual guidance, not direct code                 │ │
│  │  • Asks clarifying questions first                            │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Response Behavior ────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  Response Style:                                               │ │
│  │  Verbosity: [○ Concise  ● Balanced  ○ Detailed]                │ │
│  │  Tone: [○ Professional  ● Friendly  ○ Casual]                  │ │
│  │                                                                │ │
│  │  Code in Responses:                                            │ │
│  │  [○ Always provide  ● Only when asked  ○ Never provide]        │ │
│  │                                                                │ │
│  │  Restrictions:                                                 │ │
│  │  ☑ Allow direct code solutions (if explicitly asked)           │ │
│  │  ☑ Allow architecture advice                                   │ │
│  │  ☑ Allow debugging help                                        │ │
│  │  ☐ Allow optimization suggestions without prompting            │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Focus Areas ──────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  What should AI emphasize?                                     │ │
│  │  ☑ Edge cases                                                  │ │
│  │  ☑ Performance optimization                                    │ │
│  │  ☑ Testing & validation                                        │ │
│  │  ☐ Code documentation                                          │ │
│  │  ☐ Design patterns                                             │ │
│  │                                                                │ │
│  │  What should AI de-emphasize?                                  │ │
│  │  ☑ Minor syntax errors                                         │ │
│  │  ☑ Style/formatting issues                                     │ │
│  │  ☐ Variable naming                                             │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Example Interactions ─────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  Define good vs bad AI responses:                              │ │
│  │                                                                │ │
│  │  Scenario 1:                                                   │ │
│  │  Candidate: "How do I handle the time window?"                 │ │
│  │                                                                │ │
│  │  ❌ Bad Response:                                              │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ "Here's the code: timestamp > Date.now() - windowMs"     │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ✅ Good Response:                                             │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ "What information do you think you need to track about   │ │ │
│  │  │ each request to determine if it's within the window?"    │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  [+ Add Example Interaction]                                   │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [← Back to Step 4]                        [Continue to Step 6 →]   │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 6: Follow-Up Questions

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 6: Follow-Up Questions                                        │
│                                                                      │
│  [+ Add Follow-Up Question]                                          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▼ Follow-Up 1                                                  │ │
│  │                                                                │ │
│  │   Question:                                                    │ │
│  │   ┌──────────────────────────────────────────────────────────┐ │ │
│  │   │ What happens if this API gets 10,000 requests per       │ │ │
│  │   │ second? Would your solution still work well?            │ │ │
│  │   └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │   Category: [Performance & Scalability ▾]                      │ │
│  │   Difficulty: [● Medium]                                       │ │
│  │                                                                │ │
│  │   When to ask:                                                 │ │
│  │   [● Always  ○ After tests pass  ○ After X minutes  ○ Custom]  │ │
│  │                                                                │ │
│  │   Expected Answer / Key Points:                                │ │
│  │   ┌──────────────────────────────────────────────────────────┐ │ │
│  │   │ Key points candidates should mention:                    │ │ │
│  │   │ • Memory usage would grow with high traffic              │ │ │
│  │   │ • Array of timestamps could become very large            │ │ │
│  │   │ • Need to consider cleanup or alternative approaches     │ │ │
│  │   └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │   [🗑️ Remove]                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ▼ Follow-Up 2                                                  │ │
│  │                                                                │ │
│  │   Question:                                                    │ │
│  │   ┌──────────────────────────────────────────────────────────┐ │ │
│  │   │ Can you think of a solution that uses fixed memory      │ │ │
│  │   │ regardless of traffic?                                   │ │ │
│  │   └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │   Category: [Optimization ▾]                                   │ │
│  │   Difficulty: [● Hard]                                         │ │
│  │                                                                │ │
│  │   When to ask:                                                 │ │
│  │   [○ Always  ○ After tests pass  ○ After X minutes  ● Custom]  │ │
│  │                                                                │ │
│  │   Custom Trigger:                                              │ │
│  │   [Only if candidate mentioned memory concern in Follow-Up 1]  │ │
│  │                                                                │ │
│  │   Expected Answer / Key Points:                                │ │
│  │   ┌──────────────────────────────────────────────────────────┐ │ │
│  │   │ • Sliding window counter approach                        │ │ │
│  │   │ • Use fixed-size buckets                                 │ │ │
│  │   │ • Token bucket algorithm                                 │ │ │
│  │   │ • Trade-off: precision vs memory                         │ │ │
│  │   └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │   [🗑️ Remove]                                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [← Back to Step 5]                        [Continue to Step 7 →]   │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 7: Grading & Rubric

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 7: Grading & Scoring                                          │
│                                                                      │
│  ┌─ Grading Configuration ────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  Auto-grade interviews: [● Yes  ○ No]                          │ │
│  │  Passing score: [70] out of 100                                │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Category Weights ─────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  Tests Passed:        [████████──] 40%                         │ │
│  │  Code Quality:        [████──────] 20%                         │ │
│  │  AI Collaboration:    [████──────] 20%                         │ │
│  │  Problem Solving:     [██────────] 10%                         │ │
│  │  Communication:       [██────────] 10%                         │ │
│  │                                        Total: 100%             │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Detailed Rubric ──────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  ▼ Understanding (Weight: 25%)                                 │ │
│  │                                                                │ │
│  │     Score 1-3 (Poor):                                          │ │
│  │     ┌────────────────────────────────────────────────────────┐ │ │
│  │     │ • Doesn't understand the problem requirements          │ │ │
│  │     │ • Needs excessive guidance to get started              │ │ │
│  │     └────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │     Score 4-7 (Average):                                       │ │
│  │     ┌────────────────────────────────────────────────────────┐ │ │
│  │     │ • Understands basic requirements                       │ │ │
│  │     │ • Needs some clarification on edge cases               │ │ │
│  │     └────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │     Score 8-10 (Excellent):                                    │ │
│  │     ┌────────────────────────────────────────────────────────┐ │ │
│  │     │ • Fully understands all requirements                   │ │ │
│  │     │ • Asks insightful clarifying questions                 │ │ │
│  │     │ • Identifies edge cases proactively                    │ │ │
│  │     └────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ▼ Problem Solving (Weight: 25%)                               │ │
│  │     ...                                                        │ │
│  │                                                                │ │
│  │  ▼ AI Collaboration (Weight: 20%)                              │ │
│  │     ...                                                        │ │
│  │                                                                │ │
│  │  ▼ Code Quality (Weight: 20%)                                  │ │
│  │     ...                                                        │ │
│  │                                                                │ │
│  │  ▼ Communication (Weight: 10%)                                 │ │
│  │     ...                                                        │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [← Back to Step 6]                        [Continue to Step 8 →]   │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 8: Preview & Test

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 8: Preview & Test Your Question                               │
│                                                                      │
│  ┌─ Question Summary ─────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  Title: Rate Limiter                                           │ │
│  │  Category: Algorithms  |  Difficulty: Medium  |  30 min        │ │
│  │  Languages: JavaScript, Python, Java                           │ │
│  │  Test Cases: 10 (8 visible, 2 hidden)                          │ │
│  │  Follow-ups: 5 questions                                       │ │
│  │  AI Preset: Socratic Method                                    │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Test Your Question ───────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  [▶ Start Test Interview]                                      │ │
│  │                                                                │ │
│  │  This will launch a simulated interview where you can:         │ │
│  │  • Test the code editor with initial templates                 │ │
│  │  • Interact with the AI interviewer                            │ │
│  │  • Run the test cases                                          │ │
│  │  • Verify follow-up question flow                              │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Validation Checklist ─────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  ✓ Basic information complete                                  │ │
│  │  ✓ At least 1 requirement defined                              │ │
│  │  ✓ Code templates for all selected languages                   │ │
│  │  ✓ At least 3 test cases defined                               │ │
│  │  ✓ AI configuration set                                        │ │
│  │  ⚠ No follow-up questions (recommended: add at least 2)        │ │
│  │  ✓ Grading rubric configured                                   │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Status: [Draft ▾]    Visibility: [● Private  ○ Public]             │
│                                                                      │
│  [← Back to Step 7]   [Save as Draft]   [Save & Activate Question]  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Question Management

#### Create Question
```
POST /api/questions
Authorization: Bearer {token}

Request Body: {
  "title": "string",
  "description": "text",
  "category": "string",
  "tags": ["string"],
  "difficulty": "easy|medium|hard",
  "roleLevel": "junior|mid|senior|staff|principal",
  "timeLimitMinutes": integer,
  "supportedLanguages": ["string"],
  "initialCode": {
    "java": "string",
    "python": "string",
    "javascript": "string"
  },
  "requirements": [...],
  "testCases": [...],
  "followUpQuestions": [...],
  "aiConfiguration": {...},
  "gradingConfiguration": {...},
  "status": "draft|active|archived",
  "isPublic": boolean
}

Response: {
  "id": long,
  "message": "Question created successfully",
  "status": "draft",
  "question": {...}
}
```

#### Update Question
```
PUT /api/questions/{id}
Authorization: Bearer {token}

Request Body: Same as create
Response: Updated question object
```

#### Get Company Questions
```
GET /api/questions/company/{companyId}
Authorization: Bearer {token}

Query Parameters:
  - status: draft|active|archived (optional)
  - category: string (optional)
  - difficulty: easy|medium|hard (optional)
  - isPublic: boolean (optional)
  - page: integer (default: 0)
  - size: integer (default: 20)

Response: {
  "questions": [...],
  "totalCount": integer,
  "page": integer,
  "totalPages": integer
}
```

#### Get Question by ID
```
GET /api/questions/{id}
Authorization: Bearer {token}

Response: Full question object with all relationships
```

#### Delete Question
```
DELETE /api/questions/{id}
Authorization: Bearer {token}

Response: {
  "message": "Question deleted successfully"
}
```

#### Duplicate/Clone Question
```
POST /api/questions/{id}/clone
Authorization: Bearer {token}

Response: New question object (copy of original)
```

### Question Templates

#### Get Templates
```
GET /api/question-templates
Authorization: Bearer {token}

Response: {
  "templates": [
    {
      "id": long,
      "name": "Algorithm Problem",
      "description": "Standard algorithm challenge",
      "category": "algorithms",
      "templateConfig": {...}
    }
  ]
}
```

#### Create from Template
```
POST /api/questions/from-template/{templateId}
Authorization: Bearer {token}

Response: New question initialized with template structure
```

### AI Prompt Presets

#### Get AI Presets
```
GET /api/ai-prompt-presets
Authorization: Bearer {token}

Query Parameters:
  - includePublic: boolean (default: true)

Response: {
  "presets": [
    {
      "id": long,
      "name": "Socratic Method",
      "description": "Guide through questioning",
      "systemPrompt": "text",
      "behaviorGuidelines": {...}
    }
  ]
}
```

#### Create Custom AI Preset
```
POST /api/ai-prompt-presets
Authorization: Bearer {token}

Request Body: {
  "name": "string",
  "description": "text",
  "systemPrompt": "text",
  "behaviorGuidelines": {...},
  "hintStrategy": "minimal|moderate|generous",
  "isPublic": boolean
}

Response: Created preset object
```

### Question Analytics

#### Get Question Statistics
```
GET /api/questions/{id}/analytics
Authorization: Bearer {token}

Response: {
  "questionId": long,
  "timesUsed": integer,
  "averageScore": double,
  "averageCompletionTimeMinutes": double,
  "passRate": double,
  "candidateDistribution": {
    "passed": integer,
    "failed": integer,
    "inProgress": integer
  },
  "scoreDistribution": {
    "0-20": integer,
    "21-40": integer,
    "41-60": integer,
    "61-80": integer,
    "81-100": integer
  },
  "commonStruggles": ["string"],
  "averageTestCasePassRates": [...]
}
```

### Question Versioning

#### Get Question History
```
GET /api/questions/{id}/versions
Authorization: Bearer {token}

Response: {
  "versions": [
    {
      "versionNumber": integer,
      "changedAt": datetime,
      "changedBy": "string",
      "changeSummary": "string"
    }
  ]
}
```

#### Restore Previous Version
```
POST /api/questions/{id}/restore/{versionNumber}
Authorization: Bearer {token}

Response: Question object restored to specified version
```

---

## Additional Features

### 1. Question Templates Library

**Platform-Provided Templates:**
- Algorithm Problem
- System Design
- Debugging Challenge
- API Design
- Code Refactoring
- Performance Optimization
- Data Structure Implementation

**Features:**
- Pre-configured structure
- Sample test cases
- Suggested AI configurations
- Best practices built-in

### 2. AI Prompt Presets Library

**Platform-Provided Presets:**
- **Socratic Method**: Guides through questioning, never gives direct answers
- **Direct Helper**: Provides clear assistance when asked
- **Minimal Hints**: Only intervenes when candidate is truly stuck
- **Code Review Style**: Focuses on code quality and best practices
- **Debugging Partner**: Collaborative approach to finding bugs
- **Performance Coach**: Emphasizes optimization and efficiency

### 3. Collaborative Question Building

**Features:**
- Multiple team members can edit questions
- Change tracking and version history
- Comment/review system before activation
- Approval workflow for question publication

### 4. Question Import/Export

**Features:**
- Export questions as JSON
- Import from existing question banks
- Bulk import via CSV/JSON
- Share questions between companies (with permission)

### 5. Smart Question Suggestions

**AI-Powered:**
- Suggest similar questions based on description
- Recommend test cases based on requirements
- Generate initial code templates from description
- Suggest follow-up questions automatically

### 6. Question Preview Mode

**Features:**
- Take the interview yourself before publishing
- Test AI interactions in real-time
- Verify test cases work correctly
- Ensure grading rubric is clear

### 7. Question Analytics Dashboard

**Metrics:**
- Usage statistics (how often used)
- Candidate success rates
- Average completion times
- Common mistakes/struggles
- AI interaction patterns
- Question effectiveness score

### 8. Question Categories & Tags

**Organization:**
- Predefined categories (Algorithms, System Design, etc.)
- Custom tags (company-specific)
- Filter and search capabilities
- Smart collections (e.g., "Questions for Senior Frontend")

### 9. Difficulty Calibration

**Features:**
- Auto-suggest difficulty based on complexity analysis
- Adjust difficulty based on candidate performance data
- Difficulty consistency across similar questions

### 10. Resource Attachments

**Features:**
- Attach documentation links
- Upload reference files
- Include diagrams/images in question description
- Provide API documentation for integration questions

### 11. Multi-Language Support

**Features:**
- Support for 6+ programming languages
- Automatic syntax validation for initial code
- Language-specific test runners
- Cross-language comparison for same question

### 12. Question Sharing & Marketplace

**Features:**
- Share questions with other companies (opt-in)
- Public question marketplace
- Rate and review questions
- Fork/clone public questions
- Attribution and licensing

---

## Implementation Phases

### Phase 1: Core Question Builder (Weeks 1-3)
- [ ] Database schema updates (Question entity enhancements)
- [ ] Basic question CRUD endpoints
- [ ] Question builder UI (Steps 1-3: Basic Info, Requirements, Code Templates)
- [ ] Initial code editor integration
- [ ] Save as draft functionality

### Phase 2: Testing & Validation (Weeks 4-5)
- [ ] Test case builder UI (Step 4)
- [ ] Test execution engine updates
- [ ] Test case templates
- [ ] Preview/test mode for questions

### Phase 3: AI Configuration (Weeks 6-7) ⭐
- [ ] AI prompt preset system
- [ ] AI configuration UI (Step 5)
- [ ] Custom system prompt builder
- [ ] Example interaction system
- [ ] AI behavior testing tools

### Phase 4: Follow-ups & Grading (Week 8)
- [ ] Follow-up question builder (Step 6)
- [ ] Grading rubric configuration (Step 7)
- [ ] Auto-grading system updates
- [ ] Custom evaluation criteria

### Phase 5: Templates & Presets (Week 9)
- [ ] Question template system
- [ ] QuestionTemplate entity and endpoints
- [ ] Platform-provided templates
- [ ] AI preset library
- [ ] Create from template flow

### Phase 6: Advanced Features (Weeks 10-12)
- [ ] Question versioning system
- [ ] Question analytics dashboard
- [ ] Question sharing/collaboration
- [ ] Import/export functionality
- [ ] Question marketplace (optional)

### Phase 7: Polish & Testing (Weeks 13-14)
- [ ] End-to-end testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Training materials

---

## Security & Permissions

### Permission Levels

#### Company Admin
- Create, edit, delete company questions
- Manage question templates
- Configure AI presets
- View analytics for all company questions
- Share questions publicly
- Manage collaborators

#### Interviewer
- View all company questions
- Use questions in interviews
- Suggest edits (requires approval)
- View analytics for questions they've used

#### Question Creator
- Create new questions
- Edit own questions
- Delete own draft questions
- Cannot delete active questions with interview history

### Data Isolation

- Company questions are isolated by `companyId`
- Users can only access questions from their company (unless public)
- Public questions are read-only for other companies (must clone to edit)
- Template questions belong to platform or company

### Validation & Sanitization

- Input validation for all fields
- XSS protection for markdown content
- Code injection prevention in test cases
- Rate limiting on question creation
- Maximum question count per company (configurable)

### Audit Trail

- Track all question changes
- Log who created/edited/deleted questions
- Version history for compliance
- Restore previous versions if needed

---

## Technical Considerations

### Performance

- Lazy loading for test cases when listing questions
- Pagination for question lists
- Caching for frequently used questions
- Debounce autosave in builder UI

### Database Indexing

```sql
CREATE INDEX idx_questions_company ON questions(company_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_created_by ON questions(created_by_user_id);
CREATE INDEX idx_question_versions_question ON question_versions(question_id);
CREATE INDEX idx_question_templates_category ON question_templates(category);
```

### Code Quality

- Comprehensive validation for question configuration
- JSON schema validation for complex fields
- Unit tests for question creation/update logic
- Integration tests for API endpoints
- E2E tests for question builder UI

### UX Enhancements

- Auto-save drafts every 30 seconds
- Unsaved changes warning
- Inline validation with helpful error messages
- Progress indicator (8-step wizard)
- Keyboard shortcuts for power users
- Bulk operations (duplicate, archive, delete)
- Search and filter capabilities

---

## Open Questions & Decisions Needed

1. **Question Limits**: Should there be a limit on questions per company?
2. **Pricing**: Should advanced features (AI customization, analytics) be premium?
3. **Versioning**: Should changing an active question create a new version or update in-place?
4. **Marketplace**: Should we build a public question marketplace in Phase 1 or later?
5. **AI Model Selection**: Allow companies to choose Claude model (Sonnet vs Opus)?
6. **Test Execution**: Run tests in sandbox vs trusted execution environment?
7. **Code Templates**: Support code generation from natural language descriptions?
8. **Localization**: Support questions in multiple human languages?

---

## Success Metrics

- **Adoption**: % of companies creating custom questions
- **Usage**: Average questions created per company
- **Quality**: Question rating/satisfaction scores
- **Effectiveness**: Candidate success rate correlation
- **Efficiency**: Time to create a question (target: < 20 minutes)
- **Reusability**: Question reuse rate
- **AI Quality**: AI interviewer effectiveness scores

---

## Conclusion

This custom question creation feature will empower companies to build tailored interview experiences that match their specific needs, tech stacks, and interview philosophies. The key differentiator is the **AI Configuration** system, which allows fine-grained control over how the AI interviewer behaves, making each question truly customized to the company's evaluation criteria.

The phased implementation approach ensures we can deliver value incrementally while building toward a comprehensive question management system.
