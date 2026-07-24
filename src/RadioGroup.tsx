import React from 'react';
import { useTheme } from './theme';

export interface RadioGroupProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  direction?: 'column' | 'row'; 
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  value,
  onChange,
  direction = 'column',
  children,
  style,
}) => {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      {label && (
        <span style={{ fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold, fontFamily: theme.typography.display, color: theme.colors.ink, marginBottom: '4px' }}>
          {label}
        </span>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: direction, 
          gap: direction === 'column' ? '12px' : '16px',
          alignItems: 'flex-start',
        }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              name,
              checked: child.props.value === value,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
            } as any);
          }
          return child;
        })}
      </div>
    </div>
  );
};