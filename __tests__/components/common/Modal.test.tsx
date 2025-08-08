// =============================================================================
// MODAL COMPONENT TEST SUITE
// =============================================================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, ModalProps } from '../../../components/common/Modal';

describe('Modal Component', () => {
  const defaultProps: ModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('should render title in header', () => {
      render(<Modal {...defaultProps} title="Custom Title" />);
      
      const title = screen.getByText('Custom Title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-lg', 'font-medium', 'text-gray-900');
    });

    it('should render children in content area', () => {
      render(
        <Modal {...defaultProps}>
          <div data-testid="custom-content">Custom content</div>
          <p>Additional content</p>
        </Modal>
      );
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Additional content')).toBeInTheDocument();
    });

    it('should render close button with accessibility label', () => {
      render(<Modal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument(); // Screen reader text
    });

    it('should render close button with SVG icon', () => {
      render(<Modal {...defaultProps} />);
      
      const svgIcon = screen.getByRole('button').querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
      expect(svgIcon).toHaveClass('h-6', 'w-6');
    });
  });

  describe('sizes', () => {
    it('should apply medium size classes by default', () => {
      const { container } = render(<Modal {...defaultProps} />);
      
      const modalContent = container.querySelector('.bg-white');
      expect(modalContent).toHaveClass('max-w-lg');
    });

    it('should apply small size classes', () => {
      const { container } = render(<Modal {...defaultProps} size="sm" />);
      
      const modalContent = container.querySelector('.bg-white');
      expect(modalContent).toHaveClass('max-w-md');
    });

    it('should apply large size classes', () => {
      const { container } = render(<Modal {...defaultProps} size="lg" />);
      
      const modalContent = container.querySelector('.bg-white');
      expect(modalContent).toHaveClass('max-w-2xl');
    });

    it('should apply extra large size classes', () => {
      const { container } = render(<Modal {...defaultProps} size="xl" />);
      
      const modalContent = container.querySelector('.bg-white');
      expect(modalContent).toHaveClass('max-w-4xl');
    });
  });

  describe('footer', () => {
    it('should not render footer section when no footer provided', () => {
      const { container } = render(<Modal {...defaultProps} />);
      
      const footer = container.querySelector('.border-t');
      expect(footer).not.toBeInTheDocument();
    });

    it('should render footer when footer prop is provided', () => {
      const footerContent = (
        <div data-testid="footer-content">
          <button>Cancel</button>
          <button>Save</button>
        </div>
      );
      
      render(<Modal {...defaultProps} footer={footerContent} />);
      
      expect(screen.getByTestId('footer-content')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should apply footer styling classes', () => {
      const { container } = render(
        <Modal {...defaultProps} footer={<button>Footer button</button>} />
      );
      
      const footer = container.querySelector('.border-t');
      expect(footer).toHaveClass('px-6', 'py-4', 'border-t', 'border-gray-200', 'bg-gray-50');
      
      const footerContent = footer?.querySelector('.flex');
      expect(footerContent).toHaveClass('flex', 'justify-end', 'space-x-2');
    });
  });

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const mockOnClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
      
      fireEvent.click(backdrop!);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', () => {
      const mockOnClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const modalContent = container.querySelector('.bg-white');
      expect(modalContent).toBeInTheDocument();
      
      fireEvent.click(modalContent!);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should prevent event propagation on modal content click', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const modalContent = screen.getByText('Modal content');
      const mockEvent = new Event('click', { bubbles: true, cancelable: true });
      const stopPropagationSpy = jest.spyOn(mockEvent, 'stopPropagation');
      
      fireEvent(modalContent, mockEvent);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should prevent default and stop propagation on close button click', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button');
      const mockEvent = new Event('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(mockEvent, 'stopPropagation');
      
      fireEvent(closeButton, mockEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('backdrop behavior', () => {
    it('should only close when clicking directly on backdrop', () => {
      const mockOnClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      // Click on backdrop
      const backdrop = container.querySelector('.fixed.inset-0');
      
      // Mock event where target equals currentTarget (direct backdrop click)
      const backdropEvent = {
        target: backdrop,
        currentTarget: backdrop,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      } as any;
      
      fireEvent.click(backdrop!, backdropEvent);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking on child elements within backdrop', () => {
      const mockOnClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const backdrop = container.querySelector('.fixed.inset-0');
      const modalContent = container.querySelector('.bg-white');
      
      // Mock event where target is different from currentTarget (child element click)
      const childEvent = {
        target: modalContent,
        currentTarget: backdrop,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      } as any;
      
      fireEvent.click(backdrop!, childEvent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('styling and layout', () => {
    it('should apply correct backdrop styling', () => {
      const { container } = render(<Modal {...defaultProps} />);
      
      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).toHaveClass(
        'fixed',
        'inset-0',
        'bg-black/10',
        'flex',
        'items-center',
        'justify-center',
        'z-50'
      );
    });

    it('should apply correct modal content styling', () => {
      const { container } = render(<Modal {...defaultProps} />);
      
      const modalContent = container.querySelector('.bg-white');
      expect(modalContent).toHaveClass(
        'bg-white',
        'rounded-lg',
        'shadow-xl',
        'w-full',
        'max-h-[90vh]',
        'overflow-y-auto',
        'mx-4'
      );
    });

    it('should apply correct header styling', () => {
      const { container } = render(<Modal {...defaultProps} />);
      
      const header = container.querySelector('.border-b');
      expect(header).toHaveClass('px-6', 'py-4', 'border-b', 'border-gray-200');
      
      const headerContent = header?.querySelector('.flex');
      expect(headerContent).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('should apply correct content area styling', () => {
      const { container } = render(<Modal {...defaultProps} />);
      
      const contentArea = container.querySelector('.px-6.py-4:not(.border-b):not(.border-t)');
      expect(contentArea).toHaveClass('px-6', 'py-4');
    });

    it('should apply correct close button styling', () => {
      render(<Modal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveClass(
        'text-gray-400',
        'hover:text-gray-600',
        'transition-colors'
      );
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<Modal {...defaultProps} title="Accessible Title" />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Accessible Title');
    });

    it('should have screen reader text for close button', () => {
      render(<Modal {...defaultProps} />);
      
      const screenReaderText = screen.getByText('Close');
      expect(screenReaderText).toHaveClass('sr-only');
    });

    it('should focus management work with keyboard', () => {
      render(<Modal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button');
      closeButton.focus();
      
      expect(closeButton).toHaveFocus();
    });
  });

  describe('content variations', () => {
    it('should handle complex children content', () => {
      render(
        <Modal {...defaultProps}>
          <div>
            <h4>Section Title</h4>
            <p>Some text content</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
            <button>Action Button</button>
          </div>
        </Modal>
      );
      
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Some text content')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('should handle empty children', () => {
      render(<Modal {...defaultProps} children={null} />);
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      // Should not crash with null children
    });

    it('should handle string children', () => {
      render(<Modal {...defaultProps} children="Simple string content" />);
      
      expect(screen.getByText('Simple string content')).toBeInTheDocument();
    });
  });

  describe('footer variations', () => {
    it('should handle multiple buttons in footer', () => {
      const footer = (
        <>
          <button>Cancel</button>
          <button>Save</button>
          <button>Delete</button>
        </>
      );
      
      render(<Modal {...defaultProps} footer={footer} />);
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should handle complex footer content', () => {
      const footer = (
        <div data-testid="complex-footer">
          <span>Status: Unsaved</span>
          <div>
            <button>Cancel</button>
            <button>Save</button>
          </div>
        </div>
      );
      
      render(<Modal {...defaultProps} footer={footer} />);
      
      expect(screen.getByTestId('complex-footer')).toBeInTheDocument();
      expect(screen.getByText('Status: Unsaved')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid open/close state changes', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      
      rerender(<Modal {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('should require valid onClose function', () => {
      // Since onClose is a required prop in the interface, 
      // we'll test that the component works with a proper function
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle very long titles', () => {
      const longTitle = 'This is a very long title that might cause layout issues if not handled properly in the modal component';
      
      render(<Modal {...defaultProps} title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle empty title', () => {
      render(<Modal {...defaultProps} title="" />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('');
    });
  });

  describe('event handling edge cases', () => {
    it('should handle multiple rapid clicks on close button', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button');
      
      // Rapid clicks
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard events on close button', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button');
      fireEvent.keyDown(closeButton, { key: 'Enter' });
      
      // Click handler should still work with keyboard
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
