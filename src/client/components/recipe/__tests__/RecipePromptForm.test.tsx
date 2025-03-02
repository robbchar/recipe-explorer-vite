import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipePromptForm } from '../RecipePromptForm';

describe('RecipePromptForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form elements', () => {
    render(<RecipePromptForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/ingredients/i)).toBeInTheDocument();
    expect(screen.getByText(/dietary preferences/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cuisine type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meal type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty level/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate recipe/i })).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    render(<RecipePromptForm onSubmit={mockOnSubmit} />);

    // Fill in ingredients
    await userEvent.type(screen.getByLabelText(/ingredients/i), 'chicken, rice');

    // Select dietary preferences
    await userEvent.click(screen.getByLabelText(/gluten-free/i));
    await userEvent.click(screen.getByLabelText(/dairy-free/i));

    // Select cuisine
    await userEvent.selectOptions(screen.getByLabelText(/cuisine type/i), 'Italian');

    // Select meal type
    await userEvent.selectOptions(screen.getByLabelText(/meal type/i), 'Dinner');

    // Select difficulty
    await userEvent.selectOptions(screen.getByLabelText(/difficulty level/i), 'Medium');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /generate recipe/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      ingredients: ['chicken', 'rice'],
      dietary: ['Gluten-Free', 'Dairy-Free'],
      cuisine: 'Italian',
      mealType: 'Dinner',
      difficulty: 'Medium'
    });
  });

  it('disables submit button when ingredients are empty', () => {
    render(<RecipePromptForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /generate recipe/i });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/ingredients/i), {
      target: { value: 'chicken' }
    });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<RecipePromptForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByRole('button')).toHaveTextContent(/generating recipe/i);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles dietary preferences correctly', async () => {
    render(<RecipePromptForm onSubmit={mockOnSubmit} />);

    const veganCheckbox = screen.getByLabelText(/vegan/i);
    
    // Select vegan
    await userEvent.click(veganCheckbox);
    expect(veganCheckbox).toBeChecked();

    // Deselect vegan
    await userEvent.click(veganCheckbox);
    expect(veganCheckbox).not.toBeChecked();
  });
}); 