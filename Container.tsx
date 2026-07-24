import React from 'react';
import { useTheme } from './theme';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
  
  fullHeight?: boolean;
  children?: React.ReactNode;


const widths: Record<string, string> = {
  sm: '480px',
  md: '640px',
  lg: '860px',
  xl: '1120px',
};


export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'md',
  fullHeight = false,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <div
      style={{
        background: fullHeight ? theme.colors.surfaceSunken : undefined,
        minHeight: fullHeight ? '100vh' : undefined,
        padding: fullHeight ? '56px 24px' : undefined,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: maxWidth ? widths[maxWidth] : undefined,
          margin: '0 auto',
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
};
