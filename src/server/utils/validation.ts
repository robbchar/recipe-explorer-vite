import { RecipeData } from '../types/recipe';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export function validateRecipe(recipe: Partial<RecipeData>): string | null {
  if (!recipe.title?.trim()) {
    return 'Recipe title is required';
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    return 'Recipe must have at least one ingredient';
  }

  if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
    return 'Recipe must have at least one instruction';
  }

  if (!recipe.prepTime?.trim()) {
    return 'Preparation time is required';
  }

  if (!recipe.cookTime?.trim()) {
    return 'Cooking time is required';
  }

  if (typeof recipe.servings !== 'number' || recipe.servings < 1) {
    return 'Valid number of servings is required';
  }

  if (!recipe.difficulty?.trim()) {
    return 'Difficulty level is required';
  }

  return null;
} 