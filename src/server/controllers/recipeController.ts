import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { VertexAIService } from '../services/ai/vertex';
import { AuthRequest } from '../middleware/auth';
import { PREDEFINED_CATEGORIES, isValidCategory } from '../constants/categories';

const prisma = new PrismaClient();

function parseIngredient(ingredientString: string): { name: string; amount: string; unit: string } {
  // Match pattern: AMOUNT UNIT NAME
  // This regex handles:
  // - Whole numbers and fractions (e.g., "2" or "1/2")
  // - Units that may contain spaces (e.g., "fluid ounces")
  // - Ingredient names that may contain spaces
  const match = ingredientString.match(/^([\d./]+)\s+(.+?)\s+(.+)$/);
  
  if (match) {
    const [, amount, unit, name] = match;
    return { name: name.trim(), amount: amount.trim(), unit: unit.trim() };
  }
  
  // Fallback if the format doesn't match exactly
  return { name: ingredientString, amount: '1', unit: 'unit' };
}

export class RecipeController {
  private aiService: VertexAIService;

  constructor() {
    this.aiService = new VertexAIService();
  }

  async generateRecipe(req: AuthRequest, res: Response) {
    try {
      const prompt = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Fix: Add proper validation check
      if (!prompt || Object.keys(prompt).length === 0) {
        return res.status(400).json({ error: 'Recipe prompt is required' });
      }

      const aiRecipe = await this.aiService.generateRecipe(prompt);

      // Check for existing recipe with same title
      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          userId,
          title: aiRecipe.title
        }
      });

      if (existingRecipe) {
        return res.status(409).json({
          error: 'Recipe with this title already exists',
          existingRecipe,
          preview: aiRecipe
        });
      }
      
      // Format the recipe for preview
      const recipePreview = {
        ...aiRecipe,
        ingredients: aiRecipe.ingredients.map(parseIngredient),
        difficulty: aiRecipe.difficulty.toUpperCase(),
        prepTime: aiRecipe.prepTime || "0",
        cookTime: aiRecipe.cookTime || "0",
        servings: String(aiRecipe.servings || 1),
        isPreview: true
      };

      return res.status(200).json({ preview: recipePreview });
    } catch (error) {
      console.error('Recipe Generation Error:', error);
      return res.status(500).json({ error: 'Failed to generate recipe' });
    }
  }

  async createRecipe(req: AuthRequest, res: Response) {
    try {
      const { title, instructions, ingredients, tags = [], categories = [], prepTime = "0", cookTime = "0", servings = "1", difficulty = "EASY" } = req.body;
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

      // Use a transaction to ensure all operations succeed or fail together
      const result = await prisma.$transaction(async (tx) => {
        // Create the recipe
        const recipe = await tx.recipe.create({
          data: {
            title,
            instructions: Array.isArray(instructions) ? instructions.join('\n') : instructions,
            prepTime,
            cookTime,
            servings,
            difficulty: difficulty.toUpperCase(),
            userId
          }
        });

        // Add ingredients
        await Promise.all(ingredients.map(async (ingredient) => {
          const ingredientRecord = await tx.ingredient.upsert({
            where: { name: ingredient.name },
            create: { name: ingredient.name },
            update: {}
          });

          await tx.recipeIngredient.create({
            data: {
              recipeId: recipe.id,
              ingredientId: ingredientRecord.id,
              amount: ingredient.amount || '1',
              unit: ingredient.unit || 'unit'
            }
          });
        }));

        // Add tags
        await Promise.all(tags.map(async (tag) => {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          const tagRecord = await tx.tag.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {}
          });

          await tx.recipeTag.create({
            data: {
              recipeId: recipe.id,
              tagId: tagRecord.id
            }
          });
        }));

        // Add categories
        await Promise.all(categories.map(async (category) => {
          const categoryName = typeof category === 'string' ? category : category.name;
          const categoryRecord = await tx.category.upsert({
            where: { name: categoryName },
            create: { name: categoryName },
            update: {}
          });

          await tx.recipeCategory.create({
            data: {
              recipeId: recipe.id,
              categoryId: categoryRecord.id
            }
          });
        }));

        // Get the complete recipe
        return await tx.recipe.findUnique({
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
          },
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

  // Add new method to save previewed recipe
  async saveRecipe(req: AuthRequest, res: Response) {
    try {
      const recipe = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check for existing recipe again (in case it was created while previewing)
      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          userId,
          title: {
            equals: recipe.title?.toLowerCase()
          }
        }
      });

      if (existingRecipe) {
        return res.status(409).json({
          error: 'Recipe with this title already exists',
          existingRecipe
        });
      }

      // Format the recipe for database storage
      const recipeData = {
        title: recipe.title,
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions,
        prepTime: recipe.prepTime || "0",
        cookTime: recipe.cookTime || "0",
        servings: recipe.servings || "1",
        difficulty: recipe.difficulty.toUpperCase(),
        user: {
          connect: { id: userId }
        },
        ingredients: {
          create: recipe.ingredients.map((ingredient: { name: string; amount: string; unit: string }) => ({
            amount: ingredient.amount,
            unit: ingredient.unit,
            ingredient: {
              connectOrCreate: {
                where: { name: ingredient.name },
                create: { name: ingredient.name }
              }
            }
          }))
        },
        tags: {
          create: recipe.tags.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        }
      };

      // Create the recipe
      const result = await prisma.recipe.create({
        data: recipeData,
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
          categories: true,
          user: true
        }
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Recipe Save Error:', error);
      return res.status(500).json({ error: 'Failed to save recipe', rawError: error });
    }
  }
} 

