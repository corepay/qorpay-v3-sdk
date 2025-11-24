const fs = require('fs');
const path = require('path');

console.log('🔍 QorPay SDK - Gap Assessment & Implementation Plan\n');
console.log('=' .repeat(80));

// Load both specs
const oasPath = path.join(process.cwd(), '.sandbox/oas.json');
const postmanPath = path.join(process.cwd(), '.sandbox/oas.postman.json');

let oas, postman;

try {
  oas = JSON.parse(fs.readFileSync(oasPath, 'utf8'));
  console.log('✅ Loaded oas.json');
} catch (e) {
  console.error('❌ Error loading oas.json:', e.message);
  process.exit(1);
}

try {
  postman = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));
  console.log('✅ Loaded oas.postman.json\n');
} catch (e) {
  console.error('❌ Error loading oas.postman.json:', e.message);
  process.exit(1);
}

// Extract endpoints from OAS
const oasEndpoints = new Map();
if (oas.paths) {
  Object.entries(oas.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, details]) => {
      if (method !== 'parameters') {
        const key = `${method.toUpperCase()} ${path}`;
        oasEndpoints.set(key, {
          method: method.toUpperCase(),
          path: path,
          operationId: details.operationId || 'N/A',
          summary: details.summary || 'N/A',
          tags: details.tags || [],
          deprecated: details.deprecated || false,
          source: 'oas'
        });
      }
    });
  });
}

// Extract endpoints from Postman collection
const postmanEndpoints = new Map();

function extractFromPostman(item, parentPath = []) {
  if (item.item) {
    // It's a folder
    item.item.forEach(subItem => {
      extractFromPostman(subItem, [...parentPath, item.name]);
    });
  } else if (item.request) {
    // It's a request
    const method = item.request.method;
    let url = item.request.url;
    
    // Handle different URL formats
    let pathStr = '';
    if (typeof url === 'string') {
      pathStr = url.replace(/{{.*?}}/g, '').split('?')[0];
    } else if (url.raw) {
      pathStr = url.raw.replace(/{{.*?}}/g, '').split('?')[0];
    } else if (url.path) {
      pathStr = '/' + (Array.isArray(url.path) ? url.path.join('/') : url.path);
    }
    
    // Clean up the path
    pathStr = pathStr.replace(/https?:\/\/[^\/]+/, '').replace(/\/+/g, '/');
    if (!pathStr.startsWith('/')) pathStr = '/' + pathStr;
    
    const key = `${method} ${pathStr}`;
    postmanEndpoints.set(key, {
      method: method,
      path: pathStr,
      name: item.name,
      tags: parentPath,
      source: 'postman'
    });
  }
}

if (postman.item) {
  postman.item.forEach(item => extractFromPostman(item));
}

console.log(`📊 Endpoint Counts:`);
console.log(`   OAS (oas.json): ${oasEndpoints.size} endpoints`);
console.log(`   Postman (oas.postman.json): ${postmanEndpoints.size} endpoints\n`);

// Find gaps
const inOasOnly = new Map();
const inPostmanOnly = new Map();
const inBoth = new Map();

oasEndpoints.forEach((details, key) => {
  if (postmanEndpoints.has(key)) {
    inBoth.set(key, { ...details, postman: postmanEndpoints.get(key) });
  } else {
    inOasOnly.set(key, details);
  }
});

postmanEndpoints.forEach((details, key) => {
  if (!oasEndpoints.has(key)) {
    inPostmanOnly.set(key, details);
  }
});

console.log('=' .repeat(80));
console.log('\n📋 GAP ANALYSIS\n');
console.log(`✅ In Both Specs: ${inBoth.size}`);
console.log(`⚠️  Only in OAS: ${inOasOnly.size}`);
console.log(`🆕 Only in Postman: ${inPostmanOnly.size}\n`);

// Scan SDK for implemented endpoints
const resourcesPath = path.join(process.cwd(), 'src/resources');
const implementedEndpoints = new Set();

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /this\.client\.(get|post|put|patch|delete)<[^>]*>\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const endpoint = match[2];
    implementedEndpoints.add(`${method} ${endpoint}`);
  }
}

if (fs.existsSync(resourcesPath)) {
  fs.readdirSync(resourcesPath).forEach(file => {
    if (file.endsWith('.ts')) {
      scanFile(path.join(resourcesPath, file));
    }
  });
}

console.log(`🔧 Currently Implemented in SDK: ${implementedEndpoints.size} endpoints\n`);

// Calculate what's missing from SDK
const allEndpoints = new Map([...oasEndpoints, ...postmanEndpoints]);
const missingFromSDK = new Map();

allEndpoints.forEach((details, key) => {
  if (!implementedEndpoints.has(key)) {
    missingFromSDK.set(key, details);
  }
});

// Group missing endpoints by category
const byCategory = {};

missingFromSDK.forEach((details, key) => {
  const tags = details.tags || [];
  const category = tags[0] || 'Uncategorized';
  
  if (!byCategory[category]) {
    byCategory[category] = [];
  }
  byCategory[category].push({ key, ...details });
});

console.log('=' .repeat(80));
console.log('\n🎯 MISSING FROM SDK (Priority Order)\n');

// Sort categories by count
const sortedCategories = Object.entries(byCategory)
  .sort((a, b) => b[1].length - a[1].length);

let totalMissing = 0;
sortedCategories.forEach(([category, endpoints]) => {
  totalMissing += endpoints.length;
  console.log(`\n${category} (${endpoints.length} endpoints):`);
  endpoints.forEach(ep => {
    const deprecated = ep.deprecated ? ' [DEPRECATED]' : '';
    console.log(`  ${ep.method} ${ep.path}${deprecated}`);
    if (ep.summary && ep.summary !== 'N/A') {
      console.log(`    → ${ep.summary}`);
    }
  });
});

console.log(`\n\nTotal Missing: ${totalMissing} endpoints`);
console.log(`Current Coverage: ${((implementedEndpoints.size / allEndpoints.size) * 100).toFixed(1)}%`);

// Generate implementation plan
console.log('\n' + '=' .repeat(80));
console.log('\n📝 IMPLEMENTATION PLAN\n');

const phases = [
  {
    name: 'Phase 1: Core Transaction Management',
    priority: 'HIGH',
    categories: ['Transactions', 'Payments - Credit / Debit Cards'],
    estimatedDays: 5
  },
  {
    name: 'Phase 2: Payment Methods & Tokenization',
    priority: 'HIGH',
    categories: ['Payment Tokens (tokenization)', 'Payments - ACH / Bank Transfers'],
    estimatedDays: 7
  },
  {
    name: 'Phase 3: Utilities & Validation',
    priority: 'HIGH',
    categories: ['Utilities'],
    estimatedDays: 2
  },
  {
    name: 'Phase 4: Complete CRUD Operations',
    priority: 'MEDIUM',
    categories: ['Customers', 'Subscriptions / Plans', 'Webhooks'],
    estimatedDays: 3
  },
  {
    name: 'Phase 5: Reporting & Settlements',
    priority: 'MEDIUM',
    categories: ['Deposits / Payouts', 'Disputes'],
    estimatedDays: 3
  },
  {
    name: 'Phase 6: Alternative Payment Methods',
    priority: 'LOW',
    categories: ['Payments - Gift Cards', 'Payments - Cash'],
    estimatedDays: 4
  },
  {
    name: 'Phase 7: Advanced Features',
    priority: 'LOW',
    categories: ['Payment Form (linq)', 'Channels > Merchant Management'],
    estimatedDays: 8
  },
  {
    name: 'Phase 8: Platform Features',
    priority: 'LOW',
    categories: ['Channels > ISV / Referrer', 'Channels > MarketPlace', 'Refleqtion'],
    estimatedDays: 5
  }
];

phases.forEach((phase, idx) => {
  const phaseEndpoints = [];
  phase.categories.forEach(cat => {
    if (byCategory[cat]) {
      phaseEndpoints.push(...byCategory[cat]);
    }
  });
  
  console.log(`\n${idx + 1}. ${phase.name}`);
  console.log(`   Priority: ${phase.priority}`);
  console.log(`   Endpoints: ${phaseEndpoints.length}`);
  console.log(`   Estimated: ${phase.estimatedDays} days`);
  console.log(`   Categories: ${phase.categories.join(', ')}`);
});

const totalDays = phases.reduce((sum, p) => sum + p.estimatedDays, 0);
console.log(`\n📅 Total Estimated Time: ${totalDays} days (~${Math.ceil(totalDays / 5)} weeks)`);

// Output JSON for programmatic use
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalEndpoints: allEndpoints.size,
    implemented: implementedEndpoints.size,
    missing: totalMissing,
    coverage: ((implementedEndpoints.size / allEndpoints.size) * 100).toFixed(1) + '%'
  },
  gaps: {
    inOasOnly: Array.from(inOasOnly.keys()),
    inPostmanOnly: Array.from(inPostmanOnly.keys()),
    inBoth: Array.from(inBoth.keys())
  },
  missingByCategory: Object.fromEntries(
    Object.entries(byCategory).map(([cat, eps]) => [cat, eps.length])
  ),
  implementationPlan: phases
};

fs.writeFileSync(
  path.join(process.cwd(), '.sandbox/gap-analysis-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n✅ Detailed report saved to: gap-analysis-report.json');
console.log('=' .repeat(80));
