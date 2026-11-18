import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export const BLOOD_GROUP_OPTIONS: SelectOption[] = [
  { value: 'A(II) Rh+', label: 'A(II) Rh+' },
  { value: 'A(II) Rh-', label: 'A(II) Rh-' },
  { value: 'O(I) Rh+', label: 'O(I) Rh+' },
  { value: 'O(I) Rh-', label: 'O(I) Rh-' },
  { value: 'B(III) Rh+', label: 'B(III) Rh+' },
  { value: 'B(III) Rh-', label: 'B(III) Rh-' },
  { value: 'AB(IV) Rh+', label: 'AB(IV) Rh+' },
  { value: 'AB(IV) Rh-', label: 'AB(IV) Rh-' },
];

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  placeholder = 'Выберите...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between text-left text-xs font-bold rounded-xl border transition-all cursor-pointer select-none ${
          buttonClassName ||
          'px-2.5 py-1.5 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-white hover:border-purple-300 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30'
        }`}
      >
        <span className="truncate pr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-purple-600 dark:text-purple-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a202c] shadow-xl py-1 animate-scale-in text-xs font-bold"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={14} className="text-purple-600 dark:text-purple-400 flex-shrink-0 ml-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
