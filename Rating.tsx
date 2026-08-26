import React, { useState } from 'react';
import { useTheme } from './theme';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

export const Rating: React.FC<RatingProps> = ({ value, onChange, max = 5, readOnly = false, size = 24, style }) => {
  const theme = useTheme();
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div style={{ display: 'inline-flex', gap: '2px', ...style }} onMouseLeave={() => setHoverValue(null)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayValue;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverValue(starValue)}
            aria-label={`Rate ${starValue} out of ${max}`}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: readOnly ? 'default' : 'pointer',
              color: filled ? theme.colors.accent : theme.colors.borderSubtle,
              lineHeight: 0,
              transition: 'color 0.1s ease, transform 0.1s ease',
              transform: hoverValue === starValue ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};
