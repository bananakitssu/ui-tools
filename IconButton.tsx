import React from 'react';
import { useTheme } from './theme';
import { useRipple } from './useRipple';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  children?: React.ReactNode;
}

const sizeMap = { small: 32, medium: 40, large: 48 };

export const IconButton: React.FC<IconButtonProps> = ({
  size = 'medium',
  color,
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
    startRipple(0, 0, dimension);
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
      startRipple(0, 0, dimension);
      window.setTimeout(endRipple, 120);
    }
    onClick?.(e);
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
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        color: disabled ? theme.colors.textDisabled : color || theme.colors.ink,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            opacity: r.exiting ? 0 : 0.18,
            transform: r.active ? 'scale(1)' : 'scale(0)',
            transition: r.exiting ? 'opacity 300ms ease-out' : 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
          }}
        />
      ))}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </span>
    </button>
  );
};
