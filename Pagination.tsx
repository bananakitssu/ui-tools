import React from 'react';
import { useTheme } from './theme';

export interface PaginationProps {
  count: number;
  
  page: number;
  onChange: (page: number) => void;
  style?: React.CSSProperties;
}

function getPageList(count: number, page: number): (number | '...')[] {
  const delta = 1;
  const range: number[] = [];
  for (let i = Math.max(2, page - delta); i <= Math.min(count - 1, page + delta); i++) range.push(i);

  const pages: (number | '...')[] = [1];
  if (range[0] > 2) pages.push('...');
  pages.push(...range);
  if (range[range.length - 1] < count - 1) pages.push('...');
  if (count > 1) pages.push(count);
  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({ count, page, onChange, style }) => {
  const theme = useTheme();
  const pages = getPageList(count, page);

  const buttonBase: React.CSSProperties = {
    flexShrink: 0,
    minWidth: '32px',
    height: '32px',
    padding: '0 6px',
    borderRadius: theme.radii.sm,
    border: 'none',
    background: 'transparent',
    fontFamily: theme.typography.body,
    fontSize: theme.typography.size.sm,
    color: theme.colors.ink,
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        maxWidth: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
    >
      <button
        onClick={() => page > 1 && onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        style={{ ...buttonBase, opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ ...buttonBase, cursor: 'default', color: theme.colors.textMuted }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...buttonBase,
              backgroundColor: p === page ? theme.colors.primary : 'transparent',
              color: p === page ? '#ffffff' : theme.colors.ink,
              fontWeight: p === page ? theme.typography.weight.semibold : theme.typography.weight.regular,
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => page < count && onChange(page + 1)}
        disabled={page >= count}
        aria-label="Next page"
        style={{ ...buttonBase, opacity: page >= count ? 0.4 : 1, cursor: page >= count ? 'not-allowed' : 'pointer' }}
      >
        ›
      </button>
    </div>
  );
};
