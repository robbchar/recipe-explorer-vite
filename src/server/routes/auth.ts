import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Protected route to get user profile
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  // If we get here, the token is valid and req.user is set
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Return the user data
  return res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

export default router; 