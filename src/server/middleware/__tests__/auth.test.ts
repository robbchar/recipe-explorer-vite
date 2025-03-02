import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../auth';
import { JWT_SECRET } from '../../constants/auth';

describe('Auth Middleware', () => {
  let mockRequest: AuthRequest;
  let mockResponse: Partial<Response>;
  let nextFunction = jest.fn() as jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    } as AuthRequest;
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction.mockClear();
  });

  it('should authenticate valid token', async () => {
    const token = jwt.sign({ id: '1', email: 'test@example.com' }, JWT_SECRET);
    mockRequest.headers = {
      authorization: `Bearer ${token}`
    };

    await authenticateToken(
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