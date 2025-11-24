# QorPay V3 SDK - Essential Commands

## Development Commands

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode for development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (includes linting)
npm run test:ci
```

### Type Checking & Compilation
```bash
# TypeScript type checking
npm run type-check

# Build the project (multiple formats)
npm run build

# Clean build artifacts
npm run clean

# Check build size
npm run size
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Generate documentation
npm run docs
```

### Quality Gates (Must Pass Before Commit)
```bash
# Complete validation suite
npm run type-check && npm test && npm run lint && npm run build
```

## Development Workflow Commands

### During Development
```bash
# Watch mode for active development
npm run test:watch

# Type checking on save
npm run type-check

# Quick lint check
npm run lint
```

### Before Commit
```bash
# Ensure all quality gates pass
npm run lint:fix
npm run format
npm run type-check
npm test
npm run build
```

### Publishing
```bash
# Comprehensive pre-publish check
npm run prepublishOnly

# Package publish (after prepublishOnly)
npm publish
```

## System Commands (Darwin/macOS)

### Git Operations
```bash
# Check current git status
git status

# View staged and unstaged changes
git diff

# View commit history
git log --oneline -10

# Create and checkout new branch
git checkout -b feature/your-feature-name

# Add files and create commit
git add .
git commit -m "Your commit message"

# Push to remote
git push origin your-branch-name

# Pull latest changes
git pull origin your-branch-name
```

### File Operations
```bash
# List files in current directory
ls -la

# Find files by pattern
find . -name "*.ts" -type f

# Search for text in files
grep -r "search-term" src/

# Show file contents
cat filename.ts

# Create new directory
mkdir -p new/directory/path

# Remove directory and contents
rm -rf directory-name
```

### Node.js & npm
```bash
# Install dependencies
npm install

# Install specific package
npm install package-name --save-dev

# Update npm
npm install -g npm@latest

# Check npm version
npm --version

# Check Node.js version
node --version
```

## Troubleshooting Commands

### Test Issues
```bash
# Run specific test file
npm test -- -- test-name-pattern

# Run tests with verbose output
npm test -- --verbose

# Debug tests with Node.js inspector
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### Build Issues
```bash
# Clean and rebuild
npm run clean && npm run build

# Check TypeScript configuration
npx tsc --showConfig

# Check Rollup configuration
npx rollup -c rollup.config.mjs --dry-run
```

### Linting Issues
```bash
# Show specific linting rules
npm run lint -- --rule no-unused-vars

# Auto-fix all issues
npm run lint:fix

# Check ESLint configuration
npx eslint --print-config src/index.ts
```

## Project-Specific Scripts

### Gap Analysis
```bash
# Run gap analysis of API coverage
node scripts/gap-analysis.js

# Generate endpoint coverage report
node scripts/coverage-report.js
```

### Documentation
```bash
# Generate TypeDoc documentation
npm run docs

# Serve documentation locally (if applicable)
npx serve docs/
```

### Integration Testing
```bash
# Run integration tests only
npm test -- --testPathPattern=integration

# Run unit tests only
npm test -- --testPathPattern=unit
```

## Environment Setup

### New Developer Setup
```bash
# Clone repository
git clone <repository-url>
cd qorpay-v3-sdk

# Install dependencies
npm install

# Run all tests to verify setup
npm test

# Check build
npm run build
```

## Important Notes

1. **Always run quality gates** before committing changes
2. **Use watch mode** during active development for instant feedback
3. **TypeScript compilation** must pass with zero errors
4. **Test coverage** must be maintained at 100%
5. **No `any` types** allowed in TypeScript code
6. **Zod validation** required for all API inputs

## Command Cheat Sheet

```bash
# Quick development cycle
npm run test:watch    # During development
npm run lint:fix     # Before commit
npm run format       # Format code
npm test             # Verify tests
npm run build        # Verify build
```