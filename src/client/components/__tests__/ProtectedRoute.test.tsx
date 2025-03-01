import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

// Mock component for testing
const ProtectedComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset the location to / before each test
    window.history.pushState({}, '', '/');
  });

  it('redirects to login when not authenticated', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ProtectedComponent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('renders child route when authenticated', async () => {
    localStorage.setItem('token', 'fake-token');
    
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ProtectedComponent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
}); 