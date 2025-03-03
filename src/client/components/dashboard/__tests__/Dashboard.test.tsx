import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Dashboard', () => {
  const mockRecipes = [
    {
      id: '1',
      title: 'Test Recipe',
      description: 'A test recipe description',
      ingredients: [{ id: '1', name: 'Ingredient 1', amount: '1 cup' }],
      tags: [
        {
          id: '1',
          tag: {
            id: '1',
            name: 'Test Tag',
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );
  };

  it('redirects to login if no token is present', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays recipes when fetch is successful', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRecipes),
      }),
    );
    global.fetch = mockFetch as any;

    renderComponent();

    expect(await screen.findByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A test recipe description')).toBeInTheDocument();
    expect(screen.getByText('Test Tag')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch recipes' }),
      }),
    );
    global.fetch = mockFetch as any;

    renderComponent();

    expect(
      await screen.findByText(/failed to fetch recipes/i),
    ).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRecipes),
      }),
    );
    global.fetch = mockFetch as any;

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Logout'));

    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to new recipe page when Add New Recipe is clicked', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRecipes),
      }),
    );
    global.fetch = mockFetch as any;

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Add New Recipe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add New Recipe'));

    expect(mockNavigate).toHaveBeenCalledWith('/recipes/new');
  });
});
