# Task 7: Create Database Schema and All Tables

## Completed Database Schema

### Overview
Created complete database schema with 8 tables and relationships for the InterviewAI application. All tables are configured with JPA entities and proper constraints.

### Entity Classes Created

#### 1. Company Entity
**File**: `Company.java`

**Table**: `companies`

**Purpose**: Represents a company using the platform

**Fields**:
- `id` - UUID primary key
- `name` - Company name
- `email` - Unique company email
- `password` - Hashed password
- `industry` - Industry classification
- `employeeCount` - Number of employees
- `website` - Company website
- `logo` - Logo URL
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relationships**:
- One-to-Many: Company → Users (interviewers)
- One-to-Many: Company → Interviews
- One-to-Many: Company → Questions

---

#### 2. User Entity
**File**: `User.java`

**Table**: `users`

**Purpose**: Represents interviewers and hiring managers

**Fields**:
- `id` - UUID primary key
- `firstName` - First name
- `lastName` - Last name
- `email` - Unique email
- `password` - Hashed password
- `role` - ADMIN, INTERVIEWER, HIRING_MANAGER
- `avatar` - Avatar URL
- `isActive` - Account active status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `companyId` - FK to Company

**Relationships**:
- Many-to-One: User → Company
- One-to-Many: User → Interviews (as interviewer)
- One-to-Many: User → Evaluations (as evaluator)

---

#### 3. Candidate Entity
**File**: `Candidate.java`

**Table**: `candidates`

**Purpose**: Represents job candidates

**Fields**:
- `id` - UUID primary key
- `firstName` - First name
- `lastName` - Last name
- `email` - Unique email
- `phone` - Contact phone
- `resume` - Resume URL/path
- `linkedinUrl` - LinkedIn profile
- `portfolio` - Portfolio URL
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relationships**:
- One-to-Many: Candidate → Interviews

---

#### 4. Question Entity
**File**: `Question.java`

**Table**: `questions`

**Purpose**: Interview questions with test cases and rubrics

**Fields**:
- `id` - UUID primary key
- `title` - Question title
- `description` - Question description
- `language` - Programming language (java, python, javascript)
- `difficulty` - easy, medium, hard
- `testCases` - JSON formatted test cases
- `intentionalBugs` - JSON formatted intentional bugs
- `rubric` - JSON formatted evaluation rubric
- `companyId` - FK to Company
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relationships**:
- Many-to-One: Question → Company
- Many-to-Many: Question ↔ Interviews

---

#### 5. Interview Entity
**File**: `Interview.java`

**Table**: `interviews`

**Purpose**: Interview records

**Fields**:
- `id` - UUID primary key
- `title` - Interview title
- `description` - Interview description
- `language` - Programming language
- `status` - pending, in_progress, completed
- `startedAt` - Interview start time
- `completedAt` - Interview completion time
- `companyId` - FK to Company
- `candidateId` - FK to Candidate
- `interviewerId` - FK to User
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relationships**:
- Many-to-One: Interview → Company
- Many-to-One: Interview → Candidate
- Many-to-One: Interview → User (interviewer)
- One-to-Many: Interview → InterviewSessions
- One-to-Many: Interview → Evaluations
- Many-to-Many: Interview ↔ Questions

---

#### 6. InterviewSession Entity
**File**: `InterviewSession.java`

**Table**: `interview_sessions`

**Purpose**: Individual interview session recordings

**Fields**:
- `id` - UUID primary key
- `code` - Submitted code (TEXT)
- `language` - Programming language
- `chatHistory` - Chat messages (JSON)
- `startedAt` - Session start time
- `endedAt` - Session end time
- `interviewId` - FK to Interview
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relationships**:
- Many-to-One: InterviewSession → Interview

---

#### 7. Evaluation Entity
**File**: `Evaluation.java`

**Table**: `evaluations`

**Purpose**: Interview evaluations and scores

**Fields**:
- `id` - UUID primary key
- `codeScore` - Code quality score (0-100)
- `communicationScore` - Communication score (0-100)
- `problemSolvingScore` - Problem-solving score (0-100)
- `technicalScore` - Technical knowledge score (0-100)
- `finalScore` - Final overall score (0-100)
- `strengths` - Candidate strengths (TEXT)
- `weaknesses` - Areas for improvement (TEXT)
- `notes` - Evaluation notes (TEXT)
- `recommendation` - HIRE, REJECT, MAYBE
- `interviewId` - FK to Interview
- `evaluatedByUserId` - FK to User (evaluator)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relationships**:
- Many-to-One: Evaluation → Interview
- Many-to-One: Evaluation → User

---

### Database Schema Visualization

```
companies (1) ──┬──→ (Many) users
                ├──→ (Many) interviews
                └──→ (Many) questions

users (1) ──┬──→ (Many) interviews (as interviewer)
            └──→ (Many) evaluations (as evaluator)

candidates (1) ──→ (Many) interviews

interviews (1) ──┬──→ (Many) interview_sessions
                 ├──→ (Many) evaluations
                 └──→ (Many) questions (via junction table)

questions (M) ──→ (M) interviews (junction: interview_questions)

evaluations (M) ──→ (1) interview
```

### Tables and Constraints

| Table | Columns | Primary Key | Foreign Keys | Indexes |
|-------|---------|------------|--------------|---------|
| companies | 10 | id (UUID) | - | email (unique) |
| users | 11 | id (UUID) | company_id | company_id, email, status |
| candidates | 9 | id (UUID) | - | email |
| questions | 10 | id (UUID) | company_id | company_id |
| interviews | 12 | id (UUID) | company_id, candidate_id, interviewer_id | company_id, candidate_id, interviewer_id, status |
| interview_questions | 2 | (interview_id, question_id) | interview_id, question_id | - |
| interview_sessions | 8 | id (UUID) | interview_id | interview_id |
| evaluations | 13 | id (UUID) | interview_id, evaluated_by_user_id | interview_id, evaluated_by_user_id |

### JPA Features Implemented

1. **Annotations Used**:
   - `@Entity` - Mark as JPA entity
   - `@Table` - Specify table name
   - `@Id` - Primary key
   - `@GeneratedValue` - UUID generation
   - `@Column` - Column properties (nullable, unique)
   - `@ManyToOne` - Many-to-one relationships
   - `@OneToMany` - One-to-many relationships
   - `@ManyToMany` - Many-to-many relationships
   - `@JoinColumn` - Foreign key specification
   - `@JoinTable` - Junction table for many-to-many
   - `@PreUpdate` - Auto-update timestamp

2. **Cascade Options**:
   - `CascadeType.ALL` - Cascade all operations
   - `orphanRemoval = true` - Remove orphaned entities

3. **Column Definitions**:
   - `columnDefinition = "TEXT"` - Large text fields
   - `unique = true` - Unique constraints
   - `nullable = false` - NOT NULL constraints

### SQL Initialization Script

**File**: `init-scripts/02-schema.sql`

**Contains**:
- All table creation statements
- Proper data types (UUID, VARCHAR, TEXT, TIMESTAMP)
- Foreign key constraints with ON DELETE actions
- Performance indexes on frequently queried columns
- Unique constraints on email fields

### Build Status

✅ **Build Successful**: All JPA entities compile without errors

```
> Task :compileJava
> Task :processResources
> Task :classes
> Task :bootJar
> Task :jar
> Task :assemble
> Task :check
> Task :build

BUILD SUCCESSFUL in 10s
```

### Auto-schema Generation

With `spring.jpa.hibernate.ddl-auto=update` in application.yml:
- Hibernate automatically creates tables on application startup
- Existing tables are preserved
- New columns are added as needed
- Indexes from `02-schema.sql` can be applied separately

### Next Steps

1. Create repositories for database access
2. Create service layer for business logic
3. Create controllers for REST API endpoints
4. Add test data initialization
5. Add database migrations framework (Liquibase/Flyway)

### Entity Relationships Summary

- **Company** is the root entity that owns Users, Interviews, and Questions
- **User** represents interviewers and can conduct Interviews and create Evaluations
- **Candidate** participates in Interviews
- **Question** is used in Interviews
- **Interview** connects Company, Candidate, User, Questions, Sessions, and Evaluations
- **InterviewSession** records the actual interview data
- **Evaluation** scores the Interview

### Performance Optimizations

1. **UUID Primary Keys** - Better for distributed systems
2. **Indexes** - On all foreign keys and frequently queried columns
3. **Lazy Loading** - One-to-many relationships default to lazy
4. **Timestamps** - Auto-updated for audit trails
5. **Cascade Operations** - Proper cleanup on deletion

### Database Compatibility

- PostgreSQL 15+ (configured in docker-compose.yml)
- UUID type native support
- TIMESTAMP type with timezone support
- TEXT type for large content

## File Structure

```
backend/src/main/java/com/example/interviewAI/entity/
├── Company.java
├── User.java
├── Candidate.java
├── Question.java
├── Interview.java
├── InterviewSession.java
└── Evaluation.java

init-scripts/
├── 01-init.sql
└── 02-schema.sql
```

## Status

✅ All 7 JPA entities created with relationships
✅ Database schema designed with proper constraints
✅ SQL initialization script ready
✅ Build compiles successfully
✅ Ready for repository and service layer implementation
✅ Task 7 marked as complete in Jira
