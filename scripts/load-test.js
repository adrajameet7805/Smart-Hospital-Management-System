import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

export default function () {
  // Test Health Endpoint
  const healthRes = http.get('http://localhost:5000/api/health');
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });

  // Test Doctors List (Read-heavy endpoint)
  // Assuming the user is logged in, but for load testing we might bypass auth or use a test token
  // If authentication is required, you'd generate a token in the setup() function.
  // For now, we simulate a public endpoint or rely on cached responses if applicable.
  
  sleep(1);
}
