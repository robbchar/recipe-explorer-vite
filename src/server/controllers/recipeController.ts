import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { VertexAIService } from '../services/ai/vertex.js';
import { AuthRequest } from '../middleware/auth.js';
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
      const { title, instructions, ingredients, tags = [], categories = [], prepTime = "0", cookTime = "0", servings = 1, difficulty = "EASY" } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Validate required fields
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
        return res.status(400).json({ error: 'Instructions must be a non-empty array' });
      }

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'Ingredients must be a non-empty array' });
      }

      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array' });
      }

      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories must be an array' });
      }

      // Create the recipe first
      const recipe = await prisma.recipe.create({
        data: {
          title,
          instructions: instructions.join('\n'),
          prepTime,
          cookTime,
          servings,
          difficulty,
          userId
        }
      });

      // Add ingredients
      for (const ingredient of ingredients) {
        const ingredientRecord = await prisma.ingredient.upsert({
          where: { name: ingredient.name },
          create: { name: ingredient.name },
          update: {}
        });

        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            ingredients: {
              create: {
                amount: ingredient.amount,
                unit: ingredient.unit,
                ingredient: {
                  connect: { id: ingredientRecord.id }
                }
              }
            }
          }
        });
      }

      // Add tags
      for (const tag of tags) {
        const tagRecord = await prisma.tag.upsert({
          where: { name: tag.name },
          create: { name: tag.name },
          update: {}
        });

        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            tags: {
              create: {
                tag: {
                  connect: { id: tagRecord.id }
                }
              }
            }
          }
        });
      }

      // Add categories
      for (const category of categories) {
        const categoryRecord = await prisma.category.upsert({
          where: { name: category.name },
          create: { name: category.name },
          update: {}
        });

        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            categories: {
              create: {
                category: {
                  connect: { id: categoryRecord.id }
                }
              }
            }
          }
        });
      }

      // Get the complete recipe
      const result = await prisma.recipe.findUnique({
        where: { id: recipe.id },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          categories: {
            include: {
              category: true
            }
          }
        }
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ error: 'Failed to create recipe' });
    }
  }

  async getRecipes(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const recipes = await prisma.recipe.findMany({
        where: {
          userId
        },
        include: {
          ingredients: true,
          tags: true,
          categories: true,
          user: true
        }
      });

      res.status(200).json(recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  }

  async getRecipe(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const recipe = await prisma.recipe.findFirst({
        where: {
          id,
          userId
        },
        include: {
          ingredients: true,
          tags: true,
          categories: true,
          user: true
        }
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      if (recipe.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.status(200).json(recipe);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'Failed to fetch recipe' });
    }
  }

  async updateRecipe(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, instructions, ingredients, tags, categories } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      const updatedRecipe = await prisma.recipe.update({
        where: { id },
        data: {
          title,
          instructions,
          ingredients: {
            deleteMany: {},
            create: ingredients.map((ingredient: string) => ({
              amount: '1',
              ingredientId: {
                connectOrCreate: {
                  where: { name: ingredient },
                  create: { name: ingredient }
                }
              }
            }))
          },
          tags: {
            set: [],
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag }
            }))
          },
          categories: {
            set: [],
            connectOrCreate: categories.map((category: string) => ({
              where: { name: category },
              create: { name: category }
            }))
          }
        },
        include: {
          ingredients: true,
          tags: true,
          categories: true,
          user: true
        }
      });

      res.status(200).json(updatedRecipe);
    } catch (error) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ error: 'Failed to update recipe' });
    }
  }

  async deleteRecipe(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // First verify the recipe belongs to the user
      const recipe = await prisma.recipe.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      await prisma.recipe.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      res.status(500).json({ error: 'Failed to delete recipe' });
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { category } = req.params;
      if (!isValidCategory(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      const categoryRecord = await prisma.category.findUnique({
        where: { name: category }
      });

      if (!categoryRecord) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const recipes = await prisma.recipe.findMany({
        where: {
          userId,
          categories: {
            some: {
              categoryId: categoryRecord.id
            }
          }
        },
        include: {
          ingredients: true,
          tags: true,
          categories: true,
          user: true
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
      const userId = req.user?.id;
      if (!userId) {
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

      const existingRecipe = await prisma.recipe.findFirst({
        where: { 
          id,
          userId
        }
      });

      if (!existingRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // First ensure all categories exist
      const categoryPromises = categories.map(async (categoryName: string) => {
        return prisma.category.upsert({
          where: { name: categoryName },
          create: { name: categoryName },
          update: {}
        });
      });

      const createdCategories = await Promise.all(categoryPromises);

      // Update recipe with new categories
      const recipe = await prisma.recipe.update({
        where: { id },
        data: {
          categories: {
            deleteMany: {},
            connectOrCreate: createdCategories.map(category => ({
              where: {
                recipeId_categoryId: {
                  recipeId: id,
                  categoryId: category.id
                }
              },
              create: {
                categoryId: category.id
              }
            }))
          }
        },
        include: {
          ingredients: true,
          tags: true,
          categories: true,
          user: true
        }
      });

      return res.status(200).json(recipe);
    } catch (error) {
      console.error('Recipe Category Update Error:', error);
      return res.status(500).json({ error: 'Failed to update recipe categories' });
    }
  }
} 

