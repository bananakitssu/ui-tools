import React from 'react';
import { useTheme } from './theme';
import { useRipple } from './useRipple';

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode;
  button?: boolean;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({
  children,
  button = false,
  onClick,
  selected = false,
  disabled = false,
  startAdornment,
  endAdornment,
  primary,
  secondary,
  style,
  ...rest
}) => {
  const theme = useTheme();
  const { ripples, startRipple, endRipple } = useRipple(disabled || !button);

  const handlePointerDown = (e: React.PointerEvent<HTMLLIElement>) => {
    if (!button || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    startRipple(e.clientX - rect.left - size / 2, e.clientY - rect.top - size / 2, size);
  };

  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (!button || disabled) return;
    if (e.detail === 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.3;
      startRipple(rect.width / 2 - size / 2, rect.height / 2 - size / 2, size);
      window.setTimeout(endRipple, 120);
    }
    onClick?.();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLLIElement>) => {
    if (button && !disabled && !selected) (e.currentTarget as HTMLLIElement).style.backgroundColor = theme.colors.surfaceSunken;
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLLIElement>) => {
    if (button && !selected) (e.currentTarget as HTMLLIElement).style.backgroundColor = 'transparent';
  };

  return (
    <li
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={endRipple}
      onPointerLeave={(e) => { endRipple(); handleMouseLeave(e); }}
      onPointerCancel={endRipple}
      onMouseEnter={handleMouseEnter}
      style={{
        position: 'relative',
        overflow: button ? 'hidden' : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        cursor: button && !disabled ? 'pointer' : 'default',
        backgroundColor: selected ? theme.colors.primaryLight : 'transparent',
        color: disabled ? theme.colors.textDisabled : theme.colors.ink,
        transition: 'background-color 0.15s ease',
        ...style,
      }}
      {...rest}
    >
      {button &&
        ripples.map((r) => (
          <span
            key={r.id}
            style={{
              position: 'absolute',
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
              borderRadius: '50%',
              backgroundColor: theme.colors.primary,
              opacity: r.exiting ? 0 : 0.14,
              transform: r.active ? 'scale(1)' : 'scale(0)',
              transition: r.exiting ? 'opacity 300ms ease-out' : 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none',
            }}
          />
        ))}

      {startAdornment && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>{startAdornment}</div>
      )}

      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        {primary && <div style={{ fontSize: theme.typography.size.base, fontWeight: theme.typography.weight.medium }}>{primary}</div>}
        {secondary && <div style={{ fontSize: theme.typography.size.sm, color: theme.colors.textMuted }}>{secondary}</div>}
        {!primary && !secondary && children}
      </div>

      {endAdornment && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>{endAdornment}</div>
      )}
    </li>
  );
};
