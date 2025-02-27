import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validateEmail, validatePassword } from '../utils/validation.js';
import { UserRegistrationData, UserLoginData } from '../types/user.js';

// Temporary storage until we add database
const users: { email: string; password: string }[] = [];

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password }: UserRegistrationData = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers' 
        });
      }
      
      // Check if user exists
      if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password and store user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      users.push({ email, password: hashedPassword });

      return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password }: UserLoginData = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Find user and verify password
      const user = users.find(u => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// example usage:
// Registration request
// fetch('/api/auth/register', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     email: 'user@example.com',
//     password: 'Password123'
//   })
// });

// // Login request
// fetch('/api/auth/login', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     email: 'user@example.com',
//     password: 'Password123'
//   })
// });