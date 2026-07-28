import React from 'react';
import { useTheme } from './theme';
import { Button } from './Button';

export interface BottomNavItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ items, value, onChange, style }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        backgroundColor: theme.colors.surface,
        borderTop: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: theme.shadow.card,
        zIndex: 1000,
        ...style,
      }}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Button
            key={item.value}
            onClick={() => onChange(item.value)}
            variant="secondary"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '8px 4px 10px',
              background: 'transparent',
              borderRadius: 0,
              border: 'none',
              cursor: 'pointer',
              color: active ? theme.colors.primary : theme.colors.textMuted,
              fontFamily: theme.typography.body,
              transition: 'color 0.15s ease',
            }}
          >
            {item.icon && <div style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</div>}
            <span style={{ fontSize: theme.typography.size.xs, fontWeight: active ? theme.typography.weight.semibold : theme.typography.weight.regular }}>
              {item.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
};
