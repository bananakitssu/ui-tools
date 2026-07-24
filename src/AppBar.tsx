import React from 'react';
import { useTheme } from './theme';

export interface AppBarProps extends React.HTMLAttributes<HTMLElement> {
  
  position?: 'static' | 'sticky' | 'fixed';
  color?: 'primary' | 'surface';
  elevation?: boolean;
  children?: React.ReactNode;
}


export const AppBar: React.FC<AppBarProps> = ({
  position = 'static',
  color = 'primary',
  elevation = true,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <header
      style={{
        position,
        top: position !== 'static' ? 0 : undefined,
        left: position !== 'static' ? 0 : undefined,
        right: position !== 'static' ? 0 : undefined,
        zIndex: position !== 'static' ? 1100 : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '56px',
        padding: '0 16px',
        backgroundColor: color === 'primary' ? theme.colors.primary : theme.colors.surface,
        color: color === 'primary' ? '#ffffff' : theme.colors.ink,
        boxShadow: elevation ? theme.shadow.card : 'none',
        fontFamily: theme.typography.body,
        boxSizing: 'border-box',
        ...style,
      }}
      {...rest}
    >
      {children}
    </header>
  );
};

export interface AppBarTitleProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}


export const AppBarTitle: React.FC<AppBarTitleProps> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <span
      style={{
        fontSize: theme.typography.size.lg,
        fontWeight: theme.typography.weight.bold,
        fontFamily: theme.typography.display,
        flex: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
