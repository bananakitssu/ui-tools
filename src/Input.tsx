import React, { useId, useState } from 'react';
import { useTheme } from './theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  helperText?: string;
  labelColor?: string;
  activeColor?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error = false,
  helperText,
  labelColor,
  activeColor,
  value,
  defaultValue,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  style,
  ...rest
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? '');
  const uid = useId().replace(/[:]/g, '');

  const currentValue = value !== undefined ? value : internalValue;
  const isFloated = isFocused || Boolean(currentValue) || Boolean(placeholder);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (onChange) onChange(e);
  };

  const defaultLabelColor = labelColor || theme.colors.textMuted;
  const focusColor = activeColor || theme.colors.primary;

  let currentBorderColor: string = theme.colors.border;
  let currentLabelColor = defaultLabelColor;

  if (error) {
    currentBorderColor = theme.colors.error;
    currentLabelColor = theme.colors.error;
  } else if (isFocused) {
    currentBorderColor = focusColor;
    currentLabelColor = focusColor;
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', width: '100%', maxWidth: '300px', fontFamily: theme.typography.body, ...style }}>
      <div
        style={{
          position: 'relative',
          marginTop: '8px',
          backgroundColor: theme.colors.surface,
          border: `${isFocused ? '2px' : '1px'} solid ${currentBorderColor}`,
          borderRadius: theme.radii.md,
          transition: 'border-color 0.15s ease',
        }}
      >
        <label
          htmlFor={uid}
          style={{
            position: 'absolute',
            left: '14px',
            top: isFloated ? '7px' : '50%',
            transform: isFloated ? 'translateY(0) scale(0.75)' : 'translateY(-50%) scale(1)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
            color: currentLabelColor,
            fontWeight: theme.typography.weight.medium,
            transition: 'all 0.18s cubic-bezier(0.0, 0, 0.2, 1)',
            zIndex: 1,
          }}
        >
          {label}
        </label>

        <input
          id={uid}
          value={currentValue}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            width: '100%',
            paddingTop: isFloated ? '20px' : '14px',
            paddingBottom: isFloated ? '8px' : '14px',
            paddingLeft: '14px',
            paddingRight: '14px',
            fontSize: theme.typography.size.base,
            color: theme.colors.ink,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            borderRadius: theme.radii.md,
            boxSizing: 'border-box',
            transition: 'padding 0.18s ease',
          }}
          {...rest}
        />
      </div>

      {helperText && (
        <span
          style={{
            fontSize: theme.typography.size.xs,
            color: error ? theme.colors.error : theme.colors.textMuted,
            marginTop: '4px',
            marginLeft: '14px',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};
