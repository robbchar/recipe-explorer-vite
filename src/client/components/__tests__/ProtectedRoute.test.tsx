import { render, screen } from '@testing-library/react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

// Mock component for testing
const MockProtectedContent = () => <div>Protected Content</div>;

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const renderProtectedRoute = (initialPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MockProtectedContent />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('redirects to login when not authenticated', () => {
    renderProtectedRoute();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders protected content when authenticated', async () => {
    // Set authentication token
    window.localStorage.setItem('token', 'fake-token');
    renderProtectedRoute();
    
    // Use findByText instead of getByText to handle any potential async rendering
    const protectedContent = await screen.findByText('Protected Content');
    expect(protectedContent).toBeInTheDocument();
  });
}); 