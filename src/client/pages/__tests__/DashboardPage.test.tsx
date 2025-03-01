import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';

describe('DashboardPage', () => {
  const renderDashboardPage = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  };

  it('renders dashboard page with title', () => {
    renderDashboardPage();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders dashboard content', () => {
    renderDashboardPage();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
}); 