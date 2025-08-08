// =============================================================================
// BUTTON COMPONENT - Reusable button with variants
// =============================================================================

'use client';

import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md', 
  disabled = false,
  className = '',
  type = 'button',
  title,
  asChild = false
}) => {
  const baseClasses = 'rounded font-medium transition-colors duration-200 flex items-center gap-2';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400'
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

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
      title={title}
    >
      {children}
    </button>
  );
};
