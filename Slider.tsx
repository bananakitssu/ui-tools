import React, { useId, useState } from 'react';
import { useTheme } from './theme';

export interface SliderProps {
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
  style?: React.CSSProperties;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onChange,
  showValue = false,
  style,
}) => {
  const theme = useTheme();
  const [internalValue, setInternalValue] = useState(value ?? min);
  const currentValue = value !== undefined ? value : internalValue;
  const uid = useId().replace(/[:]/g, '');
  const cls = `ui-slider-${uid}`;
  const percent = ((currentValue - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setInternalValue(v);
    onChange?.(v);
  };

  const thumbColor = disabled ? theme.colors.textDisabled : theme.colors.primary;

  return (
    <div style={{ width: '100%', maxWidth: '300px', fontFamily: theme.typography.body, ...style }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          {label && (
            <label htmlFor={uid} style={{ fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.medium, color: theme.colors.ink }}>
              {label}
            </label>
          )}
          {showValue && <span style={{ fontSize: theme.typography.size.sm, color: theme.colors.textMuted }}>{currentValue}</span>}
        </div>
      )}

      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', borderRadius: '2px', backgroundColor: theme.colors.borderSubtle }} />
        <div style={{ position: 'absolute', left: 0, width: `${percent}%`, height: '4px', borderRadius: '2px', backgroundColor: thumbColor }} />

        <input
          id={uid}
          className={cls}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          style={{
            position: 'relative',
            width: '100%',
            height: '20px',
            margin: 0,
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            WebkitAppearance: 'none',
            appearance: 'none',
            outline: 'none',
          }}
        />
      </div>

      <style>{`
        .${cls} { -webkit-appearance: none; appearance: none; outline: none; }
        .${cls}::-webkit-slider-runnable-track { background: transparent; height: 4px; }
        .${cls}::-moz-range-track { background: transparent; height: 4px; }
        .${cls}::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: ${thumbColor};
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          margin-top: -6px;
          transition: box-shadow 0.15s ease;
        }
        .${cls}::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%; border: none;
          background: ${thumbColor};
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          transition: box-shadow 0.15s ease;
        }
        .${cls}:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 8px ${theme.colors.focusRingSoft}; }
        .${cls}:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 8px ${theme.colors.focusRingSoft}; }
        .${cls}:active::-webkit-slider-thumb { box-shadow: 0 0 0 10px ${theme.colors.focusRing}; }
        .${cls}:active::-moz-range-thumb { box-shadow: 0 0 0 10px ${theme.colors.focusRing}; }
      `}</style>
    </div>
  );
};
