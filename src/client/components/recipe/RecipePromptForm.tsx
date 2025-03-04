import React, { useState } from 'react';

export interface RecipePromptFormData {
  ingredients: string[];
  dietary: string[];
  cuisine: string;
  mealType: string;
  difficulty: string;
}

interface RecipePromptFormProps {
  onSubmit: (data: RecipePromptFormData) => void;
  isLoading?: boolean;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Low-Carb',
  'Paleo',
] as const;

const CUISINE_TYPES = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Mediterranean',
  'American',
  'French',
  'Thai',
] as const;

const MEAL_TYPES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
] as const;

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;

export const RecipePromptForm: React.FC<RecipePromptFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [ingredients, setIngredients] = useState<string>('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string>('');
  const [mealType, setMealType] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ingredients: ingredients.split(',').map((i) => i.trim()),
      dietary,
      cuisine,
      mealType,
      difficulty,
    });
  };

  const handleDietaryChange = (option: string) => {
    setDietary((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow"
    >
      <div>
        <label
          htmlFor="ingredients"
          className="block text-sm font-medium text-gray-700"
        >
          Ingredients
        </label>
        <input
          type="text"
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients separated by commas"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Dietary Preferences
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {DIETARY_OPTIONS.map((option) => (
            <label key={option} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={dietary.includes(option)}
                onChange={() => handleDietaryChange(option)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="cuisine"
          className="block text-sm font-medium text-gray-700"
        >
          Cuisine Type
        </label>
        <select
          id="cuisine"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select cuisine</option>
          {CUISINE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="mealType"
          className="block text-sm font-medium text-gray-700"
        >
          Meal Type
        </label>
        <select
          id="mealType"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select meal type</option>
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="difficulty"
          className="block text-sm font-medium text-gray-700"
        >
          Difficulty Level
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select difficulty</option>
          {DIFFICULTY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || !ingredients.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        {isLoading ? 'Generating Recipe...' : 'Generate Recipe'}
      </button>
    </form>
  );
};
