import request from 'supertest';
import express from 'express';
import authRoutes from './authRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'User registered successfully'
      });
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid email format'
      });
    });

    it('should reject registration with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
      });
    });
  });

  // this is temporary in that it doesnt actually verify a good user since we don't save anything yet
  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Login successful'
      });
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid email format'
      });
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Email and password are required'
      });
    });
  });
}); 