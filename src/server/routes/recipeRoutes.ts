import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const recipeController = new RecipeController();

// AI recipe generation
router.post('/generate', authenticateToken, recipeController.generateRecipe.bind(recipeController));

// CRUD operations
router.post('/', authenticateToken, recipeController.createRecipe.bind(recipeController));
router.get('/', authenticateToken, recipeController.getRecipes.bind(recipeController));
router.get('/:id', authenticateToken, recipeController.getRecipe.bind(recipeController));
router.put('/:id', authenticateToken, recipeController.updateRecipe.bind(recipeController));
router.delete('/:id', authenticateToken, recipeController.deleteRecipe.bind(recipeController));

// Add these routes
router.get('/categories', authenticateToken, recipeController.getCategories.bind(recipeController));
router.get('/category/:category', authenticateToken, recipeController.getRecipesByCategory.bind(recipeController));
router.patch('/:id/categories', authenticateToken, recipeController.updateRecipeCategories.bind(recipeController));

export default router; 