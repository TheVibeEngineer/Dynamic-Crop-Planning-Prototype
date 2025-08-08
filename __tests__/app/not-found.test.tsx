import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from '@/app/not-found';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock window.history.back
const mockBack = jest.fn();
Object.defineProperty(window, 'history', {
  value: { back: mockBack },
  writable: true,
});

describe('NotFound Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render not found message', () => {
    render(<NotFound />);
    
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText(/Sorry, we couldn't find the page/)).toBeInTheDocument();
  });

  it('should display crop emoji', () => {
    render(<NotFound />);
    
    expect(screen.getByText('🥬')).toBeInTheDocument();
  });

  it('should provide navigation to orders page', () => {
    render(<NotFound />);
    
    const ordersLink = screen.getByText('Go to Orders');
    expect(ordersLink.closest('a')).toHaveAttribute('href', '/orders');
  });

  it('should provide go back functionality', () => {
    render(<NotFound />);
    
    const goBackButton = screen.getByText('Go back');
    fireEvent.click(goBackButton);
    
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('should display navigation links to all sections', () => {
    render(<NotFound />);
    
    expect(screen.getByText('Available sections:')).toBeInTheDocument();
    
    const links = ['Orders', 'Commodities', 'Land', 'Planning', 'Data'];
    links.forEach(linkText => {
      expect(screen.getByRole('link', { name: linkText })).toBeInTheDocument();
    });
  });

  it('should have proper page structure', () => {
    const { container } = render(<NotFound />);
    
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should have correct href attributes for navigation links', () => {
    render(<NotFound />);
    
    const expectedLinks = [
      { text: 'Orders', href: '/orders' },
      { text: 'Commodities', href: '/commodities' },
      { text: 'Land', href: '/land' },
      { text: 'Planning', href: '/planning' },
      { text: 'Data', href: '/data' }
    ];

    expectedLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toHaveAttribute('href', href);
    });
  });
});
