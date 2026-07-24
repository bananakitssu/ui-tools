import React from 'react';
import { useTheme } from './theme';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, separator = '/', style }) => {
  const theme = useTheme();
  return (
    <nav
      aria-label="breadcrumb"
      style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontFamily: theme.typography.body, fontSize: theme.typography.size.sm, ...style }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: theme.colors.textMuted, fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                {item.label}
              </button>
            ) : (
              <span style={{ color: isLast ? theme.colors.ink : theme.colors.textMuted, fontWeight: isLast ? theme.typography.weight.medium : theme.typography.weight.regular }}>
                {item.label}
              </span>
            )}
            {!isLast && <span style={{ color: theme.colors.textMuted }}>{separator}</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
