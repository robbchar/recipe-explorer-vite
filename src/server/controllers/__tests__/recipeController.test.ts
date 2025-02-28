import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RecipeController } from '../recipeController.js';
import { AuthRequest } from '../../middleware/auth.js';
import { VertexAIService } from '../../services/ai/vertex.js';
import { PREDEFINED_CATEGORIES } from '../../constants/categories.js';

// First, create the mock function for VertexAI
const mockGenerateRecipe = jest.fn();

jest.mock('../../services/ai/vertex.js', () => ({
  VertexAIService: jest.fn().mockImplementation(() => ({
    generateRecipe: mockGenerateRecipe
  }))
}));

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaRecipe = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrisma = {
    recipe: mockPrismaRecipe,
    $disconnect: jest.fn(),
  };

  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Type for our mock
type MockPrismaClient = {
  recipe: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

const prisma = new PrismaClient() as unknown as MockPrismaClient;

describe('RecipeController', () => {
  let recipeController: RecipeController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let responseObject = {};

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
      send: jest.fn()
    };

    mockRequest = {
      body: {},
      user: { id: '1', email: 'test@example.com' },
      params: {}
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

  describe('createRecipe', () => {
    const validRecipe = {
      title: 'Test Recipe',
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: ['step 1', 'step 2'],
      prepTime: '30 minutes',
      cookTime: '45 minutes',
      servings: 4,
      difficulty: 'medium',
      tags: ['test', 'mock']
    };

    it('should create a recipe successfully', async () => {
      mockRequest.body = validRecipe;
      prisma.recipe.create.mockResolvedValueOnce({
        ...validRecipe,
        id: '1',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await recipeController.createRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(prisma.recipe.create).toHaveBeenCalled();
    });

    it('should return 400 for invalid recipe data', async () => {
      mockRequest.body = { title: '' };

      await recipeController.createRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty('error');
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = validRecipe;

      await recipeController.createRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        error: 'Unauthorized'
      });
    });
  });

  describe('getRecipes', () => {
    it('should return all recipes for the user', async () => {
      const mockRecipes = [
        {
          id: '1',
          title: 'Recipe 1',
          userId: '1',
          ingredients: [],
          tags: []
        }
      ];

      prisma.recipe.findMany.mockResolvedValueOnce(mockRecipes);

      await recipeController.getRecipes(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual(mockRecipes);
    });
  });

  describe('getRecipe', () => {
    it('should return a specific recipe', async () => {
      const mockRecipe = {
        id: '1',
        title: 'Recipe 1',
        userId: '1',
        ingredients: [],
        tags: []
      };

      mockRequest.params = { id: '1' };
      prisma.recipe.findUnique.mockResolvedValueOnce(mockRecipe);

      await recipeController.getRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual(mockRecipe);
    });

    it('should return 404 for non-existent recipe', async () => {
      mockRequest.params = { id: '999' };
      prisma.recipe.findUnique.mockResolvedValueOnce(null);

      await recipeController.getRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 for unauthorized access', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: '2', email: 'other@example.com' };
      prisma.recipe.findUnique.mockResolvedValueOnce({
        id: '1',
        userId: '1'
      });

      await recipeController.getRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('updateRecipe', () => {
    const updateData = {
      title: 'Updated Recipe',
      ingredients: ['new ingredient'],
      instructions: ['new step'],
      prepTime: '20 minutes',
      cookTime: '35 minutes',
      servings: 2,
      difficulty: 'easy',
      tags: ['updated']
    };

    it('should update a recipe successfully', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      
      prisma.recipe.findUnique.mockResolvedValueOnce({
        id: '1',
        userId: '1'
      });
      
      prisma.recipe.update.mockResolvedValueOnce({
        ...updateData,
        id: '1',
        userId: '1'
      });

      await recipeController.updateRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteRecipe', () => {
    it('should delete a recipe successfully', async () => {
      mockRequest.params = { id: '1' };
      
      prisma.recipe.findUnique.mockResolvedValueOnce({
        id: '1',
        userId: '1'
      });

      await recipeController.deleteRecipe(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(prisma.recipe.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
  });

  describe('getCategories', () => {
    it('should return all predefined categories', async () => {
      await recipeController.getCategories(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual(PREDEFINED_CATEGORIES);
    });
  });

  describe('getRecipesByCategory', () => {
    it('should return recipes for a valid category', async () => {
      mockRequest.params = { category: 'Dinner' };
      const mockRecipes = [
        {
          id: '1',
          title: 'Recipe 1',
          userId: '1',
          categories: [{ name: 'Dinner' }]
        }
      ];

      prisma.recipe.findMany.mockResolvedValueOnce(mockRecipes);

      await recipeController.getRecipesByCategory(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual(mockRecipes);
    });

    it('should return 400 for invalid category', async () => {
      mockRequest.params = { category: 'InvalidCategory' };

      await recipeController.getRecipesByCategory(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateRecipeCategories', () => {
    it('should update recipe categories successfully', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { categories: ['Dinner', 'Italian'] };

      prisma.recipe.findUnique.mockResolvedValueOnce({
        id: '1',
        userId: '1'
      });

      prisma.recipe.update.mockResolvedValueOnce({
        id: '1',
        userId: '1',
        categories: [
          { name: 'Dinner' },
          { name: 'Italian' }
        ]
      });

      await recipeController.updateRecipeCategories(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 for invalid categories', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { categories: ['InvalidCategory'] };

      await recipeController.updateRecipeCategories(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
}); 