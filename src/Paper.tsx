import React from 'react';
import { useTheme } from './theme';

export type PaperElevation = 0 | 1 | 2 | 3 | 4;

export interface PaperProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  
  elevation?: PaperElevation;
  
  variant?: 'elevation' | 'outlined';
  
  square?: boolean;
  children?: React.ReactNode;
}

const elevationShadowKey = ['sm', 'sm', 'card', 'dropdown', 'modal'] as const;


export const Paper: React.FC<PaperProps> = ({
  as: Tag = 'div',
  elevation = 1,
  variant = 'elevation',
  square = false,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const shadowKey = elevation === 0 ? null : elevationShadowKey[elevation];

  return (
    <Tag
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: square ? 0 : theme.radii.lg,
        border: variant === 'outlined' ? `1px solid ${theme.colors.border}` : 'none',
        boxShadow: variant === 'outlined' || !shadowKey ? 'none' : theme.shadow[shadowKey],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};
