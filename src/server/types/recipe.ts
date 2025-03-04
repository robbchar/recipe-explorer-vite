export interface RecipeData {
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  tags: string[];
}

export interface RecipePrompt {
  ingredients?: string[];
  dietary?: string[];
  cuisine?: string;
  mealType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
