import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppLayout } from '@/components/layout/AppLayout';

// Mock the Header component
jest.mock('@/components/layout/Header', () => ({
  Header: ({ onGeneratePlantings, onExportCSV }: any) => (
    <div data-testid="header">
      <button onClick={onGeneratePlantings}>Generate Plantings</button>
      <button onClick={onExportCSV}>Export CSV</button>
    </div>
  ),
}));

// Mock the Navigation component
jest.mock('@/components/layout/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation Component</div>,
}));

// Mock the AppContext
jest.mock('@/components/layout/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-provider">{children}</div>
  ),
  useAppContext: () => ({
    generatePlantings: jest.fn(),
    handleExportCSV: jest.fn(),
    orders: [],
    commodities: [],
    landStructure: [],
    plantings: [],
  }),
}));

describe('AppLayout Component', () => {
  const testContent = <div data-testid="test-content">Test Content</div>;

  it('should render with AppProvider wrapper', () => {
    render(<AppLayout>{testContent}</AppLayout>);
    
    expect(screen.getByTestId('app-provider')).toBeInTheDocument();
  });

  it('should render Header component', () => {
    render(<AppLayout>{testContent}</AppLayout>);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render Navigation component', () => {
    render(<AppLayout>{testContent}</AppLayout>);
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(<AppLayout>{testContent}</AppLayout>);
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should pass context functions to Header', () => {
    render(<AppLayout>{testContent}</AppLayout>);
    
    // The mocked Header should have the buttons that use context functions
    expect(screen.getByText('Generate Plantings')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('should have proper main layout structure', () => {
    const { container } = render(<AppLayout>{testContent}</AppLayout>);
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass(
      'max-w-7xl',
      'mx-auto',
      'px-4',
      'sm:px-6',
      'lg:px-8',
      'py-8'
    );
  });

  it('should have proper root div styling', () => {
    const { container } = render(<AppLayout>{testContent}</AppLayout>);
    
    const rootDiv = container.querySelector('.min-h-screen');
    expect(rootDiv).toBeInTheDocument();
    expect(rootDiv).toHaveClass('min-h-screen', 'bg-gray-50');
  });

  it('should render multiple children correctly', () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </>
    );
    
    render(<AppLayout>{multipleChildren}</AppLayout>);
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<AppLayout>{null}</AppLayout>);
    
    // Should still render layout components
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    
    // Main content area should still exist
    const { container } = render(<AppLayout>{null}</AppLayout>);
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('should maintain component hierarchy', () => {
    const { container } = render(<AppLayout>{testContent}</AppLayout>);
    
    // Check that components are in correct order
    const appProvider = screen.getByTestId('app-provider');
    const header = screen.getByTestId('header');
    const navigation = screen.getByTestId('navigation');
    const testContentElement = screen.getByTestId('test-content');
    
    expect(appProvider).toBeInTheDocument();
    expect(appProvider).toContainElement(header);
    expect(appProvider).toContainElement(navigation);
    expect(appProvider).toContainElement(testContentElement);
  });

  it('should render as client component', () => {
    // This test ensures the component renders without server-side issues
    expect(() => render(<AppLayout>{testContent}</AppLayout>)).not.toThrow();
  });

  it('should handle complex nested content', () => {
    const complexContent = (
      <div data-testid="complex-content">
        <header>Page Header</header>
        <section>
          <div>Nested Content</div>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </section>
        <footer>Page Footer</footer>
      </div>
    );
    
    render(<AppLayout>{complexContent}</AppLayout>);
    
    expect(screen.getByTestId('complex-content')).toBeInTheDocument();
    expect(screen.getByText('Page Header')).toBeInTheDocument();
    expect(screen.getByText('Nested Content')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Page Footer')).toBeInTheDocument();
  });
});
