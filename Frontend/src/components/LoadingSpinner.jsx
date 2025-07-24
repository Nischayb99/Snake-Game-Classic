import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  fullScreen = false,
  className = '' 
}) => {
  // Size variants
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Color variants
  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500'
  };

  const spinnerClasses = `
    animate-spin 
    rounded-full 
    border-t-2 
    border-b-2 
    ${sizeClasses[size]} 
    ${colorClasses[color]}
    ${className}
  `;

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 z-50'
    : 'flex flex-col justify-center items-center';

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}></div>
      {text && (
        <p className={`mt-3 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Preset spinner variants for common use cases
export const PageSpinner = ({ text = "Loading..." }) => (
  <LoadingSpinner 
    size="lg" 
    color="primary" 
    text={text} 
    className="mx-auto my-8"
  />
);

export const ButtonSpinner = ({ color = "white" }) => (
  <LoadingSpinner 
    size="sm" 
    color={color} 
    className="mr-2"
  />
);

export const FullScreenSpinner = ({ text = "Loading application..." }) => (
  <LoadingSpinner 
    size="xl" 
    color="primary" 
    text={text} 
    fullScreen={true}
  />
);

export const InlineSpinner = ({ size = "sm", color = "primary" }) => (
  <LoadingSpinner 
    size={size} 
    color={color} 
    className="inline-block"
  />
);

export default LoadingSpinner;