#!/bin/bash
# Export all questions currently in the database to JSON backup files

set -e

echo "========================================="
echo "Exporting Questions from Database"
echo "========================================="
echo ""

# Database connection details
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-interviewai_db}"
DB_USER="${DB_USER:-postgres}"

echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found"
    echo "Please install PostgreSQL client or use the Java export method:"
    echo "  cd backend"
    echo "  mvn spring-boot:run -Dspring-boot.run.arguments=\"--export-questions\""
    exit 1
fi

# Check if jq is available for pretty JSON
if ! command -v jq &> /dev/null; then
    echo "Warning: jq not found. JSON will not be pretty-printed."
    echo "Install jq for better formatting: sudo apt-get install jq"
    echo ""
fi

# Query to get all questions
echo "Querying database for questions..."
QUESTION_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM questions;" 2>/dev/null | xargs)

if [ -z "$QUESTION_COUNT" ] || [ "$QUESTION_COUNT" = "0" ]; then
    echo "No questions found in database."
    exit 0
fi

echo "Found $QUESTION_COUNT question(s) in database"
echo ""

# Get list of question titles
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT id, title, difficulty, category FROM questions ORDER BY id;" | while IFS='|' read -r id title difficulty category; do
    # Trim whitespace
    id=$(echo "$id" | xargs)
    title=$(echo "$title" | xargs)
    difficulty=$(echo "$difficulty" | xargs)
    category=$(echo "$category" | xargs)

    if [ -n "$id" ]; then
        echo "Question $id: $title ($difficulty - $category)"
    fi
done

echo ""
echo "========================================="
echo "To export these questions to JSON files:"
echo "========================================="
echo ""
echo "Method 1: Using Spring Boot (Recommended)"
echo "  cd backend"
echo "  mvn spring-boot:run -Dspring-boot.run.arguments=\"--export-questions\""
echo ""
echo "Method 2: Using the helper script"
echo "  cd backend"
echo "  ./backup-restore.sh export-all"
echo ""
