import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTheme } from './theme';

export interface AutocompleteOption {
  label: string;
  value: string;
}

export interface AutocompleteProps {
  label?: string;
  options: AutocompleteOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}


export const Autocomplete: React.FC<AutocompleteProps> = ({ label, options, value, onChange, placeholder = 'Search...', style }) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value) || null;

  useEffect(() => {
    if (!isOpen) setInputValue(selectedOption ? selectedOption.label : '');
  }, [selectedOption, isOpen]);

  const filteredOptions = useMemo(() => {
    if (!inputValue || (selectedOption && inputValue === selectedOption.label)) return options;
    return options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()));
  }, [inputValue, options, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInputValue(selectedOption ? selectedOption.label : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  const selectOption = (option: AutocompleteOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) selectOption(filteredOptions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '300px', fontFamily: theme.typography.body, ...style }}>
      {label && (
        <label style={{ fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold, fontFamily: theme.typography.display, color: theme.colors.ink, display: 'block', marginBottom: '6px' }}>
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => {
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
          if (value !== null) onChange(null);
        }}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px 16px',
          border: `1px solid ${isOpen ? theme.colors.primary : theme.colors.border}`,
          borderRadius: theme.radii.md,
          fontSize: theme.typography.size.base,
          color: theme.colors.ink,
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.borderSubtle}`,
            borderRadius: theme.radii.md,
            boxShadow: theme.shadow.dropdown,
            listStyle: 'none',
            padding: '6px',
            margin: 0,
            zIndex: 100,
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option);
              }}
              style={{
                padding: '9px 12px',
                fontSize: theme.typography.size.sm,
                color: theme.colors.ink,
                borderRadius: '7px',
                backgroundColor: index === highlightedIndex ? theme.colors.primaryLight : 'transparent',
                fontWeight: option.value === value ? theme.typography.weight.semibold : theme.typography.weight.regular,
                cursor: 'pointer',
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filteredOptions.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.borderSubtle}`,
            borderRadius: theme.radii.md,
            boxShadow: theme.shadow.dropdown,
            padding: '12px',
            color: theme.colors.textMuted,
            fontSize: theme.typography.size.sm,
            zIndex: 100,
          }}
        >
          No options found
        </div>
      )}
    </div>
  );
};
