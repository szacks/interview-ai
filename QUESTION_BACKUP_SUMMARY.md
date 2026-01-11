# Question Backup System - Summary

## What Was Created

A complete backup and restore system for your interview questions with multiple methods and safety features.

## Files Created

### 1. JSON Backup Files (Sample Questions)
- `backend/src/main/resources/question-backups/question-rate-limiter.json`
- `backend/src/main/resources/question-backups/question-two-sum.json`
- `backend/src/main/resources/question-backups/question-binary-search.json`

Each file contains the complete question structure:
- Question metadata (title, description, difficulty, category)
- Code templates for all supported languages (Java, Python, JavaScript)
- Test cases with expected outputs
- Follow-up questions for interviewers
- AI configuration settings
- All relationships and nested data

### 2. Java Utilities
- `backend/src/main/java/com/example/interviewAI/util/QuestionBackupRestorer.java`
  - Restores questions from JSON files
  - Checks for duplicates (skips if exists)
  - Handles all relationships automatically
  - Detailed logging

- `backend/src/main/java/com/example/interviewAI/util/QuestionBackupExporter.java`
  - Exports questions to JSON files
  - Creates individual files per question
  - Preserves all data and relationships
  - Pretty-printed JSON output

### 3. SQL Scripts
- `backend/src/main/resources/question-backups/restore-questions.sql`
  - Direct database restoration
  - Works without starting the application
  - Includes sample questions
  - Uses ON CONFLICT to avoid duplicates

### 4. Shell Script Helper
- `backend/backup-restore.sh`
  - Easy-to-use command-line interface
  - Validation tools
  - List and inspect backups
  - Color-coded output

### 5. Documentation
- `backend/src/main/resources/question-backups/README.md`
  - Complete usage guide
  - Troubleshooting section
  - Best practices
  - API reference

---

## Quick Start Guide

### Export All Current Questions

```bash
cd backend
./backup-restore.sh export-all
```

Or:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--export-questions"
```

### Restore Questions from Backup

**Method 1: Java (Recommended)**
```bash
cd backend
./backup-restore.sh restore-all
```

**Method 2: SQL**
```bash
cd backend
./backup-restore.sh restore-sql
```

**Method 3: Manual**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--restore-questions"
```

### List All Backups

```bash
cd backend
./backup-restore.sh list
```

### Validate a Backup File

```bash
cd backend
./backup-restore.sh validate question-two-sum.json
```

---

## How It Works

### Export Process

1. **Trigger Export** - Run export command
2. **Query Database** - Fetch all questions with relationships
3. **Convert to JSON** - Serialize question, follow-ups, test cases
4. **Save Files** - Write to `question-backups/` directory
5. **Log Results** - Report success/failure count

```
Question in DB → Export → JSON File
   ↓                       ↑
   └─ Follow-ups ─────────┘
   └─ Test Cases ─────────┘
```

### Restore Process

1. **Read JSON** - Parse backup file
2. **Check Duplicates** - Skip if question title exists
3. **Create Entities** - Build Question, FollowUpQuestion, TestCase objects
4. **Set Relationships** - Link follow-ups and test cases to question
5. **Save to DB** - Single transaction with cascading save
6. **Log Results** - Report restored/skipped/failed

```
JSON File → Parse → Create Entities → Save to DB
                         ↓
              Follow-ups & Test Cases
```

---

## Safety Features

### Duplicate Prevention
- ✅ Checks if question title already exists before restoring
- ✅ Uses `ON CONFLICT DO NOTHING` in SQL scripts
- ✅ Skips existing questions automatically
- ✅ Logs skipped questions for review

### Data Integrity
- ✅ Validates JSON structure before processing
- ✅ Handles null/missing fields gracefully
- ✅ Preserves all relationships (cascade operations)
- ✅ Uses transactions for atomicity

### Error Handling
- ✅ Detailed error messages with context
- ✅ Continues processing even if one question fails
- ✅ Comprehensive logging for troubleshooting
- ✅ Validation tools to check backups

---

## Common Scenarios

### 1. Question Accidentally Deleted

```bash
# Restore from backup (skips existing questions)
cd backend
./backup-restore.sh restore-all
```

### 2. Question Modified Incorrectly

```bash
# Delete the corrupted question
psql -U postgres -d interviewai_db -c "DELETE FROM questions WHERE title = 'Two Sum';"

# Restore from backup
./backup-restore.sh restore-all
```

### 3. Regular Backups

Add to cron job:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/interviewAI/backend && ./backup-restore.sh export-all
```

Or create a scheduled task in your Java application (see README.md).

### 4. Migrate Questions to New Environment

```bash
# On old environment
./backup-restore.sh export-all

# Copy files
scp -r src/main/resources/question-backups/* user@newserver:/path/to/backups/

# On new environment
./backup-restore.sh restore-all
```

### 5. Version Control Your Questions

```bash
# Export current state
./backup-restore.sh export-all

# Commit to Git
git add src/main/resources/question-backups/*.json
git commit -m "Backup: Updated questions - $(date +%Y-%m-%d)"
git push
```

---

## JSON Schema Reference

### Minimal Valid Backup

```json
{
  "question": {
    "title": "Question Title (REQUIRED)",
    "description": "Full description (REQUIRED)",
    "difficulty": "easy|medium|hard (REQUIRED)",
    "status": "PUBLISHED",
    "version": 1,
    "currentStep": 7
  },
  "followUpQuestions": [],
  "testCases": []
}
```

### Full Backup Example

See the actual backup files for complete examples:
- [question-rate-limiter.json](backend/src/main/resources/question-backups/question-rate-limiter.json)
- [question-two-sum.json](backend/src/main/resources/question-backups/question-two-sum.json)
- [question-binary-search.json](backend/src/main/resources/question-backups/question-binary-search.json)

---

## Advanced Usage

### Programmatic Export

```java
@Autowired
private QuestionBackupExporter exporter;

// Export specific question
public void backupQuestion(Long questionId) throws IOException {
    exporter.exportQuestionById(questionId);
}

// Export by title
public void backupQuestionByTitle(String title) throws IOException {
    exporter.exportQuestionByTitle(title);
}
```

### Programmatic Restore

```java
@Autowired
private QuestionBackupRestorer restorer;

// Restore specific question
public boolean restoreQuestion(String filename) throws IOException {
    return restorer.restoreFromFile("classpath:question-backups/" + filename);
}
```

### Custom Backup Location

Modify the backup directory in the scripts:

```java
// In QuestionBackupExporter.java
private static final String BACKUP_DIR = "/your/custom/path";
```

---

## Testing Your Backup System

### 1. Test Export

```bash
# Export all questions
./backup-restore.sh export-all

# Verify files were created
ls -l src/main/resources/question-backups/

# Validate a backup
./backup-restore.sh validate question-two-sum.json
```

### 2. Test Restore (Safe - Skips Duplicates)

```bash
# This is safe - it won't overwrite existing questions
./backup-restore.sh restore-all

# Check the logs for "skipped" messages
```

### 3. Test Full Cycle

```bash
# 1. Export current state
./backup-restore.sh export-all

# 2. Delete a test question (optional - be careful!)
# psql -U postgres -d interviewai_db -c "DELETE FROM questions WHERE id = 999;"

# 3. Restore
./backup-restore.sh restore-all

# 4. Verify question is back
```

---

## Maintenance

### Adding New Questions to Backup List

When you add a new question backup file, update the restore script:

**File:** `QuestionBackupRestorer.java`

```java
String[] backupFiles = {
    "question-rate-limiter.json",
    "question-two-sum.json",
    "question-binary-search.json",
    "question-your-new-question.json"  // Add here
};
```

### Cleaning Old Backups

```bash
# Remove old backups (manual review recommended)
cd backend/src/main/resources/question-backups
rm question-old-*.json

# Or archive them
mkdir archive
mv question-old-*.json archive/
```

---

## Troubleshooting

### "Question already exists, skipping"

This is **normal behavior**. The restore process skips duplicates to prevent overwriting.

**To force restore:**
```sql
DELETE FROM questions WHERE title = 'Question Title';
-- Then run restore again
```

### "File not found" Error

```bash
# Check file exists
ls -l backend/src/main/resources/question-backups/

# Check path is correct
# Use full classpath: classpath:question-backups/filename.json
```

### JSON Validation Errors

```bash
# Validate JSON syntax
./backup-restore.sh validate question-file.json

# Or use jq
jq . src/main/resources/question-backups/question-file.json
```

### Database Connection Errors (SQL Method)

```bash
# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=interviewai_db
export DB_USER=postgres

# Then run restore
./backup-restore.sh restore-sql
```

---

## Summary

You now have a complete question backup and restore system with:

✅ **3 Sample Backup Files** - Ready to restore
✅ **Java Export Utility** - Export all or specific questions
✅ **Java Restore Utility** - Smart duplicate detection
✅ **SQL Restore Script** - Database-level restoration
✅ **Shell Helper Script** - Easy command-line interface
✅ **Comprehensive Documentation** - Full usage guide

The system is production-ready and includes safety features to prevent data loss or duplication.

---

## Next Steps

1. **Test the system**
   ```bash
   cd backend
   ./backup-restore.sh list
   ./backup-restore.sh restore-all
   ```

2. **Export your current questions**
   ```bash
   ./backup-restore.sh export-all
   ```

3. **Set up regular backups** (optional)
   - Add scheduled task in Java app, or
   - Add cron job for daily exports

4. **Version control** (recommended)
   ```bash
   git add src/main/resources/question-backups/*.json
   git commit -m "Add question backup system"
   ```

---

**Last Updated:** 2026-01-11
**Version:** 1.0
