import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

// Mock console.error to test error handling
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Header Component', () => {
  const mockOnGeneratePlantings = jest.fn();
  const mockOnExportCSV = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('should render header with title and logo', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    expect(screen.getByText('🥬')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Crop Planning')).toBeInTheDocument();
  });

  it('should render both action buttons', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    expect(screen.getByText('Generate Plantings')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('should call onGeneratePlantings when Generate Plantings button is clicked', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    const generateButton = screen.getByText('Generate Plantings');
    fireEvent.click(generateButton);

    expect(mockOnGeneratePlantings).toHaveBeenCalledTimes(1);
  });

  it('should call onExportCSV when Export CSV button is clicked', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    expect(mockOnExportCSV).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined onGeneratePlantings function gracefully', () => {
    render(
      <Header 
        onGeneratePlantings={undefined as any}
        onExportCSV={mockOnExportCSV}
      />
    );

    const generateButton = screen.getByText('Generate Plantings');
    fireEvent.click(generateButton);

    expect(mockConsoleError).toHaveBeenCalledWith('❌ onGeneratePlantings function is undefined!');
  });

  it('should not crash when onExportCSV is undefined', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={undefined as any}
      />
    );

    const exportButton = screen.getByText('Export CSV');
    expect(() => fireEvent.click(exportButton)).not.toThrow();
  });

  it('should have proper CSS classes for styling', () => {
    const { container } = render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    const header = container.querySelector('header');
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');
  });

  it('should display icons in buttons', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    // Check for Lucide icons (they render as SVG elements)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(2); // Calendar and Download icons
  });

  it('should handle multiple rapid clicks on generate button', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    const generateButton = screen.getByText('Generate Plantings');
    
    fireEvent.click(generateButton);
    fireEvent.click(generateButton);
    fireEvent.click(generateButton);

    expect(mockOnGeneratePlantings).toHaveBeenCalledTimes(3);
  });

  it('should handle multiple rapid clicks on export button', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    const exportButton = screen.getByText('Export CSV');
    
    fireEvent.click(exportButton);
    fireEvent.click(exportButton);

    expect(mockOnExportCSV).toHaveBeenCalledTimes(2);
  });

  it('should have accessible button elements', () => {
    render(
      <Header 
        onGeneratePlantings={mockOnGeneratePlantings}
        onExportCSV={mockOnExportCSV}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });
});
