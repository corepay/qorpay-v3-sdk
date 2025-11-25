#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run tests and generate coverage
try {
  execSync('npm test -- --coverage --watchAll=false --silent', { stdio: 'inherit' });

  // Read the coverage summary
  const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');

  if (fs.existsSync(coveragePath)) {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

    console.log('\n=== COVERAGE SUMMARY ===\n');

    // Display overall coverage
    if (coverage.total) {
      console.log('Overall:');
      console.log(`  Statements: ${coverage.total.statements.pct}%`);
      console.log(`  Branches: ${coverage.total.branches.pct}%`);
      console.log(`  Functions: ${coverage.total.functions.pct}%`);
      console.log(`  Lines: ${coverage.total.lines.pct}%\n`);
    }

    // Display file-by-file coverage, sorted by lowest coverage
    const files = Object.entries(coverage)
      .filter(([key]) => key !== 'total')
      .map(([file, data]) => ({
        file,
        statements: data.statements.pct,
        branches: data.branches?.pct || 100,
        functions: data.functions.pct,
        lines: data.lines.pct,
        avg: (data.statements.pct + (data.branches?.pct || 100) + data.functions.pct + data.lines.pct) / 4
      }))
      .sort((a, b) => a.avg - b.avg);

    console.log('Files needing attention (sorted by lowest coverage):\n');

    files.slice(0, 10).forEach(({ file, statements, branches, functions, lines, avg }) => {
      if (avg < 100) {
        console.log(`${file}:`);
        console.log(`  Statements: ${statements}%`);
        console.log(`  Branches: ${branches}%`);
        console.log(`  Functions: ${functions}%`);
        console.log(`  Lines: ${lines}%`);
        console.log(`  Average: ${avg.toFixed(2)}%\n`);
      }
    });
  }
} catch (error) {
  console.error('Error generating coverage report:', error);
  process.exit(1);
}