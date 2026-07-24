import React, { useId } from 'react';
import { useTheme } from './theme';
import { useRipple } from './useRipple';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  labelColor?: string;
}

const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 22;
const THUMB_SIZE = 16;
const HIT_SIZE = 48;

export const Switch: React.FC<SwitchProps> = ({ label, labelColor, checked, disabled, style, onChange, ...rest }) => {
  const theme = useTheme();
  const currentTextColor = labelColor || (disabled ? theme.colors.textDisabled : theme.colors.ink);
  const uid = useId().replace(/[:]/g, '');
  const { ripples, startRipple, endRipple } = useRipple(disabled);

  const handlePointerDown = () => startRipple(0, 0, HIT_SIZE);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.detail === 0 && !disabled) {
      startRipple(0, 0, HIT_SIZE);
      window.setTimeout(endRipple, 120);
    }
  };

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        fontSize: theme.typography.size.base,
        fontFamily: theme.typography.body,
        color: currentTextColor,
        ...style,
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={endRipple}
        onPointerLeave={endRipple}
        onPointerCancel={endRipple}
        onClick={handleClick}
        style={{
          position: 'relative',
          width: `${HIT_SIZE}px`,
          height: `${HIT_SIZE}px`,
          margin: `${-(HIT_SIZE - TRACK_HEIGHT) / 2}px ${-(HIT_SIZE - TRACK_WIDTH) / 2}px`,
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: theme.colors.primary,
              transform: r.active ? 'scale(1)' : 'scale(0)',
              opacity: r.exiting ? 0 : 0.35,
              transition: r.exiting ? 'opacity 300ms ease-out' : 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none',
            }}
          />
        ))}

        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', margin: 0, cursor: disabled ? 'not-allowed' : 'pointer', zIndex: 1 }}
          {...rest}
        />

        <div
          style={{
            width: `${TRACK_WIDTH}px`,
            height: `${TRACK_HEIGHT}px`,
            borderRadius: '999px',
            backgroundColor: disabled ? theme.colors.borderSubtle : checked ? theme.colors.primary : theme.colors.border,
            position: 'relative',
            transition: 'background-color 0.15s ease',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '3px',
              left: checked ? `${TRACK_WIDTH - THUMB_SIZE - 3}px` : '3px',
              width: `${THUMB_SIZE}px`,
              height: `${THUMB_SIZE}px`,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              transition: 'left 0.15s ease',
            }}
          />
        </div>
      </div>

      {label && <span>{label}</span>}
    </label>
  );
};
