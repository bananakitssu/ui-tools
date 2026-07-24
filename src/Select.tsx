import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  style,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const selectedIdx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  }, [isOpen, value, options]);

  const selectOption = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        selectOption(options[highlightedIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '300px', ...style }}>
      {label && (
        <label style={{ fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold, fontFamily: theme.typography.display, color: theme.colors.ink }}>
          {label}
        </label>
      )}

      <div
        ref={containerRef}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label || 'Select'}
        onKeyDown={handleKeyDown}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '12px 16px',
          backgroundColor: theme.colors.surface,
          border: isOpen ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.md,
          boxShadow: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: theme.typography.body,
          transition: 'border-color 0.15s ease',
        }}
      >
        <span style={{ fontSize: theme.typography.size.base, color: selectedOption ? theme.colors.ink : theme.colors.textMuted }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.colors.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>

        {isOpen && (
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
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectOption(option);
                  }}
                  style={{
                    padding: '9px 12px',
                    fontSize: theme.typography.size.sm,
                    color: theme.colors.ink,
                    borderRadius: '7px',
                    backgroundColor: isHighlighted ? theme.colors.primaryLight : 'transparent',
                    fontWeight: isSelected ? theme.typography.weight.semibold : theme.typography.weight.regular,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.1s ease',
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
