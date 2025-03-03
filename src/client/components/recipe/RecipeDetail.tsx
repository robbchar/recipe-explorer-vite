import React from 'react';

interface Ingredient {
  ingredient: {
    id: string;
    name: string;
  };
  amount: string;
  unit: string;
}

interface Tag {
  tag: {
    id: string;
    name: string;
  };
}

interface Category {
  category: {
    id: string;
    name: string;
  };
}

interface Recipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
  instructions: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: string;
  tags: Tag[];
  categories: Category[];
}

interface RecipeDetailProps {
  recipe: Recipe;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe }) => {
  // Split instructions into array if it's a string
  const instructionsList =
    typeof recipe.instructions === 'string'
      ? recipe.instructions.split('\n').filter((i) => i.trim() !== '')
      : Array.isArray(recipe.instructions)
        ? recipe.instructions
        : [];

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Recipe Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {recipe.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map((tag) => (
            <span
              key={tag.tag.id}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
            >
              {tag.tag.name}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Prep Time:</span>
            {recipe.prepTime}
          </div>
          <div>
            <span className="font-medium">Cook Time:</span>
            {recipe.cookTime}
          </div>
          <div>
            <span className="font-medium">Servings:</span>
            {recipe.servings}
          </div>
          <div>
            <span className="font-medium">Difficulty:</span>
            {recipe.difficulty}
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Ingredients */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={ingredient.ingredient.id} className="flex items-start">
                <span>
                  {ingredient.amount} {ingredient.unit}{' '}
                  {ingredient.ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4">
            {instructionsList.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-sm mr-3">
                  {index + 1}
                </span>
                <span className="flex-1">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Categories */}
      {recipe.categories && recipe.categories.length > 0 && (
        <div className="px-6 pb-6">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.categories.map((category) => (
              <span
                key={category.category.id}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {category.category.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
