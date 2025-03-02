import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route example
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  res.json({ 
    message: 'Protected route accessed successfully', 
    user: req.user 
  });
});

export default router; 