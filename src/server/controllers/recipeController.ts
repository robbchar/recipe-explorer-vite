import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { VertexAIService } from '../services/ai/vertex.js';
import { AuthRequest } from '../middleware/auth.js';
import { validateRecipe } from '../utils/validation.js';
import { PREDEFINED_CATEGORIES, isValidCategory } from '../constants/categories.js';

const prisma = new PrismaClient();

export class RecipeController {
  private aiService: VertexAIService;

  constructor() {
    this.aiService = new VertexAIService();
  }

  async generateRecipe(req: AuthRequest, res: Response) {
    try {
      const prompt = req.body;
      // Fix: Add proper validation check
      if (!prompt || Object.keys(prompt).length === 0) {
        return res.status(400).json({ error: 'Recipe prompt is required' });
      }

      const recipe = await this.aiService.generateRecipe(prompt);
      return res.status(200).json(recipe);
    } catch (error) {
      console.error('Recipe Generation Error:', error);
      // Fix: Ensure error returns 500 status
      return res.status(500).json({ error: 'Failed to generate recipe' });
    }
  }

  async createRecipe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const recipeData = req.body;
      const userId = req.user.id;

      const validationError = validateRecipe(recipeData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const recipe = await prisma.recipe.create({
        data: {
          ...recipeData,
          userId,
          ingredients: {
            create: recipeData.ingredients.map((name: string) => ({
              name,
              amount: "1"
            }))
          },
          tags: {
            connectOrCreate: recipeData.tags.map((name: string) => ({
              where: { name },
              create: { name }
            }))
          }
        },
        include: {
          ingredients: true,
          tags: true
        }
      });

      return res.status(201).json(recipe);
    } catch (error) {
      console.error('Recipe Creation Error:', error);
      return res.status(500).json({ error: 'Failed to create recipe' });
    }
  }

  async getRecipes(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = req.user.id;
      const recipes = await prisma.recipe.findMany({
        where: { userId },
        include: {
          ingredients: true,
          tags: true
        }
      });
      return res.status(200).json(recipes);
    } catch (error) {
      console.error('Recipe Fetch Error:', error);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  }

  async getRecipe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id } = req.params;
      const userId = req.user.id;

      const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: true,
          tags: true
        }
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      if (recipe.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to access this recipe' });
      }

      return res.status(200).json(recipe);
    } catch (error) {
      console.error('Recipe Fetch Error:', error);
      return res.status(500).json({ error: 'Failed to fetch recipe' });
    }
  }

  async updateRecipe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id } = req.params;
      const userId = req.user.id;
      const recipeData = req.body;

      const validationError = validateRecipe(recipeData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const existingRecipe = await prisma.recipe.findUnique({ where: { id } });
      if (!existingRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      if (existingRecipe.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this recipe' });
      }

      const recipe = await prisma.recipe.update({
        where: { id },
        data: {
          ...recipeData,
          ingredients: {
            deleteMany: {},
            create: recipeData.ingredients.map((name: string) => ({
              name,
              amount: "1"
            }))
          },
          tags: {
            set: [],
            connectOrCreate: recipeData.tags.map((name: string) => ({
              where: { name },
              create: { name }
            }))
          }
        },
        include: {
          ingredients: true,
          tags: true
        }
      });

      return res.status(200).json(recipe);
    } catch (error) {
      console.error('Recipe Update Error:', error);
      return res.status(500).json({ error: 'Failed to update recipe' });
    }
  }

  async deleteRecipe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id } = req.params;
      const userId = req.user.id;

      const existingRecipe = await prisma.recipe.findUnique({ where: { id } });
      if (!existingRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      if (existingRecipe.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this recipe' });
      }

      await prisma.recipe.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error('Recipe Deletion Error:', error);
      return res.status(500).json({ error: 'Failed to delete recipe' });
    }
  }

  async getCategories(_req: AuthRequest, res: Response) {
    try {
      return res.status(200).json(PREDEFINED_CATEGORIES);
    } catch (error) {
      console.error('Category Fetch Error:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  async getRecipesByCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { category } = req.params;
      if (!isValidCategory(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      const recipes = await prisma.recipe.findMany({
        where: {
          userId: req.user.id,
          categories: {
            some: {
              name: category
            }
          }
        },
        include: {
          ingredients: true,
          tags: true,
          categories: true
        }
      });

      return res.status(200).json(recipes);
    } catch (error) {
      console.error('Recipe Fetch Error:', error);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  }

  async updateRecipeCategories(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      const { categories } = req.body;

      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories must be an array' });
      }

      if (!categories.every(isValidCategory)) {
        return res.status(400).json({ error: 'Invalid category provided' });
      }

      const existingRecipe = await prisma.recipe.findUnique({ where: { id } });
      if (!existingRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      if (existingRecipe.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this recipe' });
      }

      const recipe = await prisma.recipe.update({
        where: { id },
        data: {
          categories: {
            set: [],
            connectOrCreate: categories.map(name => ({
              where: { name },
              create: { name }
            }))
          }
        },
        include: {
          ingredients: true,
          tags: true,
          categories: true
        }
      });

      return res.status(200).json(recipe);
    } catch (error) {
      console.error('Recipe Category Update Error:', error);
      return res.status(500).json({ error: 'Failed to update recipe categories' });
    }
  }
} 