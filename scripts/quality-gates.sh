#!/bin/bash

# QorPay V3 SDK - Quality Gates Script
# This script enforces quality standards before allowing commits/merges

set -e  # Exit on any error

echo "🔍 QorPay V3 SDK - Running Quality Gates..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "FAIL")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required dependencies
echo ""
print_status "INFO" "Checking dependencies..."

if ! command_exists node; then
    print_status "FAIL" "Node.js is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    print_status "FAIL" "npm is required but not installed"
    exit 1
fi

print_status "PASS" "Dependencies satisfied"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_status "FAIL" "Please run this script from the project root directory"
    exit 1
fi

print_status "PASS" "Running from project root"

# Ensure dependencies are installed
echo ""
print_status "INFO" "Checking if dependencies are installed..."
if [ ! -d "node_modules" ]; then
    print_status "INFO" "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "PASS" "Dependencies installed"
    else
        print_status "FAIL" "Failed to install dependencies"
        exit 1
    fi
else
    print_status "PASS" "Dependencies already installed"
fi

# TypeScript validation
echo ""
print_status "INFO" "Running TypeScript validation..."
if npm run type-check > /dev/null 2>&1; then
    print_status "PASS" "TypeScript validation passed"
else
    print_status "FAIL" "TypeScript validation failed"
    echo "Run 'npm run type-check' to see the errors"
    exit 1
fi

# Run tests
echo ""
print_status "INFO" "Running test suite..."
if npm test > /dev/null 2>&1; then
    print_status "PASS" "All tests passed"
else
    print_status "FAIL" "Some tests failed"
    echo "Run 'npm test' to see the test results"
    exit 1
fi

# ESLint validation
echo ""
print_status "INFO" "Running ESLint validation..."
if npm run lint > /dev/null 2>&1; then
    print_status "PASS" "ESLint validation passed"
else
    print_status "FAIL" "ESLint validation failed"
    echo "Run 'npm run lint' to see the linting errors"
    exit 1
fi

# Build verification
echo ""
print_status "INFO" "Verifying build process..."
if npm run build > /dev/null 2>&1; then
    print_status "PASS" "Build verification passed"
else
    print_status "FAIL" "Build verification failed"
    echo "Run 'npm run build' to see build errors"
    exit 1
fi

# Coverage analysis
echo ""
print_status "INFO" "Analyzing test coverage..."
COVERAGE_OUTPUT=$(npm run test:coverage 2>&1)
if echo "$COVERAGE_OUTPUT" | grep -q "No coverage information"; then
    print_status "WARN" "No coverage information available"
elif echo "$COVERAGE_OUTPUT" | grep -q "All files"; then
    # Extract overall coverage percentage (last percentage in the summary)
    COVERAGE=$(echo "$COVERAGE_OUTPUT" | grep "All files" | tail -1 | grep -o '[0-9]*\.[0-9]*' | tail -1)
    COVERAGE_INT=$(echo "$COVERAGE" | cut -d'.' -f1)

    if [ "$COVERAGE_INT" -ge 90 ]; then
        print_status "PASS" "Coverage is ${COVERAGE}% (≥90% required)"
    elif [ "$COVERAGE_INT" -ge 80 ]; then
        print_status "WARN" "Coverage is ${COVERAGE}% (≥90% recommended)"
    else
        print_status "FAIL" "Coverage is ${COVERAGE}% (<90% required)"
        echo "Run 'npm run test:coverage' to see detailed coverage report"
        exit 1
    fi
else
    print_status "WARN" "Could not parse coverage information"
fi

# Check for any TypeScript 'any' types
echo ""
print_status "INFO" "Checking for TypeScript 'any' types..."
ANY_COUNT=$(grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
if [ "$ANY_COUNT" -eq 0 ]; then
    print_status "PASS" "No TypeScript 'any' types found"
else
    print_status "FAIL" "Found $ANY_COUNT instances of TypeScript 'any' types"
    echo "Replace all 'any' types with proper TypeScript types"
    exit 1
fi

# Check for TODO comments in production code
echo ""
print_status "INFO" "Checking for TODO comments..."
TODO_COUNT=$(grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -eq 0 ]; then
    print_status "PASS" "No TODO comments found in production code"
else
    print_status "WARN" "Found $TODO_COUNT TODO comments in production code"
    echo "Consider completing TODO items before production"
fi

# Check for console.log statements
echo ""
print_status "INFO" "Checking for console.log statements..."
CONSOLE_COUNT=$(grep -r "console.log" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -eq 0 ]; then
    print_status "PASS" "No console.log statements found in production code"
else
    print_status "WARN" "Found $CONSOLE_COUNT console.log statements in production code"
    echo "Remove or replace with proper logging"
fi

# Verify package.json version is semver
echo ""
print_status "INFO" "Verifying package.json version format..."
VERSION=$(node -e "console.log(require('./package.json').version)")
if [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$ ]]; then
    print_status "PASS" "Package version $VERSION follows semantic versioning"
else
    print_status "WARN" "Package version $VERSION does not follow semantic versioning"
fi

# Check for critical files
echo ""
print_status "INFO" "Checking for critical files..."
CRITICAL_FILES=(
    "src/index.ts"
    "src/client/qorpay-client.ts"
    "src/resources/payments.ts"
    "src/types/common.ts"
    "README.md"
)

MISSING_FILES=0
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "PASS" "Critical file exists: $file"
    else
        print_status "FAIL" "Critical file missing: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    print_status "FAIL" "$MISSING_FILES critical files are missing"
    exit 1
fi

# Check file sizes (warn about very large files)
echo ""
print_status "INFO" "Checking file sizes..."
LARGE_FILE_THRESHOLD=1000  # 1KB
LARGE_FILES=$(find src/ -name "*.ts" -size +${LARGE_FILE_THRESHOLD}c | wc -l | tr -d ' ')
if [ "$LARGE_FILES" -eq 0 ]; then
    print_status "PASS" "No unusually large TypeScript files found"
else
    print_status "WARN" "Found $LARGE_FILES TypeScript files larger than ${LARGE_FILE_THRESHOLD} bytes"
    echo "Consider splitting large files into smaller modules"
fi

# Final summary
echo ""
echo "========================================"
print_status "PASS" "All quality gates passed successfully!"
echo "========================================"

# Optional: Show project statistics
if [ "$1" = "--stats" ]; then
    echo ""
    print_status "INFO" "Project Statistics:"
    echo "  - TypeScript files: $(find src/ -name "*.ts" | wc -l | tr -d ' ')"
    echo "  - Test files: $(find tests/ -name "*.test.ts" | wc -l | tr -d ' ')"
    echo "  - Dependencies: $(grep -c '"' package.json | tr -d ' ')"
    echo "  - Current coverage: ${COVERAGE:-"N/A"}"
    echo "  - Package version: $VERSION"
fi

echo ""
print_status "INFO" "Quality gates completed successfully! 🎉"