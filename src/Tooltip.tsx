import React, { useState, useRef } from 'react';
import { useTheme } from './theme';

export interface TooltipProps {
  label: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}


export const Tooltip: React.FC<TooltipProps> = ({ label, children, placement = 'top' }) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  const show = () => {
    timeoutRef.current = window.setTimeout(() => setVisible(true), 400);
  };

  const hide = () => {
    window.clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const positionStyles: React.CSSProperties = (() => {
    switch (placement) {
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '6px' };
      case 'left':
        return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '6px' };
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '6px' };
      default:
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px' };
    }
  })();

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            ...positionStyles,
            backgroundColor: theme.colors.ink,
            color: '#ffffff',
            fontSize: theme.typography.size.xs,
            fontFamily: theme.typography.body,
            padding: '5px 9px',
            borderRadius: theme.radii.sm,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
};
