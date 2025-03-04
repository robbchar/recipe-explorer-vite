import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RecipeDetail } from '../components/recipe/RecipeDetail';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [recipe, setRecipe] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const api = useApi();

  React.useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.log('No token found');
          logout();
          navigate('/login');
          throw new Error('Not authenticated');
        }

        console.log('Fetching recipe with ID:', id);

        console.log('Making API request...');
        const data = await api(`/recipes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRecipe(data);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recipe');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      console.log('Starting recipe fetch for ID:', id);
      fetchRecipe();
    } else {
      console.log('No recipe ID provided');
      setError('No recipe ID provided');
      setIsLoading(false);
    }
  }, [id, navigate, logout]);

  console.log('Current state:', { isLoading, error, recipe });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-600">Loading recipe...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-800">{error}</div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  if (!recipe) {
    console.log('No recipe data available');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-800">Recipe not found</div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center"
      >
        ← Back to Dashboard
      </button>
      <RecipeDetail recipe={recipe} />
    </div>
  );
};

export default RecipeDetailPage;
