# MVP Specification V2 - Simplified Flow

## MVP Scope Definition

**Goal:** Launch a working platform in 8 weeks that can conduct 1 real interview

**MVP Means:**
- ✅ Core functionality works end-to-end
- ✅ Good enough UX (not perfect)
- ✅ 1 company, 1 interviewer, 1 candidate can complete interview
- ✅ Basic security and reliability
- ✅ Multi-language support (Java, Python, JavaScript)
- ❌ No admin dashboard polish
- ❌ No advanced analytics
- ❌ No video integration (use external Zoom/Meet)
- ❌ No custom questions (3-5 pre-built questions only)
- ❌ No automated email sending (interviewer shares link manually)

---

## Core Interview Flow

### The Simplified Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INTERVIEW FLOW V2                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  INTERVIEWER                                    CANDIDATE                    │
│  ────────────                                   ─────────                    │
│                                                                              │
│  1. Click "New Interview"                                                    │
│         │                                                                    │
│         ▼                                                                    │
│  2. Select question from bank                                                │
│     + Optional: candidate name, role                                         │
│         │                                                                    │
│         ▼                                                                    │
│  3. System creates session:                                                  │
│     • status = "pending"                                                     │
│     • access_token = "xK9mPq2nR4vL"                                         │
│     • URL = yourapp.com/i/xK9mPq2nR4vL                                      │
│         │                                                                    │
│         ▼                                                                    │
│  4. Interviewer sees:                                                        │
│     • Session preview page                                                   │
│     • "Copy Link" button                                                     │
│     • "Start Interview" button                                               │
│     • Candidate connection status                                            │
│         │                                                                    │
│         ▼                                                                    │
│  5. Manually sends link via                    6. Receives link              │
│     email/Slack/calendar ─────────────────────────▶ (any channel)            │
│         │                                              │                     │
│         │                                              ▼                     │
│         │                                       7. Opens link                │
│         │                                              │                     │
│         │                                              ▼                     │
│         │                                       8. Sees waiting screen:      │
│         │                                          "Waiting for              │
│         │                                           interviewer..."          │
│         │                                              │                     │
│         │◄──── WebSocket ──────────────────────────────┤                     │
│         │      (candidate connected)                   │                     │
│         ▼                                              │                     │
│  9. Sees "Candidate connected" ●                       │                     │
│         │                                              │                     │
│         ▼                                              │                     │
│  10. Clicks "Start Interview"                          │                     │
│         │                                              │                     │
│         │────── WebSocket ─────────────────────────────▶                     │
│         │       (status: live)                         │                     │
│         ▼                                              ▼                     │
│  11. Sees live observer view:                   12. Screen transitions:      │
│      • Candidate's code (real-time)                 • Question appears       │
│      • AI chat history                              • Editor unlocks         │
│      • Test results                                 • Language selector      │
│      • Notes panel                                  • Timer starts           │
│      • "End Interview" button                       • AI chat available      │
│         │                                              │                     │
│         │◄────── Real-time sync ───────────────────────┤                     │
│         │        (code, chat, tests)                   │                     │
│         │                                              │                     │
│         │                                       13. Candidate codes,         │
│         │                                           uses AI, runs tests      │
│         │                                              │                     │
│         │                                              ▼                     │
│         │                                       14. Clicks "Submit"          │
│         │◄────── WebSocket ────────────────────────────┤                     │
│         │        (interview submitted)                 │                     │
│         │                                              ▼                     │
│  ───────┼───────────────────────────────────    15. Sees "Complete"          │
│    OR   │                                           screen                   │
│         │                                                                    │
│         ▼                                                                    │
│  14b. Interviewer clicks                                                     │
│       "End Interview"                                                        │
│         │                                                                    │
│         │────── WebSocket ─────────────────────────────▶                     │
│         │       (status: ended)                        │                     │
│         ▼                                              ▼                     │
│  15. Interview ends:                            16. Sees "Interview          │
│      • Auto-scoring runs                            Ended" screen            │
│      • Results available                                                     │
│      • Can fill scorecard                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interview Status States

```
┌──────────┐     Interviewer clicks      ┌──────────┐     Submit OR        ┌──────────┐
│ PENDING  │ ──────"Start Interview"────▶│   LIVE   │ ───End Interview───▶│  ENDED   │
└──────────┘                              └──────────┘                      └──────────┘
     │                                         │                                 │
     │                                         │                                 │
     ▼                                         ▼                                 ▼
 Candidate sees                           Candidate sees                    Candidate sees
 waiting screen                           coding environment                "ended" screen
```

| Status | Interviewer Actions | Candidate View |
|--------|---------------------|----------------|
| `PENDING` | Copy link, Start, Delete | Waiting screen with company/question info |
| `LIVE` | Watch code, See AI chat, Take notes, End Interview | Full coding environment |
| `ENDED` | View results, Fill scorecard, View report | "Interview Complete" or "Interview Ended" |

---

## User Roles

### Role Definitions

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Admin** | Person who creates company account | Everything Interviewer can do + Invite interviewers + Manage billing + See ALL interviews |
| **Interviewer** | Invited by Admin | Create interviews + Conduct interviews + See OWN interviews only + Fill scorecards |
| **Candidate** | External person being interviewed | Access via link only + No account + Code + Chat with AI + Submit |

### Authorization Rules

```java
// Admin sees all company interviews
SELECT * FROM interviews WHERE company_id = :companyId

// Interviewer sees only their interviews
SELECT * FROM interviews WHERE interviewer_id = :interviewerId
```

---

## MVP Feature List

### ✅ MUST HAVE (Required for Launch)

**Authentication & User Management:**
- [ ] Company signup/login (email + password)
- [ ] Role-based access (Admin vs Interviewer)
- [ ] Password reset flow
- [ ] JWT authentication

**Dashboard:**
- [ ] View list of interviews (Pending, Live, Ended)
- [ ] Create new interview (select question, optional candidate name/role)
- [ ] Copy interview link
- [ ] View interview results

**Interview Session Management:**
- [ ] Generate unique interview link (12-char alphanumeric token)
- [ ] Interview preview page (before starting)
- [ ] Start interview (Pending → Live)
- [ ] End interview (Live → Ended)
- [ ] Real-time candidate connection status
- [ ] Delete pending interviews

**Candidate Experience:**
- [ ] Waiting screen (when status = Pending)
- [ ] Real-time transition to coding (when interviewer starts)
- [ ] Coding environment with Monaco editor
- [ ] Language selector (Java, Python, JavaScript)
- [ ] AI chat assistant (Claude Haiku 4.5)
- [ ] Run code / Run tests
- [ ] Submit interview
- [ ] "Interview Ended" screen

**Interviewer Live View:**
- [ ] See candidate's code in real-time (WebSocket)
- [ ] See AI chat history
- [ ] See test results
- [ ] Notes panel (saved with interview)
- [ ] "End Interview" button
- [ ] Timer display

**Code Execution Sandbox (Docker):**
- [ ] Java sandbox (eclipse-temurin:21-jdk-alpine)
- [ ] Python sandbox (python:3.12-alpine)
- [ ] JavaScript sandbox (node:20-alpine)
- [ ] Security: No network, read-only, 128MB RAM, 10s timeout
- [ ] Test runner with predefined tests

**Evaluation & Scoring:**
- [ ] Automated scoring (tests passed = points)
- [ ] Interviewer scorecard (manual assessment)
- [ ] Final score calculation
- [ ] Recommendation (Hire / Maybe / No Hire)

**Results & Reporting:**
- [ ] Interview results page
- [ ] Code snapshot
- [ ] Conversation history
- [ ] Test results
- [ ] Scores breakdown
- [ ] Interviewer notes

**Question Library:**
- [ ] 3-5 pre-built questions with tests
- [ ] URL Shortener
- [ ] Shopping Cart API
- [ ] Task Manager

**Billing (Basic):**
- [ ] Stripe integration
- [ ] Subscription plans

---

### ❌ REMOVED FROM MVP (Out of Scope for v1)

- ~~Email notifications to candidates~~ → Interviewer shares link manually
- ~~Candidate email verification~~ → Not needed, link-only access
- ~~Magic link authentication~~ → Simple token in URL
- ~~Scheduled interviews~~ → No calendar, just create and start when ready
- ~~Reminder emails~~ → Manual coordination
- ~~Candidate signup/login~~ → No account needed

---

### 🚀 FUTURE FEATURES (Post-MVP)

**Phase 2 - Team Management:**
- [ ] Admin invite interviewers flow
- [ ] Team member management dashboard
- [ ] Role-based permissions (Admin, Lead Interviewer, Interviewer)
- [ ] Interviewer activity logs
- [ ] Team interview analytics

**Phase 2 - Custom Questions:**
- [ ] Admin panel to create custom questions
- [ ] Question versioning and updates
- [ ] Question preview and testing
- [ ] Question difficulty and time limit configuration
- [ ] Reusable question templates library
- [ ] Import/export questions

**Phase 2 - Authentication:**
- [ ] Google OAuth / SSO integration
- [ ] GitHub OAuth authentication
- [ ] Azure AD / Enterprise SSO support
- [ ] Social login for signup

---

### 🔶 NICE TO HAVE (If Time Permits)

- [ ] Code autosave every 30 seconds
- [ ] Export results as PDF
- [ ] Basic analytics (total interviews, avg score)
- [ ] Question difficulty labels
- [ ] Dark/light theme toggle

---

## UI/UX Design System

### Design Principles
- **Modern & Clean**: Using shadcn/ui for consistent, professional UI components
- **Accessible**: Built with accessibility in mind (ARIA labels, semantic HTML)
- **Responsive**: Mobile-first design that works on all screen sizes
- **Dark Mode Ready**: Tailwind CSS with light/dark theme support

### Component Library: shadcn/ui
- Headless, unstyled components built on Radix UI primitives
- Customizable Tailwind CSS styling
- Icons via lucide-react
- Fully typed with TypeScript

### Key UI Updates

**Dashboard Page:**
- Refined interview list with status badges and quick actions
- Search and filter functionality for interviews
- Dialog-based "Create New Interview" instead of modal steps
- Expandable question cards to view full descriptions
- Responsive grid layout with hover states
- Status-specific actions (Copy Link, Start, View Live, View Results)
- Dropdown menu for additional actions (Delete, End Interview)

**Login/Signup Pages:**
- Centered card-based layout
- Form validation with helpful error messages
- Link to password reset and signup pages
- Client-side validation before API calls

**Interview Management Modal:**
- Dialog-based creation flow (replaces multi-step modal)
- Expandable question selection with descriptions
- Candidate name and role optional fields
- Integrated directly into dashboard dialog

---

## Technical Architecture

### Frontend Stack

**Framework:** React 18 + TypeScript + Vite
**UI Library:** shadcn/ui with Tailwind CSS
**Hosting:** Cloudflare Pages (FREE)

```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "react-router-dom": "^6.20.0",
  "tailwindcss": "^3.4.0",
  "@monaco-editor/react": "^4.6.0",
  "react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "axios": "^1.6.0",
  "socket.io-client": "^4.6.0",
  "shadcn/ui": "latest",
  "lucide-react": "^latest"
}
```

**File Structure:**
```
/frontend
  /src
    /components
      /ui                          # shadcn/ui components
        button.tsx
        input.tsx
        dialog.tsx
        select.tsx
        badge.tsx
        dropdown-menu.tsx
        label.tsx
        [other shadcn/ui components]
      /common                      # Custom wrapper components
        Button.tsx
        Input.tsx
        Card.tsx
        Header.tsx
        Sidebar.tsx
      PrivateRoute.tsx
      AdminRoute.tsx
      CreateInterviewModal.tsx
      InterviewList.tsx
    /pages
      LoginPage.tsx
      SignupPage.tsx
      ForgotPasswordPage.tsx
      ResetPasswordPage.tsx
      DashboardPage.tsx
      InterviewPage.tsx                # /interview/:id (interviewer + candidate)
      HomePage.tsx
      NotFoundPage.tsx
    /layouts
      AppLayout.tsx
      DashboardLayout.tsx
      InterviewLayout.tsx
    /hooks
      useAuth.ts
      useInterview.ts
      useWebSocket.ts
    /services
      apiClient.ts
      authService.ts
      interviewService.ts
    /stores
      authStore.ts
      interviewStore.ts
    /types
      store.ts
    /router
      index.tsx
    App.tsx
    main.tsx
```

---

### Backend Stack

**Framework:** Spring Boot 3.2+ with Java 17
**Hosting:** Hetzner VPS CX32 (~$9/month)

**Project Structure:**
```
/backend
  /src/main/java/com/aiinterview
    /config
      SecurityConfig.java
      WebSocketConfig.java
      CorsConfig.java
      DockerConfig.java
    /controller
      AuthController.java
      InterviewController.java
      QuestionController.java
      EvaluationController.java
      CodeExecutionController.java
    /service
      AuthService.java
      InterviewService.java
      AIService.java
      SandboxExecutorService.java
      TestRunnerService.java
      ScoringService.java
    /repository
      CompanyRepository.java
      UserRepository.java
      InterviewRepository.java
      InterviewSessionRepository.java
      QuestionRepository.java
    /model
      /entity
        Company.java
        User.java
        Interview.java
        InterviewSession.java
        Question.java
        Evaluation.java
      /dto
        CreateInterviewRequest.java
        InterviewResponse.java
        ChatMessageRequest.java
        CodeExecutionRequest.java
        InviteInterviewerRequest.java
      /enums
        UserRole.java              # ADMIN, INTERVIEWER
        InterviewStatus.java       # PENDING, LIVE, ENDED
        Language.java              # JAVA, PYTHON, JAVASCRIPT
    /security
      JwtTokenProvider.java
      UserDetailsServiceImpl.java
    /websocket
      InterviewWebSocketHandler.java
      WebSocketEventType.java
```

---

### Database Schema

```sql
-- Companies
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users (Admins & Interviewers)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,  -- 'ADMIN' or 'INTERVIEWER'
    invite_token VARCHAR(255),  -- For pending invites
    invite_accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions (pre-built)
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20),  -- 'easy', 'medium', 'hard'
    time_limit_minutes INT DEFAULT 30,
    tests_json JSONB NOT NULL,
    rubric_json JSONB,
    initial_code_java TEXT,
    initial_code_python TEXT,
    initial_code_javascript TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interviews
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) NOT NULL,
    interviewer_id BIGINT REFERENCES users(id) NOT NULL,
    question_id BIGINT REFERENCES questions(id) NOT NULL,
    
    -- Optional candidate info
    candidate_name VARCHAR(255),
    role_label VARCHAR(255),
    
    -- Access
    access_token VARCHAR(20) UNIQUE NOT NULL,  -- URL token (12 chars)
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, LIVE, ENDED
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,   -- When interviewer clicked Start
    ended_at TIMESTAMP,     -- When interview ended
    
    -- Indexes
    CONSTRAINT idx_access_token UNIQUE (access_token)
);

-- Interview Sessions (interview data after it starts)
CREATE TABLE interview_sessions (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id) UNIQUE NOT NULL,
    
    -- Candidate's work
    selected_language VARCHAR(20),
    code_snapshot TEXT,
    conversation_log JSONB,
    test_results JSONB,
    
    -- Interviewer notes
    interviewer_notes TEXT,
    
    -- Scores
    automated_score INT,
    manual_score INT,
    final_score INT,
    recommendation VARCHAR(20),  -- 'HIRE', 'MAYBE', 'NO_HIRE'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations (detailed scorecard)
CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    interview_session_id BIGINT REFERENCES interview_sessions(id),
    understanding_score INT,      -- 0-10
    problem_solving_score INT,    -- 0-10
    ai_collaboration_score INT,   -- 0-10
    communication_score INT,      -- 0-10
    strengths TEXT,
    weaknesses TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_interviews_company ON interviews(company_id);
CREATE INDEX idx_interviews_interviewer ON interviews(interviewer_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_users_company ON users(company_id);
```

---

### API Endpoints

```
# Authentication
POST   /api/auth/signup              # Company signup (creates Admin)
POST   /api/auth/login               # Login
POST   /api/auth/refresh             # Refresh token
POST   /api/auth/forgot-password     # Request reset
POST   /api/auth/reset-password      # Reset password

# Interviews (authenticated)
POST   /api/interviews               # Create interview
GET    /api/interviews               # List interviews (filtered by role)
GET    /api/interviews/:id           # Get interview details
DELETE /api/interviews/:id           # Delete (only if PENDING)
POST   /api/interviews/:id/start     # Start interview (PENDING → LIVE)
POST   /api/interviews/:id/end       # End interview (LIVE → ENDED)

# Candidate Access (no auth, by token)
GET    /api/i/:token                 # Get interview for candidate
POST   /api/i/:token/submit          # Submit interview

# Code Execution
POST   /api/code/execute             # Run code in sandbox
POST   /api/code/test                # Run tests

# AI Chat
POST   /api/ai/chat                  # Send message to Claude

# Questions
GET    /api/questions                # List available questions

# Evaluation
POST   /api/evaluations              # Submit evaluation
GET    /api/evaluations/:interviewId # Get evaluation

# WebSocket
WS     /ws/interview/:token          # Real-time updates
```

---

### WebSocket Events

```typescript
// Event types
enum WebSocketEvent {
  // Connection
  CANDIDATE_CONNECTED = 'candidate_connected',
  CANDIDATE_DISCONNECTED = 'candidate_disconnected',
  INTERVIEWER_CONNECTED = 'interviewer_connected',
  
  // Interview lifecycle
  INTERVIEW_STARTED = 'interview_started',
  INTERVIEW_ENDED = 'interview_ended',
  INTERVIEW_SUBMITTED = 'interview_submitted',
  
  // Real-time sync (candidate → interviewer)
  CODE_UPDATED = 'code_updated',
  LANGUAGE_CHANGED = 'language_changed',
  TEST_RESULTS = 'test_results',
  AI_MESSAGE = 'ai_message',
}

// Payload examples
{ type: 'candidate_connected' }
{ type: 'interview_started', timestamp: '...' }
{ type: 'code_updated', code: '...', cursor: { line: 5, column: 10 } }
{ type: 'test_results', results: [...], passCount: 3, totalCount: 5 }
{ type: 'interview_ended', endedBy: 'interviewer' }
```

---

### Link Generation

```java
@Service
public class InterviewService {
    
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALPHABET = 
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int TOKEN_LENGTH = 12;
    
    /**
     * Generates unique 12-char token.
     * 62^12 = 3.2 × 10^21 combinations (unguessable)
     */
    public String generateAccessToken() {
        StringBuilder token = new StringBuilder(TOKEN_LENGTH);
        for (int i = 0; i < TOKEN_LENGTH; i++) {
            token.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return token.toString();
    }
    
    @Transactional
    public Interview createInterview(CreateInterviewRequest request, User interviewer) {
        String token;
        do {
            token = generateAccessToken();
        } while (interviewRepository.existsByAccessToken(token));
        
        Interview interview = Interview.builder()
            .company(interviewer.getCompany())
            .interviewer(interviewer)
            .question(questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new NotFoundException("Question not found")))
            .candidateName(request.getCandidateName())
            .roleLabel(request.getRoleLabel())
            .accessToken(token)
            .status(InterviewStatus.PENDING)
            .createdAt(Instant.now())
            .build();
        
        return interviewRepository.save(interview);
    }
    
    public String getInterviewUrl(Interview interview) {
        return frontendBaseUrl + "/i/" + interview.getAccessToken();
    }
}
```

---

## Pages & Routes

### Frontend Routes

```typescript
// Public routes (no auth)
/login                    → LoginPage
/signup                   → SignupPage
/forgot-password          → ForgotPasswordPage
/reset-password           → ResetPasswordPage
/i/:token                 → CandidatePage (waiting/coding/ended)

// Protected routes (auth required)
/dashboard                → DashboardPage (interview list)
/interview/:id            → InterviewPage (interviewer + candidate view)
/settings                 → SettingsPage
```

### Page Breakdown

| Page | Description | Key Components |
|------|-------------|----------------|
| **LoginPage** | Email/password login | LoginForm |
| **SignupPage** | Company registration | SignupForm |
| **ForgotPasswordPage** | Password reset request | Email form |
| **ResetPasswordPage** | Password reset confirmation | New password form |
| **DashboardPage** | Interview list with tabs | InterviewList, CreateModal |
| **InterviewPage** | Interviewer + candidate view | Preview/Observer/Coding modes |
| **SettingsPage** | Account settings | Profile, billing |

---

## Cost Breakdown

| Service | Cost/Month | Notes |
|---------|------------|-------|
| Hetzner VPS CX32 | $9.10 | 4 vCPU, 8GB RAM |
| Cloudflare Pages | $0 | Frontend hosting |
| Claude Haiku 4.5 | ~$3-10 | ~50 interviews @ $0.06 each |
| Stripe | $0 base | 2.9% + $0.30 per transaction |
| Domain | ~$1 | Amortized |
| Sentry | $0 | Free tier |
| **TOTAL** | **~$13-20/mo** | |

---

## Development Timeline (8 Weeks)

```
Week 1-2: Foundation
├── Hetzner VPS + Docker setup
├── Spring Boot + Auth (signup, login, JWT)
├── React app + routing + Tailwind
├── Database schema + migrations
└── Basic dashboard UI

Week 3-4: Interview Core
├── Create interview flow
├── Interview session page (interviewer)
├── Candidate waiting page
├── WebSocket setup
├── Start/End interview logic
└── Real-time status sync

Week 5: Coding Environment
├── Monaco editor integration
├── Language selector
├── Docker sandbox (Java, Python, JS)
├── Code execution API
├── Test runner
└── Claude Haiku 4.5 integration

Week 6: Live Sync & AI
├── Real-time code sync (WebSocket)
├── AI chat interface
├── Observer view for interviewer
├── Timer component
├── Submit interview flow

Week 7: Evaluation & Results
├── Auto-scoring
├── Scorecard form
├── Results page
├── Interview history
└── Team management (invite interviewers)

Week 8: Polish & Launch
├── Stripe integration
├── Error handling
├── Security hardening
├── Testing
├── Cloudflare deploy
└── Launch!
```

---

## Security Checklist

- [ ] Passwords hashed (BCrypt)
- [ ] JWT with expiration
- [ ] Role-based access control
- [ ] Interview tokens unguessable (12-char random)
- [ ] Docker sandbox isolation
- [ ] CORS configured
- [ ] Rate limiting
- [ ] HTTPS everywhere

---

## Testing Checklist

```
Auth Flow:
□ Company signup works
□ Login works
□ Admin can invite interviewer
□ Interviewer can accept invite
□ JWT refresh works

Interview Flow:
□ Create interview works
□ Copy link works
□ Candidate sees waiting screen
□ Interviewer sees candidate connected
□ Start interview transitions both screens
□ End interview works
□ Submit works

Coding Environment:
□ Monaco loads correctly
□ Language switch works
□ Code execution works (all 3 languages)
□ Tests run correctly
□ AI chat works
□ Timer works

Real-time:
□ Code syncs to interviewer
□ Test results sync
□ Status changes sync
□ Reconnection works

Evaluation:
□ Auto-score calculates
□ Scorecard saves
□ Results display correctly
```

---

*Last Updated: December 2025*
