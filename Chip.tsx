import React from 'react';
import { useTheme } from './theme';

export interface ChipProps {
  label: string;
  color?: string;
  variant?: 'filled' | 'outlined';
  onDelete?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Chip: React.FC<ChipProps> = ({ label, color, variant = 'filled', onDelete, onClick, style }) => {
  const theme = useTheme();
  const resolvedColor = color || theme.colors.primary;

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: onDelete ? '4px 6px 4px 14px' : '6px 14px',
        borderRadius: theme.radii.pill,
        backgroundColor: variant === 'filled' ? resolvedColor : 'transparent',
        border: variant === 'outlined' ? `1px solid ${resolvedColor}` : 'none',
        color: variant === 'filled' ? '#ffffff' : resolvedColor,
        fontFamily: theme.typography.body,
        fontSize: theme.typography.size.xs,
        fontWeight: theme.typography.weight.medium,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      {label}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Remove ${label}`}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.75,
            fontSize: '12px',
            padding: 0,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
          }}
        >
          ✕
        </button>
      )}
    </span>
  );
};
