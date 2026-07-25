import React from 'react';
import { useTheme } from './theme';

export type AlertSeverity = 'success' | 'error' | 'info' | 'warning';

export interface AlertProps {
  severity?: AlertSeverity;
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({ severity = 'info', title, onClose, children, style }) => {
  const theme = useTheme();

  const palettes: Record<AlertSeverity, { bg: string; border: string; text: string }> = {
    success: { bg: theme.colors.successLight, border: theme.colors.success, text: '#14532d' },
    error: { bg: theme.colors.errorLight, border: theme.colors.error, text: '#7f1d1d' },
    info: { bg: theme.colors.primaryLight, border: theme.colors.primary, text: '#1e1b4b' },
    warning: { bg: theme.colors.accentLight, border: '#D97F0A', text: '#7c4a03' },
  };
  const palette = palettes[severity];

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: theme.radii.md,
        backgroundColor: palette.bg,
        borderLeft: `4px solid ${palette.border}`,
        color: palette.text,
        fontFamily: theme.typography.body,
        fontSize: theme.typography.size.sm,
        ...style,
      }}
    >
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: theme.typography.weight.semibold, marginBottom: children ? '4px' : 0 }}>
            {title}
          </div>
        )}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: palette.text,
            opacity: 0.7,
            fontSize: '14px',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
