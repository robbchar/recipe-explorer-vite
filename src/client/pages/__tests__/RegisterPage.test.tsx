import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';

describe('RegisterPage', () => {
  const renderRegisterPage = () => {
    return render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );
  };

  it('renders register page with title', () => {
    renderRegisterPage();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('renders registration form with all fields', () => {
    renderRegisterPage();
    // Test for email field
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    
    // Test for password fields using more specific queries
    const passwordField = screen.getByLabelText(/^password$/i);
    const confirmPasswordField = screen.getByLabelText(/^confirm password$/i);
    
    expect(passwordField).toBeInTheDocument();
    expect(confirmPasswordField).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });
}); 