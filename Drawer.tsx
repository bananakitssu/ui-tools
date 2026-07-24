import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from './theme';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const ENTER_DURATION = 225;
const EXIT_DURATION = 195;


export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, anchor = 'left', children, style }) => {
  const theme = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
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
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [shouldRender, isMounted]);

  if (!shouldRender || !isMounted) return null;

  const isHorizontal = anchor === 'left' || anchor === 'right';
  const hiddenTransform =
    anchor === 'left' ? 'translateX(-100%)' : anchor === 'right' ? 'translateX(100%)' : anchor === 'top' ? 'translateY(-100%)' : 'translateY(100%)';

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
        zIndex: 9999,
        display: 'flex',
        justifyContent: anchor === 'right' ? 'flex-end' : anchor === 'left' ? 'flex-start' : 'stretch',
        alignItems: anchor === 'bottom' ? 'flex-end' : anchor === 'top' ? 'flex-start' : 'stretch',
      }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.colors.surface,
          boxShadow: theme.shadow.modal,
          width: isHorizontal ? '280px' : '100%',
          height: isHorizontal ? '100%' : 'auto',
          maxHeight: !isHorizontal ? '80vh' : undefined,
          overflow: 'auto',
          transform: visible ? 'translate(0, 0)' : hiddenTransform,
          transition: visible
            ? `transform ${ENTER_DURATION}ms cubic-bezier(0.0, 0, 0.2, 1)`
            : `transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 1, 1)`,
          fontFamily: theme.typography.body,
          ...style,
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
