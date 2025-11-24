const fs = require('fs');
const path = require('path');

const oasPath = path.join(__dirname, '../oas.json');
const postmanPath = path.join(__dirname, '../oas.postman.json');

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

function extractOasEndpoints(oas) {
  const endpoints = new Set();
  if (!oas || !oas.paths) return endpoints;

  Object.keys(oas.paths).forEach(urlPath => {
    Object.keys(oas.paths[urlPath]).forEach(method => {
      endpoints.add(`${method.toUpperCase()} ${urlPath}`);
    });
  });
  return endpoints;
}

function extractPostmanEndpoints(postman) {
  const endpoints = new Set();
  if (!postman || !postman.item) return endpoints;

  function traverse(items) {
    items.forEach(item => {
      if (item.item) {
        traverse(item.item);
      } else if (item.request) {
        const method = item.request.method;
        let url = '';
        if (typeof item.request.url === 'string') {
            url = item.request.url;
        } else if (item.request.url && item.request.url.raw) {
            url = item.request.url.raw;
        } else if (item.request.url && Array.isArray(item.request.url.path)) {
             url = item.request.url.path.join('/');
        }

        // Clean up URL to match OAS format (remove base URL, query params)
        // This is a heuristic and might need adjustment based on actual URL structure
        try {
            // specific to qorpay structure based on what we've seen
            // e.g. https://api.qorcommerce.io/v3/payment/sale/manual
            let cleanPath = url;
            if (url.includes('?')) {
                cleanPath = url.split('?')[0];
            }
            
            // Remove {{variable}} or protocol/host
            // Assuming paths start after /v3/ or just /api/
            // We'll try to normalize to just the path
            
            // Simple regex to grab everything after the domain or variable
            const match = cleanPath.match(/(?:\/v3|\/api\/v3)?(\/.*)/);
            if (match) {
                cleanPath = match[1];
            } else if (cleanPath.startsWith('http')) {
                 const urlObj = new URL(cleanPath);
                 cleanPath = urlObj.pathname.replace('/api/v3', '').replace('/v3', '');
            }

            endpoints.add(`${method.toUpperCase()} ${cleanPath}`);
        } catch (e) {
            // console.log('Skipping malformed URL:', url);
        }
      }
    });
  }

  traverse(postman.item);
  return endpoints;
}

const oas = loadJson(oasPath);
const postman = loadJson(postmanPath);

if (oas && postman) {
  const oasEndpoints = extractOasEndpoints(oas);
  const postmanEndpoints = extractPostmanEndpoints(postman);

  console.log(`OAS Endpoints: ${oasEndpoints.size}`);
  console.log(`Postman Endpoints: ${postmanEndpoints.size}`);

  const inOasNotPostman = [...oasEndpoints].filter(x => !postmanEndpoints.has(x));
  const inPostmanNotOas = [...postmanEndpoints].filter(x => !oasEndpoints.has(x));

  console.log('\n--- In OAS but not Postman ---');
  inOasNotPostman.forEach(x => console.log(x));

  console.log('\n--- In Postman but not OAS (Potential New/Undocumented) ---');
  inPostmanNotOas.forEach(x => console.log(x));
}
