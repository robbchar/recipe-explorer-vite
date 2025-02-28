export interface RecipePrompt {
  ingredients?: string[];
  dietary?: string[];
  cuisine?: string;
  mealType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  tags: string[];
} 