import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Home from '@/app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Home Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the home page with branding', () => {
    render(<Home />);
    
    expect(screen.getByText('Dynamic Crop Planning')).toBeInTheDocument();
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
    expect(screen.getByText('🥬')).toBeInTheDocument();
  });

  it('should redirect to orders page on mount', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/orders');
    });
  });

  it('should have proper CSS classes for styling', () => {
    const { container } = render(<Home />);
    
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-green-50', 'to-blue-50');
  });

  it('should display loading spinner', () => {
    render(<Home />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should have animated elements', () => {
    render(<Home />);
    
    const icon = screen.getByText('🥬');
    expect(icon).toHaveClass('animate-bounce');
  });
});
