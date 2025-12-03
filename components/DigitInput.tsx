import React, { useRef, useEffect } from 'react';

interface DigitInputProps {
  value: string;
  onChange: (val: string) => void;
  isFocused?: boolean;
  isReadOnly?: boolean;
  variant?: 'primary' | 'carry';
  status?: 'default' | 'correct' | 'error';
  onEnter?: () => void;
  maxLength?: number;
}

const DigitInput: React.FC<DigitInputProps> = ({ 
  value, 
  onChange, 
  isFocused, 
  isReadOnly, 
  variant = 'primary',
  status = 'default',
  onEnter,
  maxLength = 1
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const baseStyles = "transition-all duration-200 text-center font-bold outline-none select-none";
  
  const sizeStyles = variant === 'primary' 
    ? "w-12 h-14 sm:w-16 sm:h-20 text-3xl sm:text-4xl rounded-lg border-2 shadow-sm"
    : "w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-lg rounded-full border border-dashed mb-1 px-0";

  const getStatusStyles = () => {
    if (isReadOnly && status === 'correct') return "bg-green-100 border-green-500 text-green-700";
    if (status === 'error') return "bg-red-50 border-red-500 text-red-700 animate-pulse";
    if (isReadOnly) return "bg-gray-50 border-gray-200 text-gray-400";
    return "bg-white border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-700";
  };

  // Adjust font size if value is longer (e.g. '10')
  const fontSizeStyle = (value.length > 1 && variant === 'carry') ? { fontSize: '0.75rem' } : {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      onChange(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
    <div className="flex justify-center items-center">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isReadOnly}
        className={`${baseStyles} ${sizeStyles} ${getStatusStyles()}`}
        style={fontSizeStyle}
        autoComplete="off"
      />
    </div>
  );
};

export default DigitInput;