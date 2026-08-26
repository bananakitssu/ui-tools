import React from 'react';
import { useTheme } from './theme';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', width, height, style }) => {
  const theme = useTheme();
  const defaultHeight = variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '80px';
  const defaultWidth = variant === 'circular' ? '40px' : '100%';
  const borderRadius = variant === 'circular' ? '50%' : variant === 'text' ? theme.radii.sm : theme.radii.md;

  return (
    <div
      style={{
        width: width ?? defaultWidth,
        height: height ?? defaultHeight,
        borderRadius,
        backgroundColor: theme.colors.borderSubtle,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <style>{`
        @keyframes ui-skeleton-shimmer { 100% { transform: translateX(100%); } }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: 'translateX(-100%)',
          backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          animation: 'ui-skeleton-shimmer 1.6s infinite',
        }}
      />
    </div>
  );
};
