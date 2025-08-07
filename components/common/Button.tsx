// =============================================================================
// BUTTON COMPONENT - Reusable button with variants
// =============================================================================

import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = '',
  type = 'button',
  asChild = false
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium text-sm transition-colors duration-200 flex items-center gap-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  // Enhanced click handler to prevent any unintended navigation
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any default form submission behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Call the provided onClick handler
    if (onClick && !disabled) {
      onClick();
    }
  };

  if (asChild && React.isValidElement(children)) {
    // For asChild pattern, apply classes to the child element
    return React.cloneElement(children, {
      className: classes
    } as any);
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
