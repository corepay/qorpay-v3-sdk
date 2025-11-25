#!/usr/bin/env node

/**
 * QorPay V3 SDK - Endpoint Coverage Analyzer
 * Analyzes implemented endpoints and updates coverage reports
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// List of expected endpoint patterns based on API spec
const expectedEndpoints = {
    payments: {
        file: 'src/resources/payments.ts',
        endpoints: [
            'saleManual', 'saleToken', 'saleSwipe', 'salePin', 'salePos',
            'sale3ds', 'saleCashDiscount', 'saleLevel2_3', 'authorize',
            'authorizeToken', 'capture', 'void', 'refund', 'recurringSetup',
            'recurring', 'myRecurring'
        ]
    },
    transactions: {
        file: 'src/resources/transactions.ts',
        endpoints: [
            'getTransaction', 'listTransactions', 'listByProfile', 'listByBatch',
            'listMarketPlaceByBatch', 'getAchTransaction', 'listAchTransactions',
            'createProofOfDelivery', 'updateProofOfDelivery', 'listProofOfDelivery',
            'getProofOfDelivery', 'deleteProofOfDelivery'
        ]
    },
    paymentTokens: {
        file: 'src/resources/payment-tokens.ts',
        endpoints: [
            'createCardToken', 'getCardToken', 'listCardTokensByProfile',
            'listExpiringCardTokens', 'updateCardToken', 'rotateCardToken',
            'deleteCardToken', 'createAchToken', 'getAchToken', 'listAchTokensByProfile'
        ]
    },
    customers: {
        file: 'src/resources/customers.ts',
        endpoints: ['create', 'list', 'get', 'update', 'delete']
    },
    plans: {
        file: 'src/resources/plans.ts',
        endpoints: ['create', 'list', 'get', 'update', 'delete']
    },
    webhooks: {
        file: 'src/resources/webhooks.ts',
        endpoints: ['create', 'list', 'get', 'listEvents', 'retryEvent', 'update', 'delete']
    },
    achPayments: {
        file: 'src/resources/ach-payments.ts',
        endpoints: ['createDebit', 'createDebitWithToken', 'createCredit', 'void', 'refund']
    },
    cashPayments: {
        file: 'src/resources/cash-payments.ts',
        endpoints: ['create']
    },
    deposits: {
        file: 'src/resources/deposits.ts',
        endpoints: ['get', 'list', 'listTransactions']
    },
    disputes: {
        file: 'src/resources/disputes.ts',
        endpoints: ['list', 'get']
    },
    utilities: {
        file: 'src/resources/utilities.ts',
        endpoints: [
            'validateCard', 'validateCvv', 'validateExpiration', 'validateRouting',
            'lookupBin', 'checkAvsResult', 'checkCvvResult', 'generateTestCard',
            'validateAddress', 'getServerTime', 'validateTaxId'
        ]
    }
};

/**
 * Check if a file exists and is readable
 */
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch (error) {
        return false;
    }
}

/**
 * Extract method names from a TypeScript file
 */
function extractMethods(filePath) {
    if (!fileExists(filePath)) {
        return [];
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Match async method declarations and public methods
        const methodPattern = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*:\s*[^{]+/g;
        const methods = [];
        let match;

        while ((match = methodPattern.exec(content)) !== null) {
            const methodName = match[1];
            // Exclude constructor, private methods, and obvious non-endpoint methods
            if (!methodName.startsWith('_') &&
                methodName !== 'constructor' &&
                methodName !== 'toString' &&
                methodName !== 'valueOf' &&
                !methodName.toLowerCase().includes('private') &&
                !methodName.toLowerCase().includes('helper') &&
                !methodName.toLowerCase().includes('util')) {
                methods.push(methodName);
            }
        }

        // Also look for method definitions with = arrow syntax
        const arrowMethodPattern = /(?:async\s+)?(\w+)\s*=\s*\([^)]*\)\s*=>/g;
        while ((match = arrowMethodPattern.exec(content)) !== null) {
            const methodName = match[1];
            if (!methodName.startsWith('_') && methodName !== 'constructor') {
                if (!methods.includes(methodName)) {
                    methods.push(methodName);
                }
            }
        }

        return methods;
    } catch (error) {
        colorLog('red', `Error reading file ${filePath}: ${error.message}`);
        return [];
    }
}

/**
 * Check if a method name matches an expected endpoint pattern
 */
function matchesEndpoint(methodName, expectedEndpoint) {
    // Convert both to lowercase for comparison
    const methodLower = methodName.toLowerCase();
    const endpointLower = expectedEndpoint.toLowerCase();

    // Direct match
    if (methodLower === endpointLower) {
        return true;
    }

    // Check if method contains endpoint name
    if (methodLower.includes(endpointLower) || endpointLower.includes(methodLower)) {
        return true;
    }

    // Check common variations
    const variations = {
        'get': ['fetch', 'retrieve', 'find'],
        'list': ['getall', 'findall', 'retrieveall'],
        'create': ['add', 'new', 'insert'],
        'update': ['modify', 'change', 'edit'],
        'delete': ['remove', 'destroy']
    };

    for (const [base, alts] of Object.entries(variations)) {
        if (endpointLower.includes(base) && alts.some(alt => methodLower.includes(alt))) {
            return true;
        }
        if (methodLower.includes(base) && alts.some(alt => endpointLower.includes(alt))) {
            return true;
        }
    }

    return false;
}

/**
 * Analyze endpoint coverage for a resource
 */
function analyzeResource(resourceName, resourceConfig) {
    const filePath = resourceConfig.file;
    const expectedEndpoints = resourceConfig.endpoints;

    const implementedMethods = extractMethods(filePath);
    const implementedEndpoints = [];

    // Match implemented methods with expected endpoints
    for (const expectedEndpoint of expectedEndpoints) {
        const isImplemented = implementedMethods.some(method =>
            matchesEndpoint(method, expectedEndpoint)
        );

        if (isImplemented) {
            implementedEndpoints.push(expectedEndpoint);
        }
    }

    const missingEndpoints = expectedEndpoints.filter(endpoint =>
        !implementedEndpoints.includes(endpoint)
    );

    return {
        resourceName,
        filePath: fileExists(filePath) ? filePath : null,
        totalExpected: expectedEndpoints.length,
        implemented: implementedEndpoints.length,
        implementedEndpoints,
        missingEndpoints,
        coverage: expectedEndpoints.length > 0 ? (implementedEndpoints.length / expectedEndpoints.length * 100) : 0
    };
}

/**
 * Generate coverage report
 */
function generateCoverageReport() {
    colorLog('cyan', '\n🔍 Analyzing QorPay V3 SDK Endpoint Coverage...\n');

    const resources = Object.entries(expectedEndpoints);
    const results = [];

    let totalExpected = 0;
    let totalImplemented = 0;

    // Analyze each resource
    for (const [resourceName, resourceConfig] of resources) {
        const analysis = analyzeResource(resourceName, resourceConfig);
        results.push(analysis);

        totalExpected += analysis.totalExpected;
        totalImplemented += analysis.implemented;

        // Display resource results
        const coverageIcon = analysis.coverage === 100 ? '✅' :
                           analysis.coverage >= 75 ? '🟡' : '❌';

        console.log(`${coverageIcon} ${resourceName.padEnd(20)} ${analysis.implemented.toString().padEnd(3)}/${analysis.totalExpected} (${analysis.coverage.toFixed(1)}%)`);

        if (analysis.missingEndpoints.length > 0) {
            colorLog('yellow', `   Missing: ${analysis.missingEndpoints.join(', ')}`);
        }
    }

    // Calculate overall coverage
    const overallCoverage = totalExpected > 0 ? (totalImplemented / totalExpected * 100) : 0;
    const overallIcon = overallCoverage >= 95 ? '🎉' :
                       overallCoverage >= 85 ? '🟡' : '❌';

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log(`${overallIcon} Overall Coverage: ${totalImplemented}/${totalExpected} (${overallCoverage.toFixed(1)}%)`);
    console.log('='.repeat(60));

    // Category summary
    const criticalResources = ['transactions', 'paymentTokens'];
    const criticalTotal = criticalResources.reduce((sum, name) => {
        const result = results.find(r => r.resourceName === name);
        return sum + (result ? result.totalExpected : 0);
    }, 0);

    const criticalImplemented = criticalResources.reduce((sum, name) => {
        const result = results.find(r => r.resourceName === name);
        return sum + (result ? result.implemented : 0);
    }, 0);

    const criticalCoverage = criticalTotal > 0 ? (criticalImplemented / criticalTotal * 100) : 0;

    console.log(`🔴 Critical Resources: ${criticalImplemented}/${criticalTotal} (${criticalCoverage.toFixed(1)}%)`);

    if (criticalCoverage < 100) {
        colorLog('yellow', '   Priority: Complete critical resources first');
    }

    // Generate detailed report file
    const reportContent = generateDetailedReport(results, totalExpected, totalImplemented, overallCoverage);
    fs.writeFileSync('.sandbox/ENDPOINT_ANALYSIS.md', reportContent);

    colorLog('green', '\n📊 Detailed report saved to .sandbox/ENDPOINT_ANALYSIS.md');

    return {
        results,
        totalExpected,
        totalImplemented,
        overallCoverage,
        criticalCoverage
    };
}

/**
 * Generate detailed markdown report
 */
function generateDetailedReport(results, totalExpected, totalImplemented, overallCoverage) {
    const timestamp = new Date().toISOString();

    let report = `# QorPay V3 SDK - Endpoint Coverage Analysis

**Generated**: ${timestamp}
**Overall Coverage**: ${totalImplemented}/${totalExpected} (${overallCoverage.toFixed(1)}%)

## 📊 Coverage Summary

`;

    // Category sections
    const categories = {
        '✅ Complete': results.filter(r => r.coverage === 100),
        '🟡 Partial': results.filter(r => r.coverage > 0 && r.coverage < 100),
        '❌ Not Started': results.filter(r => r.coverage === 0)
    };

    for (const [category, items] of Object.entries(categories)) {
        if (items.length === 0) continue;

        report += `### ${category}\n\n`;

        for (const item of items) {
            report += `#### ${item.resourceName}\n`;
            report += `- **File**: \`${item.filePath || 'Not created'}\`\n`;
            report += `- **Coverage**: ${item.implemented}/${item.totalExpected} (${item.coverage.toFixed(1)}%)\n`;

            if (item.implementedEndpoints.length > 0) {
                report += `- **Implemented**: ${item.implementedEndpoints.join(', ')}\n`;
            }

            if (item.missingEndpoints.length > 0) {
                report += `- **Missing**: ${item.missingEndpoints.join(', ')}\n`;
            }

            report += '\n';
        }
    }

    // Priority recommendations
    report += `## 🎯 Priority Recommendations\n\n`;

    const criticalMissing = results
        .filter(r => ['transactions', 'paymentTokens'].includes(r.resourceName) && r.coverage < 100)
        .flatMap(r => r.missingEndpoints);

    if (criticalMissing.length > 0) {
        report += `### 🔴 High Priority (Critical Missing)\n\n`;
        report += `1. **Transaction Management** - Core functionality for any payment SDK\n`;
        report += `2. **Payment Tokenization** - Essential for PCI compliance and security\n\n`;
        report += `Missing endpoints: ${criticalMissing.length}\n\n`;
    }

    const partialResources = results.filter(r => r.coverage > 0 && r.coverage < 100);
    if (partialResources.length > 0) {
        report += `### 🟡 Medium Priority (Complete Partial Resources)\n\n`;
        for (const resource of partialResources) {
            report += `- **${resource.resourceName}**: ${resource.missingEndpoints.length} missing endpoints\n`;
        }
        report += '\n';
    }

    const notStarted = results.filter(r => r.coverage === 0 && r.totalExpected > 0);
    if (notStarted.length > 0) {
        report += `### 🟢 Low Priority (Not Started)\n\n`;
        for (const resource of notStarted) {
            report += `- **${resource.resourceName}**: ${resource.totalExpected} endpoints\n`;
        }
        report += '\n';
    }

    report += `## 📈 Implementation Progress\n\n`;

    // Progress bar
    const progressBarLength = 30;
    const progressFilled = Math.round((overallCoverage / 100) * progressBarLength);
    const progressBar = '█'.repeat(progressFilled) + '░'.repeat(progressBarLength - progressFilled);

    report += `Progress: \`${progressBar}\` ${overallCoverage.toFixed(1)}%\n\n`;

    // Next milestones
    const nextMilestone = overallCoverage < 95 ? 95 :
                         overallCoverage < 99 ? 99 : 100;

    const endpointsToNext = Math.round((nextMilestone / 100) * totalExpected) - totalImplemented;

    report += `**Next Milestone**: ${nextMilestone}% coverage (${endpointsToNext} more endpoints)\n\n`;

    report += `## 🔧 Quality Gates\n\n`;
    report += `- [ ] TypeScript compilation: 0 errors\n`;
    report += `- [ ] All tests passing: 100% success rate\n`;
    report += `- [ ] Test coverage: ≥90%\n`;
    report += `- [ ] ESLint: 0 errors/warnings\n`;
    report += `- [ ] Build: All bundles generated\n`;
    report += `- [ ] Type safety: No 'any' types\n\n`;

    report += `## 📚 Resources\n\n`;
    report += `- **Implementation Roadmap**: [COMPLETE_IMPLEMENTATION_ROADMAP.md](COMPLETE_IMPLEMENTATION_ROADMAP.md)\n`;
    report += `- **Agent Handoff**: [AGENT_HANDOFF_TEMPLATE.md](AGENT_HANDOFF_TEMPLATE.md)\n`;
    report += `- **Quality Gates**: Run \`./scripts/quality-gates.sh\`\n\n`;

    report += `---\n`;
    report += `*Analysis generated on ${timestamp}*`;

    return report;
}

// Run the analysis if called directly
if (require.main === module) {
    const analysis = generateCoverageReport();

    // Exit with appropriate code
    process.exit(analysis.overallCoverage >= 85 ? 0 : 1);
}

module.exports = { generateCoverageReport, analyzeResource, extractMethods };