import request from 'supertest';
import express from 'express';
import authRoutes from '../authRoutes';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../constants/auth';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock the prisma instance
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
    $use: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Get the mocked prisma instance
const mockPrisma = jest.requireMock('../../lib/prisma').default;

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return token on successful registration', async () => {
      // Mock successful user creation
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };
      
      mockPrisma.user.create.mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
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

  describe('POST /api/auth/login', () => {
    it('should return token on successful login', async () => {
      // Mock successful user lookup
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz' // Mock hashed password
      };
      
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
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

  describe('GET /api/auth/profile', () => {
    it('should access protected route with valid token', async () => {
      // Create a valid token
      const testUser = {
        id: '123',
        email: 'test@example.com'
      };
      
      const authToken = jwt.sign(testUser, JWT_SECRET);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });
}); 