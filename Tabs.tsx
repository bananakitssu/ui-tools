import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from './theme';

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({ items, value, onChange, style }) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = items.findIndex((i) => i.value === value);
    const el = containerRef.current?.children[activeIndex] as HTMLElement | undefined;
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, items]);

  return (
    <div style={{ position: 'relative', borderBottom: `1px solid ${theme.colors.borderSubtle}`, ...style }}>
      <div ref={containerRef} style={{ display: 'flex', gap: '4px', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              disabled={item.disabled}
              onClick={() => !item.disabled && onChange(item.value)}
              style={{
                flexShrink: 0,
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                fontFamily: theme.typography.body,
                fontSize: theme.typography.size.sm,
                fontWeight: active ? theme.typography.weight.semibold : theme.typography.weight.medium,
                color: item.disabled ? theme.colors.textDisabled : active ? theme.colors.primary : theme.colors.textMuted,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'color 0.15s ease',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          height: '2px',
          backgroundColor: theme.colors.primary,
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
};
