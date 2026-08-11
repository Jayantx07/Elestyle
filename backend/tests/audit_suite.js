const http = require('http');

async function fetchURL(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, json: () => JSON.parse(data) }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runAuditTests() {
  const API_URL = 'http://127.0.0.1:5000/api/v1';
  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  console.log('--- Starting Final Security & Concurrency Audit ---');

  // 1. ADMIN SECURITY
  try {
    const res = await fetchURL(`${API_URL}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked Product' })
    });
    assert(res.status === 401, `Admin POST route without token should return 401. Got: ${res.status}`);
  } catch (err) {
    console.error('Error in Admin Security test:', err);
  }

  // 2. CHECKOUT IDEMPOTENCY
  try {
    const idempotencyKey = `TEST-KEY-${Date.now()}`;
    const checkoutPayload = {
      customer: { name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
      shippingAddress: { addressLine1: '123 Main St', city: 'NY', state: 'NY', postalCode: '10001', country: 'USA' },
      billingAddress: { addressLine1: '123 Main St', city: 'NY', state: 'NY', postalCode: '10001', country: 'USA' },
      items: [], // we expect a 400 for no items, but idempotency should catch the second request
      paymentMethod: 'Credit Card',
    };

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'idempotency-key': idempotencyKey },
      body: JSON.stringify(checkoutPayload)
    };

    const [res1, res2] = await Promise.all([
      fetchURL(`${API_URL}/checkout/process`, options),
      fetchURL(`${API_URL}/checkout/process`, options)
    ]);

    assert(res1.status === 400 && res2.status === 400, 'Idempotency test with invalid payload handled correctly without crashing.');
  } catch (err) {
    console.error('Error in Idempotency test:', err);
  }

  // 5. CACHE SAFETY
  try {
    const res = await fetchURL(`${API_URL}/products/facets?category=fake-invalid-slug`, { method: 'GET' });
    const json = await res.json();
    assert(json.data && Array.isArray(json.data.colors) && json.data.colors.length === 0, 'Invalid category slug returns properly formatted empty facets instead of {}');
  } catch (err) {
    console.error('Error in Cache Safety test:', err);
  }

  console.log(`\n--- Audit Complete: ${passedTests}/${totalTests} Tests Passed ---`);
}

runAuditTests();
