import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from './theme';

export interface MenuItem {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  children: React.ReactNode;
}

const ENTER_DURATION = 120;

export const Menu: React.FC<MenuProps> = ({ items, children }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setVisible(false);
  }, []);

  const handleTriggerClick = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setAnchor({ top: rect.bottom + 6, left: rect.left });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    setVisible(false);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        close();
      }
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
  }, [open, close]);

  const top = anchor ? Math.min(anchor.top, window.innerHeight - (items.length * 36 + 20)) : 0;
  const left = anchor ? Math.min(anchor.left, window.innerWidth - 200) : 0;

  return (
    <>
      <div ref={triggerRef} onClick={handleTriggerClick} style={{ display: 'contents' }}>
        {children}
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: Math.max(top, 8),
              left: Math.max(left, 8),
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
