# Question Backup & Restore System

This directory contains JSON backup files for interview questions and utilities to export/restore them.

## Directory Structure

```
question-backups/
├── README.md                          # This file
├── restore-questions.sql              # SQL script to restore questions
├── question-rate-limiter.json         # Backup: Rate Limiter question
├── question-two-sum.json              # Backup: Two Sum question
├── question-binary-search.json        # Backup: Binary Search question
└── [more question backups...]
```

## Quick Start

### Restore All Questions (Java Method - Recommended)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--restore-questions"
```

### Export All Questions to Backup

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--export-questions"
```

---

## Backup File Format

Each JSON backup file contains:

```json
{
  "question": {
    "companyId": null,
    "createdBy": 1,
    "title": "Question Title",
    "description": "Full markdown description...",
    "shortDescription": "Brief summary",
    "category": "algorithm|backend|frontend|...",
    "difficulty": "easy|medium|hard",
    "timeLimitMinutes": 30,
    "primaryLanguage": "java",
    "supportedLanguages": "java,python,javascript",
    "initialCodeJava": "public class Solution { ... }",
    "initialCodePython": "class Solution: ...",
    "initialCodeJavascript": "var solution = function() { ... }",
    "testsJson": "[{...}]",
    "aiPromptTemplate": "helpful|minimal",
    "aiHelperName": "Expert Name",
    "status": "PUBLISHED|DRAFT|ARCHIVED",
    "version": 1,
    ...
  },
  "followUpQuestions": [
    {
      "questionText": "Follow-up question text",
      "answer": "Expected answer/guidance",
      "orderIndex": 0
    }
  ],
  "testCases": [
    {
      "testName": "Test name",
      "testCase": "Test code",
      "description": "What this test validates",
      "operationsJson": "[...]",
      "assertionsJson": "[...]",
      "orderIndex": 0,
      "passed": false
    }
  ]
}
```

---

## Restore Methods

### Method 1: Java-Based Restore (Recommended)

**Restore All Questions:**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--restore-questions"
```

**Restore Specific Question by Title:**
```java
@Autowired
private QuestionBackupRestorer restorer;

// In your code:
restorer.restoreQuestionByTitle("Two Sum");
```

**Restore from Custom File:**
```java
@Autowired
private QuestionBackupRestorer restorer;

// In your code:
restorer.restoreFromFile("classpath:question-backups/question-custom.json");
```

**Features:**
- ✅ Automatically checks for duplicates (skips if title exists)
- ✅ Validates JSON structure
- ✅ Creates all relationships (follow-up questions, test cases)
- ✅ Sets timestamps automatically
- ✅ Detailed logging

### Method 2: SQL-Based Restore

```bash
# From command line
psql -U postgres -d interviewai_db -f src/main/resources/question-backups/restore-questions.sql

# Or from DBeaver/pgAdmin
# Open restore-questions.sql and execute
```

**Features:**
- ✅ Works without starting the application
- ✅ Uses ON CONFLICT DO NOTHING to avoid duplicates
- ✅ Direct database insertion
- ⚠️ Requires PostgreSQL client

---

## Export Methods

### Export All Questions

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--export-questions"
```

This will:
1. Create individual JSON files for each question
2. Save them to `src/main/resources/question-backups/`
3. Use kebab-case filenames: `question-{title-kebab-case}.json`
4. Include all relationships (follow-up questions, test cases)

### Export Specific Question

**By Title:**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--export-question=Two Sum"
```

**Programmatically:**
```java
@Autowired
private QuestionBackupExporter exporter;

// By title
exporter.exportQuestionByTitle("Two Sum");

// By ID
exporter.exportQuestionById(1L);

// Custom export
Question question = questionRepository.findById(id).orElseThrow();
exporter.exportQuestion(question);
```

---

## Common Use Cases

### 1. Regular Backups (Scheduled Task)

Create a scheduled task to export all questions daily:

```java
@Scheduled(cron = "0 0 2 * * *") // 2 AM daily
public void scheduledBackup() {
    try {
        questionBackupExporter.exportAllQuestions();
        logger.info("Scheduled backup completed successfully");
    } catch (Exception e) {
        logger.error("Scheduled backup failed", e);
    }
}
```

### 2. Question Recovery

If a question gets accidentally modified or deleted:

```bash
# 1. Restore from backup
mvn spring-boot:run -Dspring-boot.run.arguments="--restore-questions"

# 2. Or restore specific question via SQL
psql -U postgres -d interviewai_db -c "
  -- Delete corrupted question first if needed
  DELETE FROM questions WHERE title = 'Two Sum';
  -- Then run restore-questions.sql
"
```

### 3. Migrating Questions Between Environments

**Development → Production:**

```bash
# 1. Export from dev
cd dev-environment/backend
mvn spring-boot:run -Dspring-boot.run.arguments="--export-questions"

# 2. Copy JSON files to production
scp src/main/resources/question-backups/*.json production:/path/to/backups/

# 3. Restore in production
cd production/backend
mvn spring-boot:run -Dspring-boot.run.arguments="--restore-questions"
```

### 4. Version Control

Track question changes in Git:

```bash
# Add question backups to version control
git add src/main/resources/question-backups/*.json
git commit -m "Backup: Updated Two Sum question with new test cases"
git push
```

---

## Adding New Questions to Backup

### Option 1: Create Manually

1. Copy an existing JSON file (e.g., `question-two-sum.json`)
2. Modify all fields for your new question
3. Save as `question-{your-title}.json`
4. Add filename to `QuestionBackupRestorer.java` in the `backupFiles` array:

```java
String[] backupFiles = {
    "question-rate-limiter.json",
    "question-two-sum.json",
    "question-binary-search.json",
    "question-your-new-question.json"  // Add this line
};
```

### Option 2: Export Existing Question

```bash
# Create question in UI/database first, then:
mvn spring-boot:run -Dspring-boot.run.arguments="--export-question=Your Question Title"

# Add to backup list in QuestionBackupRestorer.java
```

---

## Troubleshooting

### Question Already Exists Error

```
Question 'Two Sum' already exists, skipping
```

**Solution:** This is normal behavior. The restore skips duplicates. If you want to replace:

```sql
-- Delete existing question first
DELETE FROM questions WHERE title = 'Two Sum';

-- Then restore
```

### JSON Parse Error

```
Failed to restore question-custom.json: Unexpected character...
```

**Solution:** Validate your JSON:
```bash
# Use jq to validate and pretty-print
cat question-custom.json | jq .

# Or use online validator: jsonlint.com
```

### Missing Required Fields

```
Column 'title' cannot be null
```

**Solution:** Ensure all required fields are present:
- `title` (required)
- `description` (required)
- `difficulty` (required)
- `status` (defaults to "PUBLISHED")

### Foreign Key Violations

```
ERROR: insert or update on table "questions" violates foreign key constraint
```

**Solution:** Check that referenced entities exist:
- `companyId` must exist in `companies` table (or be null)
- `createdBy` must exist in `users` table (or be null)
- `agentTemplateId` must exist in `agent_templates` table (or be null)

---

## Best Practices

1. **Regular Backups**
   - Export questions after significant changes
   - Consider automated daily exports
   - Store backups in version control

2. **Naming Conventions**
   - Use kebab-case for filenames: `question-two-sum.json`
   - Keep titles concise and descriptive
   - Avoid special characters in titles

3. **Testing Backups**
   - Test restore on staging environment first
   - Verify all relationships are preserved
   - Check that tests and follow-ups are intact

4. **Documentation**
   - Include `shortDescription` for quick reference
   - Use markdown formatting in `description`
   - Document expected answers in follow-up questions

5. **Version Control**
   - Commit backups to Git after changes
   - Use meaningful commit messages
   - Tag releases with version numbers

---

## API Reference

### QuestionBackupRestorer

```java
public class QuestionBackupRestorer {
    // Restore all backup files
    void restoreAllBackups()

    // Restore from specific file
    boolean restoreFromFile(String resourcePath) throws IOException

    // Restore by question title
    boolean restoreQuestionByTitle(String questionTitle) throws IOException
}
```

### QuestionBackupExporter

```java
public class QuestionBackupExporter {
    // Export all questions
    void exportAllQuestions() throws IOException

    // Export single question
    void exportQuestion(Question question) throws IOException

    // Export by title
    void exportQuestionByTitle(String title) throws IOException

    // Export by ID
    void exportQuestionById(Long id) throws IOException
}
```

---

## Database Schema Reference

**Main Tables:**
- `questions` - Main question data
- `follow_up_questions` - Interviewer guidance questions
- `test_cases` - Automated test cases
- `agent_templates` - AI assistant configurations

**Key Relationships:**
- Question → FollowUpQuestions (OneToMany, cascade delete)
- Question → TestCases (OneToMany, cascade delete)
- Question → AgentTemplate (ManyToOne, optional)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs: `logs/spring.log`
3. Verify database schema matches entities
4. Check JSON structure against examples

---

## File Manifest

Current backup files:
- ✅ `question-rate-limiter.json` - Hard backend question (thread-safe implementation)
- ✅ `question-rate-limiter-actual.json` - Medium backend question (from your seeder)
- ✅ `question-two-sum.json` - Easy algorithm question (hash map approach)
- ✅ `question-binary-search.json` - Easy algorithm question (O(log n) search)
- ✅ `question-log-system.json` - Medium data structures question (time-range queries)
- 📝 Add your custom questions here...

Last updated: 2026-01-11
