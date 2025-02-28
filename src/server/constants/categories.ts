export const PREDEFINED_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Appetizer',
  'Snack',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Low-Carb',
  'Mediterranean',
  'Asian',
  'Mexican',
  'Italian',
  'Quick & Easy',
  'Slow Cooker',
  'Meal Prep',
  'Holiday'
] as const;

export type RecipeCategory = typeof PREDEFINED_CATEGORIES[number];

export function isValidCategory(category: string): category is RecipeCategory {
  return PREDEFINED_CATEGORIES.includes(category as RecipeCategory);
} 