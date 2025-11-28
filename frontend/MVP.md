# MVP Specification & Build Plan

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
- ❌ No video integration (use external Zoom)
- ❌ No custom questions (5 pre-built questions only)

---

## Architecture Changes Summary

> **Key optimizations made for solo developer on a budget:**

| Component | Original | Updated | Savings |
|-----------|----------|---------|---------|
| **Hosting** | Railway ($20-50/mo) | Hetzner VPS CX32 ($9/mo) | ~70% |
| **Frontend** | Railway | Cloudflare Pages (FREE) | 100% |
| **AI Model** | Claude Sonnet | Claude Haiku 4.5 | ~70% |
| **Email** | SendGrid | Resend | Better free tier |
| **Code Sandbox** | Node.js subprocess | Docker containers | Multi-language |
| **Database** | Railway managed | Docker PostgreSQL | Included in VPS |

**Estimated Monthly Cost: ~$15-25** (down from $70-100+)

---

## MVP Feature List

### ✅ MUST HAVE (Required for Launch)

**Authentication & User Management:**
- [ ] Company signup/login (email + password)
- [ ] Interviewer signup/login (invite-based)
- [ ] Candidate access (magic link, no signup required)
- [ ] Basic role-based access control (admin, interviewer, candidate)
- [ ] Password reset flow

**Company Dashboard:**
- [ ] Create interview (select question, assign interviewer, enter candidate info)
- [ ] View list of interviews (scheduled, completed, in-progress)
- [ ] View interview results
- [ ] Add/invite interviewers to team

**Interview Scheduling:**
- [ ] Create interview and send email to candidate
- [ ] Generate unique interview link
- [ ] Email notifications (invite, reminder, completion) via Resend

**Interview Room (Core Product):**
- [ ] Code editor (Monaco) with syntax highlighting for Java, Python, JavaScript
- [ ] AI chat interface (Claude Haiku 4.5 integration)
- [ ] Shared view (interviewer sees candidate's code in real-time)
- [ ] Run code button (Docker sandbox execution)
- [ ] Language selector (Java, Python, JavaScript)
- [ ] Timer display (30 min countdown)
- [ ] Submit button

**AI Assistant:**
- [ ] Claude Haiku 4.5 API integration (cost-optimized)
- [ ] System prompt engineering (helpful but imperfect)
- [ ] Intentional bugs in responses (per question)
- [ ] Conversation logging

**Code Execution Sandbox (Docker-based):**
- [ ] Docker container isolation per execution
- [ ] Java sandbox (eclipse-temurin:21-jdk-alpine)
- [ ] Python sandbox (python:3.12-alpine)
- [ ] JavaScript sandbox (node:20-alpine)
- [ ] Security hardening (no network, read-only, resource limits)

**Automated Testing:**
- [ ] Test runner executing predefined tests in sandbox
- [ ] Test results displayed to interviewer (real-time)
- [ ] Pass/fail status per test
- [ ] Automated score calculation (60 points max)

**Evaluation & Scoring:**
- [ ] Interviewer scorecard form (manual assessment)
- [ ] Rubric with 4 categories (Understanding, Problem Solving, AI Collab, Communication)
- [ ] Final score calculation (automated + manual)
- [ ] Submit evaluation

**Results & Reporting:**
- [ ] Individual interview report page
- [ ] Display: code, conversation, scores, notes, recommendation
- [ ] Candidate list/comparison table (basic)

**Question Library:**
- [ ] 3-5 pre-built questions with tests (multi-language)
- [ ] Shopping Cart API
- [ ] URL Shortener
- [ ] Task Manager

**Billing (Basic):**
- [ ] Stripe integration (subscribe to Starter plan)
- [ ] Payment method collection
- [ ] Basic subscription management

---

### 🔶 NICE TO HAVE (If Time Permits)

- [ ] Real-time code sync (WebSockets)
- [ ] Code autosave every 30 seconds
- [ ] Interviewer notes panel in interview room
- [ ] Export report as PDF
- [ ] Basic analytics dashboard (total interviews, avg score)
- [ ] Email reminders 1 day before interview

---

### ❌ NOT IN MVP (Explicitly Cut)

- Video/audio integration (use external Zoom)
- Recording storage
- Custom question builder
- Additional languages beyond Java/Python/JavaScript
- Advanced analytics
- SSO
- API access
- Mobile app
- Interviewer training modules
- Candidate feedback form
- Scheduling calendar integration
- AWS Lambda (using Docker instead - simpler, no cold starts)

---

## Technical Architecture (MVP)

### Frontend Stack

**Framework:** React 18 + TypeScript + Vite
**Hosting:** Cloudflare Pages (FREE)

**Key Libraries:**
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
  "socket.io-client": "^4.6.0"
}
```

**File Structure:**
```
/frontend
  /src
    /components
      /auth (Login, Signup, ResetPassword)
      /dashboard (CompanyDashboard, InterviewList)
      /interview (InterviewRoom, CodeEditor, AIChat, TestResults)
      /evaluation (ScorecardForm)
      /common (Button, Input, Modal, etc.)
    /pages
      /LoginPage.tsx
      /DashboardPage.tsx
      /InterviewPage.tsx
      /ResultsPage.tsx
    /hooks
      /useAuth.ts
      /useInterview.ts
    /api
      /client.ts (axios setup)
      /endpoints.ts
    /store
      /authStore.ts
      /interviewStore.ts
    /utils
      /constants.ts
      /helpers.ts
    App.tsx
    main.tsx
```

---

### Backend Stack (Java)

**Framework:** Spring Boot 3.2+ with Java 17
**Hosting:** Hetzner VPS CX32 (4 vCPU, 8GB RAM, 80GB SSD) - ~$9/month

**Key Dependencies:**
```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.12.3</version>
    </dependency>
    
    <!-- HTTP Client (for Claude API) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
    
    <!-- Email (Resend uses REST API, no special dependency needed) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    
    <!-- Docker Java Client (for sandbox) -->
    <dependency>
        <groupId>com.github.docker-java</groupId>
        <artifactId>docker-java-core</artifactId>
        <version>3.3.4</version>
    </dependency>
    <dependency>
        <groupId>com.github.docker-java</groupId>
        <artifactId>docker-java-transport-httpclient5</artifactId>
        <version>3.3.4</version>
    </dependency>
</dependencies>
```

**Project Structure:**
```
/backend
  /src/main/java/com/aiinterview
    /config
      SecurityConfig.java
      WebSocketConfig.java
      CorsConfig.java
      DockerConfig.java          # NEW: Docker client configuration
    /controller
      AuthController.java
      CompanyController.java
      InterviewController.java
      InterviewSessionController.java
      QuestionController.java
      EvaluationController.java
      CodeExecutionController.java  # NEW: Code execution endpoint
    /service
      AuthService.java
      InterviewService.java
      AIService.java             # Claude Haiku 4.5 integration
      SandboxExecutorService.java  # NEW: Docker sandbox execution
      TestRunnerService.java
      ScoringService.java
      EmailService.java          # Updated for Resend
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
        Candidate.java
        Interview.java
        InterviewSession.java
        Question.java
        TestResult.java
        Evaluation.java
      /dto
        InterviewCreateRequest.java
        InterviewResponse.java
        ChatMessageRequest.java
        EvaluationSubmitRequest.java
        CodeExecutionRequest.java   # NEW
        CodeExecutionResponse.java  # NEW
      /enums
        Language.java              # NEW: JAVA, PYTHON, JAVASCRIPT
    /security
      JwtTokenProvider.java
      UserDetailsServiceImpl.java
    /sandbox                       # NEW: Sandbox package
      DockerSandboxManager.java
      SandboxSecurityConfig.java
    /websocket
      InterviewWebSocketHandler.java
  /src/main/resources
    application.yml
    questions/ (JSON files with question data)
  /sandbox                         # NEW: Docker sandbox files
    /java
      Dockerfile
      java-runner.sh
    /python
      Dockerfile
      python-runner.py
    /javascript
      Dockerfile
      node-runner.js
```

---

### Database Schema (PostgreSQL)

```sql
-- Companies
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users (Interviewers & Admins)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'interviewer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Candidates
CREATE TABLE candidates (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions (updated with intentional_bugs_json)
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL, -- 'easy', 'medium', 'hard'
    time_limit_minutes INT DEFAULT 30,
    supported_languages VARCHAR(255) DEFAULT 'java,python,javascript',  -- NEW
    requirements_json JSONB NOT NULL,
    tests_json JSONB NOT NULL,
    rubric_json JSONB NOT NULL,
    intentional_bugs_json JSONB,  -- NEW: Per-question AI bug injection
    initial_code_java TEXT,       -- NEW: Language-specific starter code
    initial_code_python TEXT,     -- NEW
    initial_code_javascript TEXT, -- NEW
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interviews (updated with language field)
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id),
    question_id BIGINT REFERENCES questions(id),
    candidate_id BIGINT REFERENCES candidates(id),
    interviewer_id BIGINT REFERENCES users(id),
    language VARCHAR(50) DEFAULT 'javascript',  -- NEW: Selected language
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    interview_link_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Sessions (stores the actual interview data)
CREATE TABLE interview_sessions (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id) UNIQUE,
    code_snapshot TEXT,
    language VARCHAR(50),  -- NEW: Language used
    conversation_log JSONB,
    test_results JSONB,
    automated_score INT,
    manual_score INT,
    final_score INT,
    interviewer_notes TEXT,
    recommendation VARCHAR(50), -- 'hire', 'no_hire', 'maybe'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations (detailed rubric scores)
CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    interview_session_id BIGINT REFERENCES interview_sessions(id),
    understanding_score INT,
    problem_solving_score INT,
    ai_collaboration_score INT,
    communication_score INT,
    strengths TEXT,
    weaknesses TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_interviews_company ON interviews(company_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_interviews_link_token ON interviews(interview_link_token);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
```

---

### External Services

**1. Claude API (Anthropic) - UPDATED**
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-haiku-4-5-20251001` (cost-optimized)
- Usage: AI assistant in interview room
- Cost: ~$1 per 1M input tokens, ~$5 per 1M output tokens
- Estimated: **~$0.06 per interview** (down from $0.50-1.00)

**2. Resend (Email) - CHANGED FROM SENDGRID**
- Transactional emails (invites, reminders, results)
- Free tier: 3,000 emails/month (vs SendGrid's 100/day)
- Simple REST API
- React Email templates support

**3. Stripe (Payments)**
- Subscription management
- Fee: 2.9% + $0.30 per transaction
- No monthly fee

**4. Hosting - UPDATED**
- Backend: Hetzner VPS CX32 (~$9/month)
- Frontend: Cloudflare Pages (FREE)
- Database: PostgreSQL in Docker on VPS (included)
- **Total: ~$9-10/month** (down from $50-100)

**5. Cloudflare (CDN & Frontend) - NEW**
- Static site hosting (FREE)
- Global CDN
- Automatic SSL
- DDoS protection

---

## Code Execution Strategy

**Solution: Docker Container Sandbox**

> Chosen over AWS Lambda because:
> - No cold starts (especially important for Java)
> - Zero marginal cost (included in VPS)
> - Full control over execution environment
> - Simpler debugging and development
> - Multi-language support with consistent behavior

### Docker Images

**Java Sandbox (Dockerfile.java):**
```dockerfile
FROM eclipse-temurin:21-jdk-alpine

# Create non-root user for security
RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

WORKDIR /app

COPY java-runner.sh /app/runner.sh
RUN chmod +x /app/runner.sh

USER sandbox

ENTRYPOINT ["/app/runner.sh"]
```

**Python Sandbox (Dockerfile.python):**
```dockerfile
FROM python:3.12-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

WORKDIR /app

COPY python-runner.py /app/runner.py

USER sandbox

ENTRYPOINT ["python", "/app/runner.py"]
```

**JavaScript Sandbox (Dockerfile.node):**
```dockerfile
FROM node:20-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox

WORKDIR /app

COPY node-runner.js /app/runner.js

USER sandbox

ENTRYPOINT ["node", "/app/runner.js"]
```

### Sandbox Executor Service

```java
@Service
@Slf4j
public class SandboxExecutorService {
    
    private final DockerClient dockerClient;
    
    // Container configuration
    private static final long MEMORY_LIMIT = 128 * 1024 * 1024; // 128MB
    private static final long CPU_PERIOD = 100000L;
    private static final long CPU_QUOTA = 50000L; // 50% of one CPU
    private static final int TIMEOUT_SECONDS = 10;
    
    // Pre-built images for each language
    private static final Map<Language, String> IMAGES = Map.of(
        Language.JAVA, "interview-sandbox-java:21",
        Language.PYTHON, "interview-sandbox-python:3.12",
        Language.JAVASCRIPT, "interview-sandbox-node:20"
    );
    
    public ExecutionResult execute(Language language, String code, List<TestCase> tests) {
        String containerId = null;
        
        try {
            // 1. Create container with strict limits
            CreateContainerResponse container = dockerClient.createContainerCmd(IMAGES.get(language))
                .withHostConfig(HostConfig.newHostConfig()
                    .withMemory(MEMORY_LIMIT)
                    .withMemorySwap(MEMORY_LIMIT)     // Prevent swap
                    .withCpuPeriod(CPU_PERIOD)
                    .withCpuQuota(CPU_QUOTA)
                    .withNetworkMode("none")          // No network access
                    .withReadonlyRootfs(true)         // Read-only filesystem
                    .withSecurityOpts(List.of("no-new-privileges:true"))
                    .withCapDrop(Capability.ALL)      // Drop all capabilities
                    .withPidsLimit(50L)               // Limit processes
                )
                .withUser("sandbox")
                .exec();
            
            containerId = container.getId();
            
            // 2. Copy code and tests to container
            copyToContainer(containerId, buildPayload(language, code, tests));
            
            // 3. Start and wait with timeout
            dockerClient.startContainerCmd(containerId).exec();
            
            WaitContainerResultCallback callback = new WaitContainerResultCallback();
            dockerClient.waitContainerCmd(containerId).exec(callback);
            
            boolean finished = callback.awaitCompletion(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
            if (!finished) {
                dockerClient.killContainerCmd(containerId).exec();
                return ExecutionResult.timeout();
            }
            
            // 4. Collect and parse results
            String output = collectLogs(containerId);
            return parseResults(output, tests);
            
        } catch (Exception e) {
            log.error("Execution failed", e);
            return ExecutionResult.error(e.getMessage());
        } finally {
            // 5. Always cleanup
            if (containerId != null) {
                try {
                    dockerClient.removeContainerCmd(containerId)
                        .withForce(true)
                        .withRemoveVolumes(true)
                        .exec();
                } catch (Exception e) {
                    log.warn("Failed to cleanup container: {}", containerId);
                }
            }
        }
    }
}
```

### Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    SANDBOX SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: CONTAINER ISOLATION                                    │
│  ├── Network: none (--network=none)                              │
│  ├── Filesystem: read-only root                                  │
│  ├── User: non-root (sandbox user)                               │
│  └── Capabilities: ALL dropped                                   │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: RESOURCE LIMITS                                        │
│  ├── Memory: 128MB hard limit (no swap)                          │
│  ├── CPU: 50% of 1 core                                          │
│  ├── Disk: No writable volumes                                   │
│  └── PIDs: Max 50 processes                                      │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: TIME LIMITS                                            │
│  ├── Execution timeout: 10 seconds                               │
│  ├── Per-test timeout: 2 seconds                                 │
│  └── Container lifetime: 30 seconds max                          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: RATE LIMITING                                          │
│  ├── Max 20 executions per interview                             │
│  └── Max 5 concurrent containers                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Integration Strategy

**Model: Claude Haiku 4.5** (cost-optimized)

**System Prompt Engineering:**

```java
@Service
public class AIService {
    
    private static final String MODEL = "claude-haiku-4-5-20251001";
    
    private static final String SYSTEM_PROMPT = """
        You are an AI coding assistant helping a candidate during a technical interview.
        
        Guidelines:
        1. Be helpful and provide working code suggestions
        2. Respond quickly (keep responses concise)
        3. Do NOT volunteer best practices unless asked
        4. When asked for validation, provide a weak but plausible solution first
        5. When asked for tests, provide only happy path tests initially
        6. Only improve when explicitly asked for better solutions
        7. Be confident in your suggestions (don't say "this might not be perfect")
        
        You are intentionally imperfect to test if the candidate:
        - Reviews your code critically
        - Catches weak implementations
        - Asks for improvements
        - Tests edge cases
        
        Common intentional mistakes to make:
        - Weak validation (e.g., checking if string contains 'http' instead of proper URL parsing)
        - Missing edge case handling (null, empty, negative numbers)
        - Incomplete error handling
        - Basic tests that don't cover edge cases
        
        IMPORTANT: Keep responses concise to minimize token usage.
        """;
    
    public String chat(String question, String userMessage, List<Message> history) {
        // Call Claude Haiku 4.5 API
        // Inject intentional bugs based on question type
        // Log conversation
        // Return AI response
    }
}
```

**Per-Question Bug Injection:**

```json
{
  "questionId": "shopping-cart",
  "intentionalBugs": [
    {
      "trigger": "user asks for validation",
      "bug": "Suggest checking if quantity > 0, but don't check for null/undefined"
    },
    {
      "trigger": "user asks for discount",
      "bug": "Implement discount as `total - 10` instead of `total * 0.9`"
    }
  ]
}
```

---

## Deployment Strategy

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                       │
│                                                                  │
│  ┌─────────────────────────────────┐                            │
│  │     CLOUDFLARE (FREE)           │                            │
│  │  • Pages (Frontend hosting)     │                            │
│  │  • CDN + SSL + DDoS protection  │                            │
│  └───────────────┬─────────────────┘                            │
│                  │                                               │
│                  ▼                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          HETZNER VPS - CX32 (~$9/mo)                    │    │
│  │                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │   Nginx     │  │ Spring Boot │  │ PostgreSQL  │      │    │
│  │  │   Proxy     │  │   Backend   │  │  Database   │      │    │
│  │  │   + SSL     │  │  Port 8080  │  │  Port 5432  │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              DOCKER SANDBOX POOL                 │    │    │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │    │    │
│  │  │  │  Java   │  │ Python  │  │  Node   │          │    │    │
│  │  │  │ Sandbox │  │ Sandbox │  │ Sandbox │          │    │    │
│  │  │  └─────────┘  └─────────┘  └─────────┘          │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │  Specs: 4 vCPU, 8GB RAM, 80GB SSD                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  EXTERNAL SERVICES                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ Claude API │  │   Resend   │  │   Stripe   │                 │
│  │ (Haiku4.5) │  │   (Email)  │  │ (Payments) │                 │
│  │  ~$10/mo   │  │    FREE    │  │ Pay-as-go  │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Docker Compose (Production)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

  # Spring Boot Backend
  backend:
    build: ./backend
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://postgres:5432/interview
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # For sandbox containers
    depends_on:
      - postgres
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=interview
      - POSTGRES_USER=interview
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL=jdbc:postgresql://postgres:5432/interview
DB_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-key
CLAUDE_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://app.yourdomain.com

# Frontend (Cloudflare Pages environment)
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### VPS Setup Commands

```bash
# 1. Initial server setup
ssh root@your-server-ip
apt update && apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Install Docker Compose
apt install docker-compose-plugin -y

# 4. Create deploy user
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# 5. Setup firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 6. Disable root login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd

# 7. Build sandbox images (one-time)
docker build -t interview-sandbox-java:21 ./sandbox/java
docker build -t interview-sandbox-python:3.12 ./sandbox/python
docker build -t interview-sandbox-node:20 ./sandbox/javascript
```

### Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Deploying AI Interview Platform..."

cd /home/deploy/interview-platform

# Pull latest code
git pull origin main

# Build backend
echo "📦 Building backend..."
cd backend
./mvnw clean package -DskipTests
cd ..

# Build and restart services
echo "🐳 Rebuilding containers..."
docker compose build
docker compose down
docker compose up -d

echo "✅ Deployment complete!"
```

---

## Cost Breakdown

### Monthly Costs (MVP Phase)

| Service | Cost | Notes |
|---------|------|-------|
| **Hetzner VPS CX32** | $9.10 | 4 vCPU, 8GB RAM, 80GB SSD |
| **Cloudflare Pages** | $0 | Frontend hosting + CDN |
| **Claude Haiku 4.5** | ~$3-10 | ~50 interviews/month @ $0.06 each |
| **Resend** | $0 | 3,000 emails/month free |
| **Stripe** | $0 base | 2.9% + $0.30 per transaction |
| **Domain** | ~$1 | ~$12/year amortized |
| **Sentry** | $0 | Free tier (5,000 events) |
| | | |
| **TOTAL** | **~$13-20/mo** | |

### Cost Per Interview

| Component | Cost |
|-----------|------|
| AI (Claude Haiku 4.5) | ~$0.06 |
| Code Execution (Docker) | ~$0.00 (included in VPS) |
| Email (3 emails) | ~$0.00 (free tier) |
| **Total per interview** | **~$0.06** |

### Scaling Projections

| Interviews/Month | AI Cost | VPS | Total |
|------------------|---------|-----|-------|
| 50 | $3 | $9 | ~$12 |
| 100 | $6 | $9 | ~$15 |
| 500 | $30 | $9 | ~$40 |
| 1,000 | $60 | $18* | ~$80 |

*Upgrade to CX42 for higher concurrent load

---

## Testing Strategy (MVP)

**Manual Testing Priority:**
- [ ] Complete user flow (signup → create interview → conduct → evaluate)
- [ ] All core features work
- [ ] Multi-language code execution (Java, Python, JavaScript)
- [ ] No critical bugs

**Automated Testing (Nice to have):**
- Unit tests for critical services (SandboxExecutor, Scoring)
- Integration tests for API endpoints
- E2E test for interview flow (Playwright/Cypress)

**Testing Checklist:**
```
Company Flow:
□ Signup and login works
□ Can create interview (select language)
□ Can invite interviewer
□ Email sent to candidate (via Resend)
□ Can view results

Interview Flow:
□ Candidate can access via link (no login)
□ Code editor loads with correct language
□ AI chat responds (Claude Haiku 4.5)
□ Code execution works (Docker sandbox)
□ Tests run and show results
□ Timer counts down
□ Submit works

Code Execution:
□ Java code runs correctly
□ Python code runs correctly
□ JavaScript code runs correctly
□ Timeout works (10 seconds)
□ Memory limit works (128MB)
□ No network access from sandbox
□ Container cleanup works

Interviewer Flow:
□ Can see candidate's code in real-time
□ Test results update live
□ Can fill out scorecard
□ Score calculates correctly
□ Report generates
```

---

## Security Checklist

**MVP Security Requirements:**

**Authentication:**
- [ ] Passwords hashed (BCrypt)
- [ ] JWT tokens with expiration
- [ ] Secure password reset flow
- [ ] Rate limiting on auth endpoints

**Authorization:**
- [ ] Role-based access control
- [ ] Users can only access their company's data
- [ ] Interviewers can only see assigned interviews
- [ ] Candidates can only access their interview (via token)

**Code Execution (Docker Sandbox):**
- [ ] Container isolation (no network, read-only fs)
- [ ] Timeout limits (10 seconds)
- [ ] Memory limits (128MB)
- [ ] CPU limits (50% of 1 core)
- [ ] Non-root user execution
- [ ] All capabilities dropped
- [ ] Process limits (max 50 PIDs)
- [ ] Container cleanup after execution
- [ ] Rate limiting (max 20 executions per interview)

**API Security:**
- [ ] CORS properly configured
- [ ] CSRF protection
- [ ] SQL injection prevention (using JPA)
- [ ] XSS prevention (React handles this)
- [ ] Rate limiting on expensive endpoints

**Infrastructure:**
- [ ] HTTPS everywhere (Let's Encrypt via Nginx)
- [ ] SSH key authentication only
- [ ] Firewall configured (UFW)
- [ ] Docker socket access controlled
- [ ] Regular security updates

**Data Privacy:**
- [ ] Sensitive data encrypted at rest
- [ ] Interview links expire after use/time
- [ ] GDPR compliance basics (user data deletion)

---

## Performance Requirements (MVP)

**Target Metrics:**
- Page load: <3 seconds
- API response time: <500ms (p95)
- Code execution: <10 seconds (including container startup)
- AI response: <3 seconds
- Support: 10 concurrent interviews minimum

**Optimization Strategy:**
- Database indexing on foreign keys
- Pre-built Docker images (no build time during execution)
- CDN for static assets (Cloudflare)
- Lazy loading for code editor
- WebSocket for real-time updates

---

## Monitoring & Analytics (MVP)

**Must Track:**
- [ ] Error rate (Sentry)
- [ ] API performance (response times)
- [ ] Interview completion rate
- [ ] User signups and conversions
- [ ] Container execution metrics

**Tools:**
- Sentry (error tracking) - FREE
- PostHog (product analytics) - FREE tier
- Uptime monitoring (UptimeRobot or similar) - FREE

**Key Events to Track:**
```
- company_signup
- interview_created
- interview_started
- interview_completed
- interview_abandoned (didn't finish)
- code_execution (language, duration, success)
- evaluation_submitted
- subscription_created
```

---

## Launch Checklist

**Before Launch:**
- [ ] All core features work end-to-end
- [ ] Manual testing completed
- [ ] Security audit (basic)
- [ ] Terms of Service written
- [ ] Privacy Policy written
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Email templates created and tested (Resend)
- [ ] Stripe test mode → live mode
- [ ] Error monitoring set up (Sentry)
- [ ] Analytics set up (PostHog)
- [ ] Docker sandbox images built and tested
- [ ] 5 beta testers lined up

**Launch Day:**
- [ ] Deploy to production (Hetzner VPS)
- [ ] Deploy frontend (Cloudflare Pages)
- [ ] Smoke test in production
- [ ] Monitor error rates
- [ ] Be available for support

**Week 1 After Launch:**
- [ ] Daily check of error logs
- [ ] Respond to user feedback
- [ ] Fix critical bugs
- [ ] Monitor usage metrics
- [ ] Monitor container resource usage

---

## Development Timeline (8 Weeks)

```
Week 1-2: Foundation
├── Setup Hetzner VPS + Docker
├── Setup local development with Docker Compose
├── Basic Spring Boot + Auth
├── React app + routing
└── Create Java sandbox container

Week 3-4: Core Interview
├── Interview room UI (Monaco)
├── Claude Haiku 4.5 integration
├── WebSocket for real-time sync
├── Java code execution working
└── Add Python + JavaScript sandboxes

Week 5-6: Testing & Scoring
├── Test runner implementation
├── Automated scoring
├── Interviewer scorecard
├── Results page
└── Email notifications (Resend)

Week 7-8: Polish & Launch
├── Stripe integration
├── Cloudflare Pages deploy
├── Nginx + SSL setup
├── Security hardening
├── Testing + bug fixes
└── Launch!
```

---

## Quick Reference Commands

```bash
# Local Development
docker compose up -d                    # Start all services
docker compose logs -f backend          # View backend logs
docker compose down                     # Stop all services

# Sandbox Testing
docker run --rm -it interview-sandbox-java:21    # Test Java sandbox
docker run --rm -it interview-sandbox-python:3.12 # Test Python sandbox
docker run --rm -it interview-sandbox-node:20     # Test Node sandbox

# Production Deployment
ssh deploy@your-server-ip               # Connect to VPS
./deploy.sh                             # Run deployment
docker compose logs -f                  # View logs
docker ps -a                            # Check containers

# Database
docker exec -it postgres psql -U interview -d interview  # Connect to DB

# Monitoring
htop                                    # Server resources
docker stats                            # Container resources
```

---

**END OF MVP SPECIFICATION**

This document defines the scope and technical approach for the Minimum Viable Product.
- **Focus:** Ship working product in 8 weeks, get feedback, iterate.
- **Budget:** ~$15-25/month operational costs
- **Tech:** Docker containers, Hetzner VPS, Cloudflare Pages, Claude Haiku 4.5

*Last Updated: November 2025*
