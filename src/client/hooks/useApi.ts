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

  async function api(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<Response> {
    const { method = 'GET', headers = {}, body } = options;
    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
      credentials: 'include',
    });

    console.log('API Response:', response.status);

    if (response.status === 401) {
      console.log('Unauthorized access');
      logout();
      navigate('/login');
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }

  return api;
}

export default useApi;
