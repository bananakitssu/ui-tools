import React, { useState, useRef, useId } from 'react';
import { useTheme } from './theme';

export interface AccordionProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  
  expanded?: boolean;
  onChange?: (expanded: boolean) => void;
  defaultExpanded?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  expanded,
  onChange,
  defaultExpanded = false,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;
  const contentRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[:]/g, '');

  const toggle = () => {
    if (disabled) return;
    const next = !isExpanded;
    if (!isControlled) setInternalExpanded(next);
    onChange?.(next);
  };

  return (
    <div style={{ border: `1px solid ${theme.colors.borderSubtle}`, borderRadius: theme.radii.md, overflow: 'hidden', fontFamily: theme.typography.body, ...style }}>
      <button
        onClick={toggle}
        disabled={disabled}
        aria-expanded={isExpanded}
        aria-controls={`accordion-panel-${uid}`}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: theme.colors.surface,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: theme.typography.size.base,
          fontWeight: theme.typography.weight.semibold,
          fontFamily: theme.typography.body,
          color: disabled ? theme.colors.textDisabled : theme.colors.ink,
          textAlign: 'left',
        }}
      >
        <span>{title}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={disabled ? theme.colors.textDisabled : theme.colors.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        id={`accordion-panel-${uid}`}
        role="region"
        style={{
          maxHeight: isExpanded ? `${contentRef.current?.scrollHeight ?? 1000}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.2s ease',
        }}
      >
        <div ref={contentRef} style={{ padding: '0 16px 16px', boxSizing: 'border-box', color: theme.colors.ink, fontSize: theme.typography.size.sm }}>
          {children}
        </div>
      </div>
    </div>
  );
};
