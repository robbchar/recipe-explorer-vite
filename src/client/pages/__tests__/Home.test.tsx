import { render, screen } from '@testing-library/react';
import Home from '../Home';

describe('Home', () => {
  it('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText('Welcome to Recipe Explorer')).toBeInTheDocument();
  });
}); 