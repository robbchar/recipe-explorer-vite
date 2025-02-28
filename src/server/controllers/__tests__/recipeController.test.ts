import { Response } from 'express';
import { RecipeController } from '../recipeController.js';
import { AuthRequest } from '../../middleware/auth.js';
import { VertexAIService } from '../../services/ai/vertex.js';

// Mock the VertexAI client
const mockGenerateRecipe = jest.fn();
jest.mock('../../services/ai/vertex.js', () => ({
  VertexAIService: jest.fn().mockImplementation(() => ({
    generateRecipe: mockGenerateRecipe
  }))
}));

describe('RecipeController', () => {
  let recipeController: RecipeController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let responseObject = {};

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      })
    };

    mockRequest = {
      body: {},
      user: { id: '1', email: 'test@example.com' }
    };

    // Setup default successful response
    mockGenerateRecipe.mockResolvedValue({
      title: "Test Recipe",
      ingredients: ["ingredient 1", "ingredient 2"],
      instructions: ["step 1", "step 2"],
      prepTime: "30 minutes",
      cookTime: "45 minutes",
      servings: 4,
      difficulty: "medium",
      tags: ["test", "mock"]
    });

    recipeController = new RecipeController();
  });

  describe('generateRecipe', () => {
    it('should generate a recipe successfully', async () => {
      mockRequest.body = {
        ingredients: ['chicken', 'rice'],
        dietary: ['gluten-free'],
        cuisine: 'Asian',
        mealType: 'dinner',
        difficulty: 'medium'
      };

      await recipeController.generateRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual(expect.objectContaining({
        title: expect.any(String),
        ingredients: expect.any(Array),
        instructions: expect.any(Array),
        prepTime: expect.any(String),
        cookTime: expect.any(String),
        servings: expect.any(Number),
        difficulty: expect.any(String),
        tags: expect.any(Array)
      }));
    });

    it('should return 400 if prompt is empty', async () => {
      mockRequest.body = {};

      await recipeController.generateRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        error: 'Recipe prompt is required'
      });
    });

    it('should handle AI service errors', async () => {
      mockRequest.body = {
        ingredients: ['chicken']
      };

      // Override the default mock for this test only
      mockGenerateRecipe.mockRejectedValueOnce(new Error('AI Service Error'));

      await recipeController.generateRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        error: 'Failed to generate recipe'
      });
    });

    it('should accept minimal recipe prompt', async () => {
      mockRequest.body = {
        ingredients: ['chicken']
      };

      await recipeController.generateRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toHaveProperty('title');
      expect(responseObject).toHaveProperty('ingredients');
    });

    it('should handle complete recipe prompt', async () => {
      mockRequest.body = {
        ingredients: ['chicken', 'rice'],
        dietary: ['gluten-free'],
        cuisine: 'Asian',
        mealType: 'dinner',
        difficulty: 'medium'
      };

      await recipeController.generateRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toHaveProperty('title');
      expect(responseObject).toHaveProperty('ingredients');
      expect(responseObject).toHaveProperty('instructions');
      expect(responseObject).toHaveProperty('difficulty', 'medium');
    });
  });
}); 