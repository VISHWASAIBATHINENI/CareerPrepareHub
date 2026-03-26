import request from 'supertest';

import app from '../src/app.js';

describe('POST /api/auth/signup validation', () => {
  it('should reject weak password and invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: 'weak',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});
