import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const router = Router();

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        user: true,
        ingredients: true,
        tags: true,
        categories: true
      }
    });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Create a new recipe
router.post('/', async (req, res) => {
  try {
    const { title, instructions, ingredients, tags, categories, userId } = req.body;
    
    const recipeData: Prisma.RecipeCreateInput = {
      title,
      instructions,
      prepTime: '0',
      cookTime: '0',
      servings: 1,
      difficulty: 'EASY',
      user: {
        connect: { id: userId }
      },
      ingredients: {
        create: ingredients.map((ing: { name: string; amount: string; unit?: string }) => ({
          amount: ing.amount,
          unit: ing.unit,
          ingredient: {
            connectOrCreate: {
              where: { name: ing.name },
              create: { name: ing.name }
            }
          }
        }))
      },
      tags: {
        create: tags.map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName }
            }
          }
        }))
      },
      categories: {
        create: categories.map((categoryName: string) => ({
          category: {
            connectOrCreate: {
              where: { name: categoryName },
              create: { name: categoryName }
            }
          }
        }))
      }
    };

    const recipe = await prisma.recipe.create({
      data: recipeData,
      include: {
        user: true,
        ingredients: true,
        tags: true,
        categories: true
      }
    });
    
    res.json(recipe);
  } catch (error) {
    console.error('Failed to create recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

export default router; 