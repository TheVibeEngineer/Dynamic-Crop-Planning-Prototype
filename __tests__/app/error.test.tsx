import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Error from '@/app/error';

// Mock React.useEffect
jest.spyOn(React, 'useEffect').mockImplementation((effect, deps) => {
  effect();
});

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock console.error
console.error = jest.fn();

describe('Error Page', () => {
  const mockError = new Error('Test error message');
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  it('should render error page with error message', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
  });

  it('should display try again and return home buttons', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByText('Return to home')).toBeInTheDocument();
  });

  it('should call reset function when try again is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    const tryAgainButton = screen.getByText('Try again');
    fireEvent.click(tryAgainButton);
    
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should navigate to home when return home is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    const returnHomeButton = screen.getByText('Return to home');
    fireEvent.click(returnHomeButton);
    
    expect(mockLocation.href).toBe('/');
  });

  it('should log error to console', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(console.error).toHaveBeenCalledWith('Application error:', mockError);
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(screen.getByText('Error details (development only)')).toBeInTheDocument();
    // The error message should be in the pre element
    expect(screen.getByRole('group')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(screen.queryByText('Error details (development only)')).not.toBeInTheDocument();
    expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle error with digest property', () => {
    const errorWithDigest = {
      message: 'Test error message',
      name: 'Error',
      digest: 'abc123'
    } as Error & { digest?: string };
    
    render(<Error error={errorWithDigest} reset={mockReset} />);
    
    expect(console.error).toHaveBeenCalledWith('Application error:', errorWithDigest);
  });

  it('should have proper accessibility attributes', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    // Check that buttons have proper text
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
  });
});
