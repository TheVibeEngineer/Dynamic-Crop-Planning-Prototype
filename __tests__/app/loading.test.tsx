import { render, screen } from '@testing-library/react';
import Loading from '@/app/loading';

describe('Loading Page', () => {
  it('should render loading component with crop planning message', () => {
    render(<Loading />);
    
    expect(screen.getByText('Loading Crop Planning...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we prepare your data')).toBeInTheDocument();
  });

  it('should display crop emoji', () => {
    render(<Loading />);
    
    expect(screen.getByText('🥬')).toBeInTheDocument();
  });

  it('should have animated spinner', () => {
    render(<Loading />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'border-t-green-600');
  });

  it('should have animated dots', () => {
    render(<Loading />);
    
    const dots = document.querySelectorAll('.animate-bounce');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('should have proper page structure', () => {
    const { container } = render(<Loading />);
    
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
