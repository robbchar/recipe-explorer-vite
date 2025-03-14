import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthController } from '../authController';
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

// Get the mocked prisma instance
const mockPrisma = jest.requireMock('../../lib/prisma').default;

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject = {};

  beforeEach(() => {
    jest.clearAllMocks();
    authController = new AuthController();
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
    };
  });

  describe('register', () => {
    it('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'Password123' };
      
      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Email and password are required'
      });
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };
      
      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Email and password are required'
      });
    });

    it('should return 400 if email format is invalid', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'Password123'
      };
      
      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Invalid email format'
      });
    });

    it('should return 400 if password format is invalid', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'weak'
      };
      
      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
      });
    });

    it('should return token on successful registration', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      mockPrisma.user.create.mockResolvedValueOnce(mockUser);
      
      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toHaveProperty('token');
      
      // Verify token is valid
      const token = (responseObject as any).token;
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded).toHaveProperty('userId', '123');
    });
  });

  describe('login', () => {
    it('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'Password123' };
      
      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Email and password are required'
      });
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };
      
      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Email and password are required'
      });
    });

    it('should return 400 if email format is invalid', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'Password123'
      };
      
      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Invalid email format'
      });
    });

    it('should return token on successful login', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      
      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toHaveProperty('token');
      
      // Verify token is valid
      const token = (responseObject as any).token;
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded).toHaveProperty('userId', '123');
    });
  });
}); 