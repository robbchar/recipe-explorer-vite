import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: { id: string; name: string; amount: string }[];
  tags: {
    id: string;
    tag: {
      id: string;
      name: string;
    };
  }[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/recipes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDelete = async (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation(); // Prevent navigation to recipe detail

    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    setIsDeleting(recipeId);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      // Refresh the recipes list
      await fetchRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Recipes</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/recipes/new')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add New Recipe
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      {recipes.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No recipes yet. Click "Add New Recipe" to create your first recipe!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            >
              <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {recipe.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {recipe.tags
                  .filter((tagRelation) => tagRelation && tagRelation.tag)
                  .map((tagRelation) => (
                    <span
                      key={`${recipe.id}-${tagRelation.tag.id}`}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tagRelation.tag.name}
                    </span>
                  ))}
              </div>
              <button
                onClick={(e) => handleDelete(e, recipe.id)}
                className="top-2 right-2 p-2 text-gray-500 hover:text-red-600 transition-colors self-end"
                disabled={isDeleting === recipe.id}
              >
                {isDeleting === recipe.id ? (
                  <span className="text-sm">Deleting...</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
