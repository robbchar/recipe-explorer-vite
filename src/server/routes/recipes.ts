import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RecipeController } from '../controllers/recipeController';

const router = Router();
const recipeController = new RecipeController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all categories (must be before /:id routes)
router.get('/categories/all', async (req: AuthRequest, res) => {
  await recipeController.getCategories(req, res);
});

// Get recipes by category (must be before /:id routes)
router.get('/categories/:category', async (req: AuthRequest, res) => {
  await recipeController.getRecipesByCategory(req, res);
});

// Generate recipe preview
router.post('/generate', async (req: AuthRequest, res) => {
  await recipeController.generateRecipe(req, res);
});

// Save previewed recipe
router.post('/save', async (req: AuthRequest, res) => {
  await recipeController.saveRecipe(req, res);
});

// Get all recipes
router.get('/', async (req: AuthRequest, res) => {
  await recipeController.getRecipes(req, res);
});

// Create a new recipe manually
router.post('/', async (req: AuthRequest, res) => {
  await recipeController.createRecipe(req, res);
});

// Get recipe by id
router.get('/:id', async (req: AuthRequest, res) => {
  await recipeController.getRecipe(req, res);
});

// Update recipe
router.put('/:id', async (req: AuthRequest, res) => {
  await recipeController.updateRecipe(req, res);
});

// Delete recipe
router.delete('/:id', async (req: AuthRequest, res) => {
  await recipeController.deleteRecipe(req, res);
});

// Update recipe categories
router.put('/:id/categories', async (req: AuthRequest, res) => {
  await recipeController.updateRecipeCategories(req, res);
});

export default router;
