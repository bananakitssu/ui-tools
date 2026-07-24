import React, { useId } from 'react';
import { useTheme } from './theme';
import { useRipple } from './useRipple';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  labelColor?: string;
}

const HIT_SIZE = 36;

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  labelColor,
  checked,
  disabled,
  style,
  onChange,
  ...rest
}) => {
  const theme = useTheme();
  const currentTextColor = labelColor || (disabled ? theme.colors.textDisabled : theme.colors.ink);
  const uid = useId().replace(/[:]/g, '');
  const cls = `ui-chk-${uid}`;
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
      <style>{`
        .${cls} { transform: scale(0.4); opacity: 0; transition: transform 0.1s ease, opacity 0.1s ease; }
        .${cls}.is-checked { transform: scale(1); opacity: 1; }
        .${cls}-box:has(input:focus-visible) { box-shadow: 0 0 0 3px ${theme.colors.focusRing}; }
      `}</style>

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
          margin: `${-(HIT_SIZE - 19) / 2}px`,
          borderRadius: '50%',
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
              opacity: r.exiting ? 0 : 0.45,
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
          style={{
            position: 'absolute',
            opacity: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            zIndex: 1,
          }}
          {...rest}
        />

        <div
          className={`${cls}-box`}
          style={{
            width: '19px',
            height: '19px',
            borderRadius: theme.radii.sm,
            border: `2px solid ${disabled ? theme.colors.borderSubtle : checked ? theme.colors.primary : theme.colors.border}`,
            backgroundColor: checked && !disabled ? theme.colors.primary : theme.colors.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease-in-out',
            boxSizing: 'border-box',
          }}
        >
          <svg className={`${cls} ${checked ? 'is-checked' : ''}`} viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      {label && <span>{label}</span>}
    </label>
  );
};
