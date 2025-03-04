import { VertexAI } from '@google-cloud/vertexai';
import { RecipePrompt, RecipeData } from '../../types/recipe';
import { config } from '../../config/env';

// Initialize Vertex AI
const vertex = new VertexAI({
  project: config.googleCloudProject,
  location: config.googleCloudLocation,
});

// Get the model
const model = vertex.preview.getGenerativeModel({
  model: config.googleAiModel,
});

export class VertexAIService {
  private generatePrompt(recipePrompt: RecipePrompt): string {
    return `Generate a recipe with the following requirements:
      ${recipePrompt.ingredients ? `Must use these ingredients: ${recipePrompt.ingredients.join(', ')}` : ''}
      ${recipePrompt.dietary ? `Dietary restrictions: ${recipePrompt.dietary.join(', ')}` : ''}
      ${recipePrompt.cuisine ? `Cuisine type: ${recipePrompt.cuisine}` : ''}
      ${recipePrompt.mealType ? `Meal type: ${recipePrompt.mealType}` : ''}
      ${recipePrompt.difficulty ? `Difficulty level: ${recipePrompt.difficulty}` : ''}
      
      Please provide the recipe in the following JSON format, with ingredients in "AMOUNT UNIT NAME" format (e.g., "2 cups flour", "1 tablespoon sugar"):
      {
        "title": "Recipe Title",
        "ingredients": ["2 cups flour", "1 tablespoon sugar"],
        "instructions": ["step 1", "step 2"],
        "prepTime": "30 minutes",
        "cookTime": "45 minutes",
        "servings": 4,
        "difficulty": "medium",
        "tags": ["tag1", "tag2"]
      }

      Important: Each ingredient MUST follow the format "AMOUNT UNIT NAME" (e.g., "2 cups flour", "1 tablespoon sugar", "3 whole eggs", "1/2 teaspoon salt").`;
  }

  async generateRecipe(prompt: RecipePrompt): Promise<RecipeData> {
    try {
      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: this.generatePrompt(prompt) }] },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      const response = result.response;
      if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No response from AI');
      }

      return JSON.parse(
        response.candidates[0].content.parts[0].text,
      ) as RecipeData;
    } catch (error) {
      // console.error('AI Recipe Generation Error:', error);
      throw new Error('Failed to generate recipe');
    }
  }
}
