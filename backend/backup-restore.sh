#!/bin/bash
# Question Backup & Restore Helper Script
# Usage: ./backup-restore.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/src/main/resources/question-backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo -e "${BLUE}Question Backup & Restore System${NC}"
    echo ""
    echo "Usage: ./backup-restore.sh [command]"
    echo ""
    echo "Commands:"
    echo "  export-all          Export all questions to JSON backups"
    echo "  export TITLE        Export specific question by title"
    echo "  restore-all         Restore all questions from JSON backups"
    echo "  restore-sql         Restore questions using SQL script"
    echo "  list                List all backup files"
    echo "  validate FILE       Validate a backup JSON file"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./backup-restore.sh export-all"
    echo "  ./backup-restore.sh export \"Two Sum\""
    echo "  ./backup-restore.sh restore-all"
    echo "  ./backup-restore.sh list"
    echo "  ./backup-restore.sh validate question-two-sum.json"
}

export_all() {
    echo -e "${GREEN}Exporting all questions...${NC}"
    mvn spring-boot:run -Dspring-boot.run.arguments="--export-questions"
}

export_question() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Question title required${NC}"
        echo "Usage: ./backup-restore.sh export \"Question Title\""
        exit 1
    fi
    echo -e "${GREEN}Exporting question: $1${NC}"
    mvn spring-boot:run -Dspring-boot.run.arguments="--export-question=$1"
}

restore_all() {
    echo -e "${GREEN}Restoring all questions from backups...${NC}"
    mvn spring-boot:run -Dspring-boot.run.arguments="--restore-questions"
}

restore_sql() {
    echo -e "${GREEN}Restoring questions using SQL script...${NC}"

    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}Error: psql command not found${NC}"
        echo "Please install PostgreSQL client or use the Java restore method"
        exit 1
    fi

    # Default database credentials (override with environment variables)
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-interviewai_db}"
    DB_USER="${DB_USER:-postgres}"

    echo -e "${YELLOW}Database: $DB_NAME on $DB_HOST:$DB_PORT${NC}"
    echo -e "${YELLOW}User: $DB_USER${NC}"

    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_DIR/restore-questions.sql"
}

list_backups() {
    echo -e "${BLUE}Available backup files:${NC}"
    echo ""

    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${RED}Backup directory not found: $BACKUP_DIR${NC}"
        exit 1
    fi

    cd "$BACKUP_DIR"
    count=0

    for file in question-*.json; do
        if [ -f "$file" ]; then
            count=$((count + 1))
            size=$(ls -lh "$file" | awk '{print $5}')
            modified=$(ls -l "$file" | awk '{print $6, $7, $8}')

            # Extract title from JSON if jq is available
            if command -v jq &> /dev/null; then
                title=$(jq -r '.question.title' "$file" 2>/dev/null || echo "N/A")
                difficulty=$(jq -r '.question.difficulty' "$file" 2>/dev/null || echo "N/A")
                echo -e "${GREEN}$count.${NC} $file"
                echo -e "   Title: ${YELLOW}$title${NC}"
                echo -e "   Difficulty: $difficulty | Size: $size | Modified: $modified"
                echo ""
            else
                echo -e "${GREEN}$count.${NC} $file (Size: $size, Modified: $modified)"
            fi
        fi
    done

    if [ $count -eq 0 ]; then
        echo -e "${YELLOW}No backup files found${NC}"
    else
        echo -e "${BLUE}Total: $count backup file(s)${NC}"
    fi
}

validate_file() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Filename required${NC}"
        echo "Usage: ./backup-restore.sh validate question-two-sum.json"
        exit 1
    fi

    filepath="$BACKUP_DIR/$1"

    if [ ! -f "$filepath" ]; then
        echo -e "${RED}Error: File not found: $filepath${NC}"
        exit 1
    fi

    echo -e "${BLUE}Validating: $1${NC}"
    echo ""

    # Check if jq is available
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}Warning: jq not found. Install jq for detailed validation.${NC}"
        echo "Checking if file is valid JSON..."

        if python3 -c "import json; json.load(open('$filepath'))" 2>/dev/null; then
            echo -e "${GREEN}✓ Valid JSON${NC}"
        else
            echo -e "${RED}✗ Invalid JSON${NC}"
            exit 1
        fi
    else
        # Validate JSON structure
        if jq empty "$filepath" 2>/dev/null; then
            echo -e "${GREEN}✓ Valid JSON syntax${NC}"
        else
            echo -e "${RED}✗ Invalid JSON syntax${NC}"
            exit 1
        fi

        # Check required fields
        echo ""
        echo -e "${BLUE}Checking required fields:${NC}"

        check_field() {
            local field=$1
            local value=$(jq -r "$field" "$filepath" 2>/dev/null)
            if [ "$value" != "null" ] && [ -n "$value" ]; then
                echo -e "${GREEN}✓${NC} $field: $value"
            else
                echo -e "${RED}✗${NC} $field: Missing or null"
            fi
        }

        check_field ".question.title"
        check_field ".question.description"
        check_field ".question.difficulty"
        check_field ".question.category"
        check_field ".question.status"

        echo ""
        echo -e "${BLUE}Additional info:${NC}"

        # Count follow-up questions
        fq_count=$(jq '.followUpQuestions | length' "$filepath" 2>/dev/null || echo "0")
        echo -e "Follow-up questions: $fq_count"

        # Count test cases
        tc_count=$(jq '.testCases | length' "$filepath" 2>/dev/null || echo "0")
        echo -e "Test cases: $tc_count"

        # Languages
        langs=$(jq -r '.question.supportedLanguages' "$filepath" 2>/dev/null || echo "N/A")
        echo -e "Supported languages: $langs"

        echo ""
        echo -e "${GREEN}Validation complete!${NC}"
    fi
}

# Main command handler
case "$1" in
    export-all)
        export_all
        ;;
    export)
        export_question "$2"
        ;;
    restore-all)
        restore_all
        ;;
    restore-sql)
        restore_sql
        ;;
    list)
        list_backups
        ;;
    validate)
        validate_file "$2"
        ;;
    help|--help|-h|"")
        print_usage
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        echo ""
        print_usage
        exit 1
        ;;
esac
