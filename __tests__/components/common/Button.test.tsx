// =============================================================================
// BUTTON COMPONENT TEST SUITE
// =============================================================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, ButtonProps } from '../../../components/common/Button';

describe('Button Component', () => {
  const defaultProps: ButtonProps = {
    children: 'Test Button'
  };

  describe('rendering', () => {
    it('should render button with children', () => {
      render(<Button {...defaultProps} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('should render with custom title attribute', () => {
      render(<Button {...defaultProps} title="Custom tooltip" />);
      
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Custom tooltip');
    });

    it('should render with custom className', () => {
      render(<Button {...defaultProps} className="custom-class" />);
      
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should render with React node children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should apply primary variant classes by default', () => {
      render(<Button {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });

    it('should apply secondary variant classes', () => {
      render(<Button {...defaultProps} variant="secondary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200', 'text-gray-800', 'hover:bg-gray-300');
    });

    it('should apply success variant classes', () => {
      render(<Button {...defaultProps} variant="success" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600', 'text-white', 'hover:bg-green-700');
    });

    it('should apply danger variant classes', () => {
      render(<Button {...defaultProps} variant="danger" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
    });

    it('should apply ghost variant classes', () => {
      render(<Button {...defaultProps} variant="ghost" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'text-gray-600', 'hover:bg-gray-100');
    });
  });

  describe('sizes', () => {
    it('should apply medium size classes by default', () => {
      render(<Button {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    it('should apply small size classes', () => {
      render(<Button {...defaultProps} size="sm" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('should apply large size classes', () => {
      render(<Button {...defaultProps} size="lg" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });
  });

  describe('button types', () => {
    it('should have button type by default', () => {
      render(<Button {...defaultProps} />);
      
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should apply submit type', () => {
      render(<Button {...defaultProps} type="submit" />);
      
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should apply reset type', () => {
      render(<Button {...defaultProps} type="reset" />);
      
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('disabled state', () => {
    it('should not be disabled by default', () => {
      render(<Button {...defaultProps} />);
      
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('should apply disabled attribute when disabled', () => {
      render(<Button {...defaultProps} disabled />);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should apply disabled variant classes', () => {
      render(<Button {...defaultProps} variant="primary" disabled />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:bg-blue-300');
    });

    it('should apply disabled classes for different variants', () => {
      const variants: Array<ButtonProps['variant']> = ['secondary', 'success', 'danger', 'ghost'];
      const expectedClasses = [
        'disabled:bg-gray-100',
        'disabled:bg-green-300', 
        'disabled:bg-red-300',
        'disabled:text-gray-400'
      ];

      variants.forEach((variant, index) => {
        const { unmount } = render(<Button {...defaultProps} variant={variant} disabled />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass(expectedClasses[index]);
        
        unmount();
      });
    });
  });

  describe('click handling', () => {
    it('should call onClick when clicked', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} disabled />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should prevent default event behavior', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      
      // Create a custom event that we can track
      const mockEvent = new Event('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(mockEvent, 'stopPropagation');
      
      fireEvent(button, mockEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should work without onClick handler', () => {
      render(<Button {...defaultProps} />);
      
      expect(() => {
        fireEvent.click(screen.getByRole('button'));
      }).not.toThrow();
    });
  });

  describe('asChild functionality', () => {
    it('should render as child element when asChild is true', () => {
      render(
        <Button asChild variant="primary">
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass('bg-blue-600', 'text-white');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should apply button classes to child element', () => {
      render(
        <Button asChild size="lg" variant="success" className="extra-class">
          <div>Custom Element</div>
        </Button>
      );
      
      const customElement = screen.getByText('Custom Element');
      expect(customElement).toHaveClass(
        'rounded',
        'font-medium', 
        'px-6',
        'py-3',
        'text-base',
        'bg-green-600',
        'extra-class'
      );
    });

    it('should render as regular button when asChild is true but children is not valid element', () => {
      render(
        <Button asChild variant="primary">
          Just text content
        </Button>
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Just text content')).toBeInTheDocument();
    });

    it('should handle complex child elements', () => {
      render(
        <Button asChild variant="danger">
          <button type="submit" data-testid="complex-child">
            <span>Complex</span>
            <span>Child</span>
          </button>
        </Button>
      );
      
      const childButton = screen.getByTestId('complex-child');
      expect(childButton).toHaveClass('bg-red-600', 'text-white');
      expect(childButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('base styling', () => {
    it('should always include base classes', () => {
      render(<Button {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'rounded',
        'font-medium',
        'transition-colors',
        'duration-200',
        'flex',
        'items-center',
        'gap-2'
      );
    });

    it('should combine all classes correctly', () => {
      render(
        <Button 
          variant="success" 
          size="lg" 
          className="custom-class" 
        >
          Test
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'rounded', // base
        'px-6', 'py-3', 'text-base', // size
        'bg-green-600', 'text-white', // variant
        'custom-class' // custom
      );
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });

    it('should have proper button role', () => {
      render(<Button {...defaultProps} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support title for screen readers', () => {
      render(<Button {...defaultProps} title="Screen reader description" />);
      
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Screen reader description');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined onClick gracefully', () => {
      render(<Button {...defaultProps} onClick={undefined} />);
      
      expect(() => {
        fireEvent.click(screen.getByRole('button'));
      }).not.toThrow();
    });

    it('should handle empty className', () => {
      render(<Button {...defaultProps} className="" />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle null children in asChild mode', () => {
      const { container } = render(
        <Button asChild>
          <div data-testid="empty-div">{null}</div>
        </Button>
      );
      
      // In asChild mode with a div, it should render the div with button classes
      const div = screen.getByTestId('empty-div');
      expect(div).toBeInTheDocument();
      expect(div).toHaveClass('rounded', 'font-medium'); // Should have button classes
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle multiple class combinations', () => {
      render(
        <Button 
          variant="ghost" 
          size="sm" 
          disabled
          className="extra-1 extra-2"
        >
          Multi-class test
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('extra-1', 'extra-2');
      expect(button).toBeDisabled();
    });
  });

  describe('performance', () => {
    it('should not re-render unnecessarily with same props', () => {
      const { rerender } = render(<Button {...defaultProps} />);
      const initialButton = screen.getByRole('button');
      
      rerender(<Button {...defaultProps} />);
      
      expect(screen.getByRole('button')).toBe(initialButton);
    });

    it('should handle rapid clicks gracefully', () => {
      const mockOnClick = jest.fn();
      render(<Button {...defaultProps} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      
      expect(mockOnClick).toHaveBeenCalledTimes(10);
    });
  });
});
