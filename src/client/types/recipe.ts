export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  title: string;
  instructions: string[];
  ingredients: Ingredient[];
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: string;
  tags: string[];
}

export interface RecipePreviewProps {
  previewRecipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onGenerateNew: () => void;
  existingRecipe?: Recipe;
  isLoading?: boolean;
}
