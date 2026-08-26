import React, { useId, useState } from 'react';
import { useTheme } from './theme';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: boolean;
  helperText?: string;
  labelColor?: string;
  activeColor?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error = false,
  helperText,
  labelColor,
  activeColor,
  rows = 4,
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

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
            top: isFloated ? '-9px' : '14px',
            fontSize: isFloated ? '11px' : theme.typography.size.base,
            padding: isFloated ? '0 4px' : 0,
            backgroundColor: isFloated ? theme.colors.surface : 'transparent',
            pointerEvents: 'none',
            color: currentLabelColor,
            fontWeight: theme.typography.weight.medium,
            transition: 'all 0.18s cubic-bezier(0.0, 0, 0.2, 1)',
            zIndex: 1,
          }}
        >
          {label}
        </label>

        <textarea
          id={uid}
          rows={rows}
          value={currentValue}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            display: 'block',
            width: '100%',
            paddingTop: '14px',
            paddingBottom: '10px',
            paddingLeft: '14px',
            paddingRight: '14px',
            fontSize: theme.typography.size.base,
            fontFamily: theme.typography.body,
            color: theme.colors.ink,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            borderRadius: theme.radii.md,
            boxSizing: 'border-box',
            resize: 'vertical',
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
