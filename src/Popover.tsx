import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from './theme';

export interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const ENTER_DURATION = 150;

export const Popover: React.FC<PopoverProps> = ({ isOpen, onClose, anchorRef, children, style }) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && !anchorRef.current?.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const rect = anchorRef.current?.getBoundingClientRect();
  const top = rect ? rect.bottom + 8 : 0;
  const left = rect ? rect.left : 0;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      style={{
        position: 'fixed',
        top: Math.max(top, 8),
        left: Math.max(Math.min(left, window.innerWidth - 250), 8),
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.borderSubtle}`,
        borderRadius: theme.radii.md,
        boxShadow: theme.shadow.dropdown,
        padding: '16px',
        zIndex: 10000,
        fontFamily: theme.typography.body,
        transformOrigin: 'top left',
        transform: visible ? 'scale(1)' : 'scale(0.9)',
        opacity: visible ? 1 : 0,
        transition: `transform ${ENTER_DURATION}ms cubic-bezier(0.0, 0, 0.2, 1), opacity ${ENTER_DURATION}ms ease`,
        ...style,
      }}
    >
      {children}
    </div>,
    document.body
  );
};
