import React, { useId } from 'react';
import { useTheme } from './theme';
import { useRipple } from './useRipple';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  children,
  style,
  className,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...rest
}, ref) => {
  const theme = useTheme();
  const isActuallyDisabled = disabled || isLoading;
  const uid = useId().replace(/[:]/g, '');
  const cls = `ui-btn-${uid}`;
  const { ripples, startRipple, endRipple } = useRipple(isActuallyDisabled);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    startRipple(e.clientX - rect.left - size / 2, e.clientY - rect.top - size / 2, size);
    if (onPointerDown) onPointerDown(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    endRipple();
    if (onPointerUp) onPointerUp(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    endRipple();
    if (onPointerLeave) onPointerLeave(e);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    endRipple();
    if (onPointerCancel) onPointerCancel(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0 && !isActuallyDisabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.3;
      startRipple(rect.width / 2 - size / 2, rect.height / 2 - size / 2, size);
      window.setTimeout(endRipple, 120);
    }
    if (onClick) onClick(e);
  };

  const rippleColor = variant === 'primary' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(79, 70, 229, 0.25)';

  const baseStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    backgroundColor: variant === 'primary' ? theme.colors.primary : 'transparent',
    color: variant === 'primary' ? '#ffffff' : theme.colors.primary,
    border: variant === 'secondary' ? `1px solid ${theme.colors.primaryBorder}` : 'none',
    borderRadius: theme.radii.md,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    fontFamily: theme.typography.body,
    letterSpacing: 'normal',
    cursor: isActuallyDisabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
    opacity: isActuallyDisabled && !isLoading ? 0.6 : 1,
    WebkitTapHighlightColor: 'transparent',
    ...(isActuallyDisabled
      ? { backgroundColor: theme.colors.borderSubtle, color: theme.colors.textDisabled, border: 'none' }
      : {}),
    ...style,
  };

  return (
    <button
      ref={ref}
      className={`${cls} ${className ?? ''}`}
      style={baseStyles}
      disabled={isActuallyDisabled}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      {...rest}
    >
      <style>{`
        @keyframes ui-spin { 100% { transform: rotate(360deg); } }
        .${cls}:not(:disabled):hover {
          background-color: ${variant === 'primary' ? theme.colors.primaryHover : theme.colors.primaryLight};
        }
        .${cls}:not(:disabled):active {
          background-color: ${variant === 'primary' ? theme.colors.primaryActive : theme.colors.primaryLight};
        }
        .${cls}:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px ${theme.colors.focusRing};
        }
      `}</style>

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

      {isLoading && (
        <svg viewBox="0 0 24 24" width="16" height="16" style={{ animation: 'ui-spin 0.9s linear infinite' }}>
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="45" strokeLinecap="round" />
        </svg>
      )}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';
