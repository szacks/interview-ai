import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  label?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'blue', label }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorStyles = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeStyles[size]} border-4 border-gray-200 ${colorStyles[color]} border-t-current rounded-full animate-spin`}
      ></div>
      {label && <p className="text-gray-600 text-sm">{label}</p>}
    </div>
  );
};

export default Spinner;
