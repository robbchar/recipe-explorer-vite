import { VertexAIService } from '../vertex.js';
import { RecipePrompt } from '../types.js';

// Mock the VertexAI client
const mockGenerateContent = jest.fn();
jest.mock('@google-cloud/vertexai', () => ({
  VertexAI: jest.fn().mockImplementation(() => ({
    preview: {
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: () => mockGenerateContent()
      })
    }
  }))
}));

describe('VertexAIService', () => {
  let vertexService: VertexAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    vertexService = new VertexAIService();
  });

  describe('generateRecipe', () => {
    it('should generate a recipe with all prompt options', async () => {
      const mockRecipe = {
        title: "Gluten-Free Asian Chicken Rice Bowl",
        ingredients: ["chicken breast", "rice", "soy sauce"],
        instructions: ["Cook rice", "Grill chicken"],
        prepTime: "15 minutes",
        cookTime: "25 minutes",
        servings: 4,
        difficulty: "medium",
        tags: ["asian", "gluten-free", "dinner"]
      };

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [{
            content: {
              parts: [{ text: JSON.stringify(mockRecipe) }]
            }
          }]
        }
      });

      const prompt: RecipePrompt = {
        ingredients: ['chicken', 'rice'],
        dietary: ['gluten-free'],
        cuisine: 'Asian',
        mealType: 'dinner',
        difficulty: 'medium'
      };

      const result = await vertexService.generateRecipe(prompt);
      expect(result).toEqual(mockRecipe);
    });

    it('should generate a recipe with minimal prompt options', async () => {
      const mockRecipe = {
        title: "Simple Chicken Dish",
        ingredients: ["chicken"],
        instructions: ["Cook chicken"],
        prepTime: "10 minutes",
        cookTime: "20 minutes",
        servings: 2,
        difficulty: "easy",
        tags: ["quick", "simple"]
      };

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [{
            content: {
              parts: [{ text: JSON.stringify(mockRecipe) }]
            }
          }]
        }
      });

      const result = await vertexService.generateRecipe({ ingredients: ['chicken'] });
      expect(result).toEqual(mockRecipe);
    });

    it('should handle AI service errors', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('AI Service Error'));
      
      await expect(vertexService.generateRecipe({ ingredients: ['chicken'] }))
        .rejects
        .toThrow('Failed to generate recipe');
    });

    it('should handle invalid AI response format', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [{
            content: {
              parts: [{ text: 'invalid json' }]
            }
          }]
        }
      });

      await expect(vertexService.generateRecipe({ ingredients: ['chicken'] }))
        .rejects
        .toThrow('Failed to generate recipe');
    });

    it('should handle empty AI response', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: []
        }
      });

      await expect(vertexService.generateRecipe({ ingredients: ['chicken'] }))
        .rejects
        .toThrow('Failed to generate recipe');
    });
  });
});