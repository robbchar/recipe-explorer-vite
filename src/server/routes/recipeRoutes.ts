import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const recipeController = new RecipeController();

router.post('/generate', authenticateToken, recipeController.generateRecipe.bind(recipeController));

export default router; 