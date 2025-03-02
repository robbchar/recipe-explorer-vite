import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import * as authContext from '../../../context/AuthContext';
import { RegisterForm } from '../RegisterForm';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </AuthProvider>
    );
  };

  it('renders registration form with all fields', () => {
    renderComponent();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderComponent();
    
    await fillForm('doesNotMatch');
    
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('Passwords do not match');
  });

  it('submits form with valid data', async () => {
    const mockRegister = jest.fn().mockResolvedValue({});
    jest.spyOn(authContext, 'useAuth').mockReturnValue({
      register: mockRegister,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false
    });
    
    renderComponent();
    
    await fillForm();
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message on registration failure', async () => {
    // Set up mock before rendering
    const mockRegister = jest.fn().mockRejectedValue(new Error('Registration failed'));
    const mockUseAuth = jest.spyOn(authContext, 'useAuth').mockReturnValue({
      register: mockRegister,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false
    });

    renderComponent();
    
    // Fill in form fields
    await fillForm();
    
    // Wait for error message
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('Registration failed');

    // Clean up mock
    mockUseAuth.mockRestore();
  });

  it('renders registration form fields', () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('allows entering registration details', () => {
    renderComponent();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('renders register button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });
}); 

async function fillForm(confirmPassword = 'password123') {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: confirmPassword },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
  });
}
