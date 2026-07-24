import React from 'react';
import { useTheme } from './theme';
import { useRipple } from './useRipple';

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'default';
  
  variant?: 'circular' | 'extended';
  
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'none';
  children?: React.ReactNode;
}

const sizeMap = { small: 40, medium: 56, large: 64 };

export const Fab: React.FC<FabProps> = ({
  size = 'medium',
  color = 'primary',
  variant = 'circular',
  position = 'none',
  disabled,
  children,
  style,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...rest
}) => {
  const theme = useTheme();
  const dimension = sizeMap[size];
  const { ripples, startRipple, endRipple } = useRipple(disabled);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rippleSize = Math.max(rect.width, rect.height) * 2;
    startRipple(e.clientX - rect.left - rippleSize / 2, e.clientY - rect.top - rippleSize / 2, rippleSize);
    onPointerDown?.(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    endRipple();
    onPointerUp?.(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    endRipple();
    onPointerLeave?.(e);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    endRipple();
    onPointerCancel?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0 && !disabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const rippleSize = Math.max(rect.width, rect.height) * 1.3;
      startRipple(rect.width / 2 - rippleSize / 2, rect.height / 2 - rippleSize / 2, rippleSize);
      window.setTimeout(endRipple, 120);
    }
    onClick?.(e);
  };

  const rippleColor = color === 'primary' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(79, 70, 229, 0.25)';

  const positionStyles: React.CSSProperties =
    position === 'none'
      ? {}
      : {
          position: 'fixed',
          ...(position.includes('bottom') ? { bottom: 24 } : { top: 24 }),
          ...(position.includes('right') ? { right: 24 } : { left: 24 }),
          zIndex: 1000,
        };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: `${dimension}px`,
        width: variant === 'extended' ? 'auto' : `${dimension}px`,
        minWidth: variant === 'extended' ? `${dimension}px` : undefined,
        paddingLeft: variant === 'extended' ? '20px' : 0,
        paddingRight: variant === 'extended' ? '20px' : 0,
        borderRadius: variant === 'extended' ? `${dimension / 2}px` : '50%',
        border: 'none',
        backgroundColor: disabled ? theme.colors.borderSubtle : color === 'primary' ? theme.colors.primary : theme.colors.surface,
        color: disabled ? theme.colors.textDisabled : color === 'primary' ? '#ffffff' : theme.colors.ink,
        boxShadow: disabled ? 'none' : theme.shadow.dropdown,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: theme.typography.body,
        fontWeight: theme.typography.weight.semibold,
        fontSize: theme.typography.size.sm,
        transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
        WebkitTapHighlightColor: 'transparent',
        ...positionStyles,
        ...style,
      }}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            borderRadius: '50%',
            backgroundColor: rippleColor,
            transform: r.active ? 'scale(1)' : 'scale(0)',
            opacity: r.exiting ? 0 : 0.45,
            transition: r.exiting ? 'opacity 300ms ease-out' : 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
          }}
        />
      ))}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </span>
    </button>
  );
};
