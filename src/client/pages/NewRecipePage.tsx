import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipePromptForm, RecipePromptFormData } from '../components/recipe/RecipePromptForm';
import { RecipePreview } from '../components/recipe/RecipePreview';
import { useAuth } from '../context/AuthContext';

const NewRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [previewRecipe, setPreviewRecipe] = React.useState<any>(null);
  const [existingRecipe, setExistingRecipe] = React.useState<any>(null);

  const handleSubmit = async (data: RecipePromptFormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        logout();
        navigate('/login');
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(responseData.error || 'Failed to generate recipe');
      }

      if (response.status === 409) {
        setExistingRecipe(responseData.existingRecipe);
      }

      setPreviewRecipe(responseData.preview);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        logout();
        navigate('/login');
        throw new Error('Not authenticated');
      }

      const saveResponse = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recipe),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        if (saveResponse.status === 401) {
          logout();
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        if (saveResponse.status === 409) {
          setExistingRecipe(errorData.existingRecipe);
          throw new Error('Recipe with this title already exists');
        }
        throw new Error(errorData.error || 'Failed to save recipe');
      }

      const savedRecipe = await saveResponse.json();
      navigate(`/recipes/${savedRecipe.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = () => {
    setPreviewRecipe(null);
    setExistingRecipe(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Generate New Recipe</h1>
      {!previewRecipe ? (
        <RecipePromptForm onSubmit={handleSubmit} isLoading={isLoading} />
      ) : (
        <RecipePreview
          recipe={previewRecipe}
          existingRecipe={existingRecipe}
          onSave={handleSaveRecipe}
          onGenerateNew={handleGenerateNew}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default NewRecipePage; 