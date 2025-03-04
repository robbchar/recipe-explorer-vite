import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type RequestOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: any;
};

function useApi() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function api<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = 'GET', headers = {}, body } = options;

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    console.log('API Response:', response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    if (response.status === 401) {
      console.log('Unauthorized access');
      logout();
      navigate('/login');
      throw new Error('Session expired. Please login again.');
    }

    return response.json();
  }

  return api;
}

export default useApi;
