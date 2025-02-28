import { Response } from 'express';
import { VertexAIService } from '../services/ai/vertex.js';
import { AuthRequest } from '../middleware/auth.js';

export class RecipeController {
  private aiService: VertexAIService;

  constructor() {
    this.aiService = new VertexAIService();
  }

  async generateRecipe(req: AuthRequest, res: Response) {
    try {
      const prompt = req.body;
      // Fix: Add proper validation check
      if (!prompt || Object.keys(prompt).length === 0) {
        return res.status(400).json({ error: 'Recipe prompt is required' });
      }

      const recipe = await this.aiService.generateRecipe(prompt);
      return res.status(200).json(recipe);
    } catch (error) {
      console.error('Recipe Generation Error:', error);
      // Fix: Ensure error returns 500 status
      return res.status(500).json({ error: 'Failed to generate recipe' });
    }
  }
} 