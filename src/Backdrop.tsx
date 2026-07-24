import React, { useEffect, useState } from 'react';
import { CircularProgress } from './CircularProgress';

export interface BackdropProps {
  open: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const ENTER_DURATION = 225;
const EXIT_DURATION = 195;


export const Backdrop: React.FC<BackdropProps> = ({ open, children, onClick, style }) => {
  const [shouldRender, setShouldRender] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
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
  }, [open]);

  if (!shouldRender) return null;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        color: '#ffffff',
        opacity: visible ? 1 : 0,
        transition: `opacity ${visible ? ENTER_DURATION : EXIT_DURATION}ms ease`,
        ...style,
      }}
    >
      {children ?? <CircularProgress color="#ffffff" trackColor="rgba(255,255,255,0.3)" />}
    </div>
  );
};
