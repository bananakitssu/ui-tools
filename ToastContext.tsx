import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme, type Theme } from './theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  
  leaving?: boolean;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};



const ENTER_DURATION = 225;
const EXIT_DURATION = 195;

interface ToastItemProps {
  toast: Toast;
  colors: { bg: string; border: string };
  theme: Theme;
  onClose: () => void;
}



const ToastItem: React.FC<ToastItemProps> = ({ toast, colors, theme, onClose }) => {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    let raf2 = 0;
    
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const visible = entered && !toast.leaving;

  return (
    <div
      role="alert"
      style={{
        pointerEvents: 'auto',
        minWidth: '260px',
        maxWidth: '360px',
        backgroundColor: colors.bg,
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: theme.radii.md,
        boxShadow: theme.shadow.toast,
        borderLeft: `4px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: theme.typography.size.sm,
        fontFamily: theme.typography.body,
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible ? 1 : 0,
        transition: visible
          ? `transform ${ENTER_DURATION}ms cubic-bezier(0.0, 0, 0.2, 1), opacity ${ENTER_DURATION}ms ease`
          : `transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 1, 1), opacity ${EXIT_DURATION}ms ease`,
      }}
    >
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0 4px',
          opacity: 0.8,
        }}
      >
        ✕
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const toastColors: Record<ToastType, { bg: string; border: string }> = {
    success: { bg: theme.colors.success, border: '#7FD9A3' },
    error: { bg: theme.colors.error, border: '#F0A3A7' },
    info: { bg: theme.colors.primary, border: theme.colors.primaryBorder },
    warning: { bg: '#D97F0A', border: '#FBC97F' },
  };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  
  const purgeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  
  const removeToast = useCallback(
    (id: string) => {
      setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
      window.setTimeout(() => purgeToast(id), EXIT_DURATION);
    },
    [purgeToast]
  );

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      
      {isMounted && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              colors={toastColors[toast.type]}
              theme={theme}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
