import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all navigation tabs', () => {
    mockUsePathname.mockReturnValue('/orders');
    
    render(<Navigation />);

    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Commodities & Varieties')).toBeInTheDocument();
    expect(screen.getByText('Land Management')).toBeInTheDocument();
    expect(screen.getByText('Timeline View')).toBeInTheDocument();
    expect(screen.getByText('Crop Planning')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  it('should render all tab icons', () => {
    mockUsePathname.mockReturnValue('/orders');
    
    render(<Navigation />);

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('🌱')).toBeInTheDocument();
    expect(screen.getByText('🗺️')).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('💾')).toBeInTheDocument();
  });

  it('should highlight the active tab based on current pathname', () => {
    mockUsePathname.mockReturnValue('/orders');
    
    render(<Navigation />);

    const ordersLink = screen.getByText('Orders').closest('a');
    const commoditiesLink = screen.getByText('Commodities & Varieties').closest('a');

    expect(ordersLink).toHaveClass('border-green-600', 'text-green-600', 'bg-green-50/50');
    expect(commoditiesLink).toHaveClass('border-transparent', 'text-gray-500');
  });

  it('should highlight orders tab when pathname is root', () => {
    mockUsePathname.mockReturnValue('/');
    
    render(<Navigation />);

    const ordersLink = screen.getByText('Orders').closest('a');
    expect(ordersLink).toHaveClass('border-green-600', 'text-green-600', 'bg-green-50/50');
  });

  it('should highlight commodities tab when pathname is /commodities', () => {
    mockUsePathname.mockReturnValue('/commodities');
    
    render(<Navigation />);

    const commoditiesLink = screen.getByText('Commodities & Varieties').closest('a');
    const ordersLink = screen.getByText('Orders').closest('a');

    expect(commoditiesLink).toHaveClass('border-green-600', 'text-green-600', 'bg-green-50/50');
    expect(ordersLink).toHaveClass('border-transparent', 'text-gray-500');
  });

  it('should highlight land tab when pathname is /land', () => {
    mockUsePathname.mockReturnValue('/land');
    
    render(<Navigation />);

    const landLink = screen.getByText('Land Management').closest('a');
    expect(landLink).toHaveClass('border-green-600', 'text-green-600', 'bg-green-50/50');
  });

  it('should highlight gantt tab when pathname is /gantt', () => {
    mockUsePathname.mockReturnValue('/gantt');
    
    render(<Navigation />);

    const ganttLink = screen.getByText('Timeline View').closest('a');
    expect(ganttLink).toHaveClass('border-green-600', 'text-green-600', 'bg-green-50/50');
  });

  it('should highlight planning tab when pathname is /planning', () => {
    mockUsePathname.mockReturnValue('/planning');
    
    render(<Navigation />);

    const planningLink = screen.getByText('Crop Planning').closest('a');
    expect(planningLink).toHaveClass('border-green-600', 'text-green-600', 'bg-green-50/50');
  });

  it('should highlight data tab when pathname is /data', () => {
    mockUsePathname.mockReturnValue('/data');
    
    render(<Navigation />);

    const dataLink = screen.getByText('Data Management').closest('a');
    expect(dataLink).toHaveClass('border-green-600', 'text-green-600', 'bg-green-50/50');
  });

  it('should have correct href attributes for all links', () => {
    mockUsePathname.mockReturnValue('/orders');
    
    render(<Navigation />);

    const expectedLinks = [
      { text: 'Orders', href: '/orders' },
      { text: 'Commodities & Varieties', href: '/commodities' },
      { text: 'Land Management', href: '/land' },
      { text: 'Timeline View', href: '/gantt' },
      { text: 'Crop Planning', href: '/planning' },
      { text: 'Data Management', href: '/data' }
    ];

    expectedLinks.forEach(({ text, href }) => {
      const link = screen.getByText(text).closest('a');
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should apply hover classes to inactive tabs', () => {
    mockUsePathname.mockReturnValue('/orders');
    
    render(<Navigation />);

    const inactiveLink = screen.getByText('Commodities & Varieties').closest('a');
    expect(inactiveLink).toHaveClass('hover:text-gray-700', 'hover:border-green-300', 'hover:bg-gray-50/50');
  });

  it('should handle unknown pathname gracefully', () => {
    mockUsePathname.mockReturnValue('/unknown-route');
    
    render(<Navigation />);

    // No tab should be active
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass('border-transparent', 'text-gray-500');
      expect(link).not.toHaveClass('border-green-600', 'text-green-600');
    });
  });

  it('should have proper navigation structure', () => {
    mockUsePathname.mockReturnValue('/orders');
    
    const { container } = render(<Navigation />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('bg-white', 'border-b', 'border-gray-200');
    
    const flexContainer = nav?.querySelector('.flex');
    expect(flexContainer).toHaveClass('space-x-8', 'overflow-x-auto');
  });

  it('should render exactly 6 navigation links', () => {
    mockUsePathname.mockReturnValue('/orders');
    
    render(<Navigation />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(6);
  });

  it('should have whitespace-nowrap class for responsive design', () => {
    mockUsePathname.mockReturnValue('/orders');
    
    render(<Navigation />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass('whitespace-nowrap');
    });
  });
});
