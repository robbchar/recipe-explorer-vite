import { config } from '../config/env';

// JWT secret key for token signing and verification
// In production, this should be a secure, randomly generated string stored in environment variables
export const JWT_SECRET: string = config.jwtSecret;

// Token expiration time
export const JWT_EXPIRES_IN = '24h';

// Cookie options
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  signed: true,
  secure: config.nodeEnv === 'production',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Auth-related error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  TOKEN_EXPIRED: 'Invalid or expired token',
  INVALID_TOKEN: 'Invalid or expired token',
  NO_TOKEN: 'Authentication required',
  EMAIL_IN_USE: 'Email is already in use',
} as const; 