import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from './theme';

export interface ContextMenuItem {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  
  danger?: boolean;
  
  divider?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
}

const ENTER_DURATION = 120;


export const ContextMenu: React.FC<ContextMenuProps> = ({ items, children }) => {
  const theme = useTheme();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setPosition(null);
    setVisible(false);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
  };

  
  useEffect(() => {
    if (!position) return;
    setVisible(false);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [position]);

  useEffect(() => {
    if (!position) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', close, true);
    };
  }, [position, close]);

  
  const clampedX = position ? Math.min(position.x, window.innerWidth - 200) : 0;
  const clampedY = position ? Math.min(position.y, window.innerHeight - (items.length * 36 + 20)) : 0;

  return (
    <>
      <div onContextMenu={handleContextMenu} style={{ display: 'contents' }}>
        {children}
      </div>

      {position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: Math.max(clampedY, 8),
              left: Math.max(clampedX, 8),
              minWidth: '180px',
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.radii.md,
              boxShadow: theme.shadow.dropdown,
              padding: '6px',
              zIndex: 10000,
              fontFamily: theme.typography.body,
              transformOrigin: 'top left',
              transform: visible ? 'scale(1)' : 'scale(0.85)',
              opacity: visible ? 1 : 0,
              transition: `transform ${ENTER_DURATION}ms cubic-bezier(0.0, 0, 0.2, 1), opacity ${ENTER_DURATION}ms ease`,
            }}
          >
            {items.map((item, i) =>
              item.divider ? (
                <div key={i} style={{ height: '1px', backgroundColor: theme.colors.borderSubtle, margin: '6px 4px' }} />
              ) : (
                <button
                  key={i}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    item.onClick?.();
                    close();
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.colors.primaryLight;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    fontSize: theme.typography.size.sm,
                    color: item.disabled ? theme.colors.textDisabled : item.danger ? theme.colors.error : theme.colors.ink,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: theme.radii.sm,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    display: 'block',
                  }}
                >
                  {item.label}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
};
