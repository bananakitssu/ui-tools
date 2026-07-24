import React from 'react';
import { useTheme } from './theme';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  
  children?: React.ReactNode;
}

export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', children, style, ...rest }) => {
  const theme = useTheme();

  if (orientation === 'vertical') {
    return (
      <div
        style={{ width: '1px', alignSelf: 'stretch', backgroundColor: theme.colors.borderSubtle, ...style }}
        {...rest}
      />
    );
  }

  if (children) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: theme.colors.textMuted,
          fontSize: theme.typography.size.xs,
          fontFamily: theme.typography.body,
          ...style,
        }}
        {...rest}
      >
        <span style={{ flex: 1, height: '1px', backgroundColor: theme.colors.borderSubtle }} />
        {children}
        <span style={{ flex: 1, height: '1px', backgroundColor: theme.colors.borderSubtle }} />
      </div>
    );
  }

  return (
    <div style={{ height: '1px', width: '100%', backgroundColor: theme.colors.borderSubtle, ...style }} {...rest} />
  );
};
