import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from './theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const ENTER_DURATION = 225;
const EXIT_DURATION = 195;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  style,
}) => {
  const theme = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setVisible(false);
      const timeout = window.setTimeout(() => setShouldRender(false), EXIT_DURATION);
      return () => window.clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender || !isMounted) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () => {
      if (!modalRef.current) return [];
      return Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      );
    };

    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      modalRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const currentFocusables = getFocusableElements();
        if (currentFocusables.length === 0) return;

        const firstElement = currentFocusables[0];
        const lastElement = currentFocusables[currentFocusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);

      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [shouldRender, isMounted]);

  if (!shouldRender || !isMounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: visible ? 1 : 0,
        transition: `opacity ${visible ? ENTER_DURATION : EXIT_DURATION}ms ease`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()} 
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          boxShadow: theme.shadow.modal,
          width: '100%',
          maxWidth: '440px',
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: theme.typography.body,
          transform: visible ? 'scale(1)' : 'scale(0)',
          opacity: visible ? 1 : 0,
          transformOrigin: 'center',
          transition: visible
            ? `transform ${ENTER_DURATION}ms cubic-bezier(0.0, 0, 0.2, 1), opacity ${ENTER_DURATION}ms ease`
            : `transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 1, 1), opacity ${EXIT_DURATION}ms ease`,
          ...style,
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom: `1px solid ${theme.colors.borderSubtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {title && (
            <h3
              id="modal-title"
              style={{ margin: 0, fontSize: theme.typography.size.lg, fontWeight: theme.typography.weight.bold, fontFamily: theme.typography.display, color: theme.colors.ink }}
            >
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: theme.colors.textMuted,
              padding: '4px 8px',
              borderRadius: theme.radii.sm,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '22px', color: theme.colors.ink, fontSize: theme.typography.size.base, lineHeight: 1.5 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
