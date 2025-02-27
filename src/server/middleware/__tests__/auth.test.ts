import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should authenticate valid token', () => {
    const token = jwt.sign({ id: '1', email: 'test@example.com' }, JWT_SECRET);
    mockRequest.headers = {
      authorization: `Bearer ${token}`
    };

    authenticateToken(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toEqual(
      expect.objectContaining({
        email: 'test@example.com'
      })
    );
  });

  it('should reject request without token', () => {
    authenticateToken(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Authentication required'
    });
  });

  it('should reject invalid token', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token'
    };

    authenticateToken(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token'
    });
  });
}); 