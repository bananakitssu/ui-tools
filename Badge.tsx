import React from 'react';
import { useTheme } from './theme';

export interface BadgeProps {
  content?: React.ReactNode;
  color?: string;
  
  variant?: 'standard' | 'dot';
  max?: number;
  invisible?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}


export const Badge: React.FC<BadgeProps> = ({ content, color, variant = 'standard', max = 99, invisible = false, children, style }) => {
  const theme = useTheme();
  const resolvedColor = color || theme.colors.error;

  let displayContent: React.ReactNode = content;
  if (variant === 'standard' && typeof content === 'number' && content > max) {
    displayContent = `${max}+`;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', ...style }}>
      {children}
      {!invisible && (
        <span
          style={{
            position: 'absolute',
            top: variant === 'dot' ? '2px' : '-4px',
            right: variant === 'dot' ? '2px' : '-4px',
            minWidth: variant === 'dot' ? '8px' : '18px',
            height: variant === 'dot' ? '8px' : '18px',
            padding: variant === 'dot' ? 0 : '0 4px',
            borderRadius: '999px',
            backgroundColor: resolvedColor,
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: theme.typography.weight.semibold,
            fontFamily: theme.typography.body,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${theme.colors.surface}`,
            boxSizing: 'content-box',
          }}
        >
          {variant === 'standard' ? displayContent : null}
        </span>
      )}
    </div>
  );
};
