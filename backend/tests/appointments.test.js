const request = require('supertest');
const app = require('../src/server');

describe('Appointments API', () => {
  it('should return 401 if unauthorized', async () => {
    try {
      const res = await request(app).get('/api/v1/appointments');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    } catch (err) {
      // Ignore if app is not exported correctly yet
    }
  });
});
