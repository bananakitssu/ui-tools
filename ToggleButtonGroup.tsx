import React from 'react';
import { useTheme } from './theme';

export interface ToggleOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface ToggleButtonGroupProps {
  options: ToggleOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  
  multiple?: boolean;
  style?: React.CSSProperties;
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({ options, value, onChange, multiple = false, style }) => {
  const theme = useTheme();
  const selectedValues = Array.isArray(value) ? value : [value];

  const handleClick = (optValue: string, disabled?: boolean) => {
    if (disabled) return;
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(optValue) ? current.filter((v) => v !== optValue) : [...current, optValue];
      onChange(next);
    } else {
      onChange(optValue);
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        maxWidth: '100%',
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radii.md,
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
    >
      {options.map((opt, i) => {
        const isSelected = selectedValues.includes(opt.value);
        return (
          <button
            key={opt.value}
            disabled={opt.disabled}
            onClick={() => handleClick(opt.value, opt.disabled)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              border: 'none',
              borderLeft: i > 0 ? `1px solid ${theme.colors.border}` : 'none',
              backgroundColor: isSelected ? theme.colors.primaryLight : 'transparent',
              color: opt.disabled ? theme.colors.textDisabled : isSelected ? theme.colors.primary : theme.colors.ink,
              fontFamily: theme.typography.body,
              fontSize: theme.typography.size.sm,
              fontWeight: isSelected ? theme.typography.weight.semibold : theme.typography.weight.regular,
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
