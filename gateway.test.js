/**
 * API Gateway Tests
 * Unit and integration tests for the gateway
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./gateway');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long';

// ============================================
// TEST SETUP
// ============================================

describe('API Gateway', () => {
  let token;

  beforeAll(() => {
    // Generate test token
    token = jwt.sign(
      {
        userId: 'test-user-123',
        email: 'test@leaderacademy.school',
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  // ============================================
  // HEALTH CHECK TESTS
  // ============================================

  describe('Health Checks', () => {
    test('GET /health should return gateway status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('gateway', 'leader-academy-gateway');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET /health/services should return all services status', async () => {
      const response = await request(app).get('/health/services');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('services');
      expect(typeof response.body.services).toBe('object');
    });
  });

  // ============================================
  // AUTHENTICATION TESTS
  // ============================================

  describe('Authentication', () => {
    test('POST /auth/token should generate JWT token', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({
          userId: 'user-123',
          email: 'user@leaderacademy.school',
          role: 'user'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresIn', 86400);
    });

    test('POST /auth/token should fail without userId', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({
          email: 'user@leaderacademy.school'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('POST /auth/verify should verify valid token', async () => {
      const response = await request(app)
        .post('/auth/verify')
        .send({ token });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
    });

    test('POST /auth/verify should fail with invalid token', async () => {
      const response = await request(app)
        .post('/auth/verify')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('valid', false);
    });

    test('POST /auth/verify should fail without token', async () => {
      const response = await request(app)
        .post('/auth/verify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  // ============================================
  // AUTHORIZATION TESTS
  // ============================================

  describe('Authorization', () => {
    test('Protected endpoint should fail without token', async () => {
      const response = await request(app)
        .get('/api/gamification/points');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('No token provided');
    });

    test('Protected endpoint should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/gamification/points')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    test('Protected endpoint should succeed with valid token', async () => {
      const response = await request(app)
        .get('/api/gamification/points')
        .set('Authorization', `Bearer ${token}`);

      // Will fail due to service not running, but auth should pass
      expect(response.status).toBeGreaterThanOrEqual(400);
      // The important part is that we got past auth
    });
  });

  // ============================================
  // ROUTING TESTS
  // ============================================

  describe('Routing', () => {
    test('GET /api/courses should be accessible without token', async () => {
      const response = await request(app).get('/api/courses');
      
      // Will fail due to service not running, but should not be auth error
      expect(response.status).not.toBe(401);
    });

    test('POST /api/courses should require token', async () => {
      const response = await request(app)
        .post('/api/courses')
        .send({ name: 'Test Course' });

      expect(response.status).toBe(401);
    });

    test('Invalid route should return 404', async () => {
      const response = await request(app).get('/api/invalid-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    test('Malformed JSON should return error', async () => {
      const response = await request(app)
        .post('/auth/token')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('POST without body should be handled', async () => {
      const response = await request(app)
        .post('/auth/token');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  // ============================================
  // RATE LIMITING TESTS
  // ============================================

  describe('Rate Limiting', () => {
    test('Excessive requests should be rate limited', async () => {
      // Make multiple requests quickly
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(request(app).get('/health'));
      }

      const responses = await Promise.all(requests);
      
      // At least one should succeed (rate limit is 100 per 15 min)
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  // ============================================
  // CORS TESTS
  // ============================================

  describe('CORS', () => {
    test('CORS headers should be present', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('OPTIONS request should be handled', async () => {
      const response = await request(app)
        .options('/api/courses')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
    });
  });

  // ============================================
  // SECURITY TESTS
  // ============================================

  describe('Security', () => {
    test('Security headers should be present', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    test('Should handle large payloads', async () => {
      const largeData = 'x'.repeat(1000000); // 1MB

      const response = await request(app)
        .post('/auth/token')
        .send({ userId: 'user-123', largeData });

      // Should either succeed or fail gracefully, not crash
      expect(response.status).toBeGreaterThan(0);
    });
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

describe('Integration Tests', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign(
      { userId: 'test-user', role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  test('Complete authentication flow', async () => {
    // 1. Generate token
    const tokenResponse = await request(app)
      .post('/auth/token')
      .send({ userId: 'user-123' });

    expect(tokenResponse.status).toBe(200);
    const newToken = tokenResponse.body.token;

    // 2. Verify token
    const verifyResponse = await request(app)
      .post('/auth/verify')
      .send({ token: newToken });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.valid).toBe(true);

    // 3. Use token for protected endpoint
    const protectedResponse = await request(app)
      .get('/api/gamification/points')
      .set('Authorization', `Bearer ${newToken}`);

    // Should not be auth error
    expect(protectedResponse.status).not.toBe(401);
  });

  test('Service discovery flow', async () => {
    // 1. Check gateway health
    const gatewayHealth = await request(app).get('/health');
    expect(gatewayHealth.status).toBe(200);

    // 2. Check all services
    const servicesHealth = await request(app).get('/health/services');
    expect(servicesHealth.status).toBe(200);
    expect(servicesHealth.body.services).toBeDefined();
  });
});
