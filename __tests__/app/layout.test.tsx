import { render } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';

// Mock the AppLayout component
jest.mock('@/components/layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'font-inter',
  }),
}));

describe('RootLayout', () => {
  it('should render children within AppLayout', () => {
    const testContent = <div data-testid="test-content">Test Content</div>;
    
    const { getByTestId } = render(
      <RootLayout>{testContent}</RootLayout>
    );
    
    expect(getByTestId('app-layout')).toBeInTheDocument();
    expect(getByTestId('test-content')).toBeInTheDocument();
  });

  it('should have proper HTML structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    
    // Check that body has the font class
    const body = document.body;
    expect(body).toHaveClass('font-inter');
    
    // Check that the content is wrapped in AppLayout
    expect(container.querySelector('[data-testid="app-layout"]')).toBeInTheDocument();
  });

  it('should render multiple children correctly', () => {
    const { getByText } = render(
      <RootLayout>
        <div>First Child</div>
        <div>Second Child</div>
      </RootLayout>
    );
    
    expect(getByText('First Child')).toBeInTheDocument();
    expect(getByText('Second Child')).toBeInTheDocument();
  });
});

describe('Metadata', () => {
  it('should have correct metadata configuration', () => {
    expect(metadata.title).toBe('Dynamic Crop Planning System');
    expect(metadata.description).toBe('Smart crop planning and land management system');
    expect(metadata.keywords).toEqual(['agriculture', 'crop planning', 'land management', 'farming']);
  });

  it('should have proper author information', () => {
    expect(metadata.authors).toEqual([{ name: 'Crop Planning Team' }]);
  });

  it('should have OpenGraph configuration', () => {
    expect(metadata.openGraph).toEqual({
      title: 'Dynamic Crop Planning System',
      description: 'Smart crop planning and land management system',
      type: 'website',
    });
  });
});
