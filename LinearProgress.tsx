import React from 'react';
import { useTheme } from './theme';

export interface LinearProgressProps value?: number;
  color?: string;
  trackColor?: string;
  style?: React.CSSProperties;


export const LinearProgress: React.FC<LinearProgressProps> = ({ value, color, trackColor, style }) => {
  const theme = useTheme();
  const resolvedColor = color || theme.colors.primary;
  const resolvedTrack = trackColor || theme.colors.primaryLight;
  const isIndeterminate = value === undefined;

  return (
    <div
      style={{
        position: 'relative',
        height: '4px',
        width: '100%',
        borderRadius: '2px',
        backgroundColor: resolvedTrack,
        overflow: 'hidden',
        ...style,
      }}
    >
      <style>{`
        @keyframes ui-linear-indeterminate {
          0% { left: -40%; width: 40%; }
          60% { left: 100%; width: 40%; }
          100% { left: 100%; width: 40%; }
        }
      `}</style>
      {isIndeterminate ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            backgroundColor: resolvedColor,
            borderRadius: '2px',
            animation: 'ui-linear-indeterminate 1.4s ease-in-out infinite',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: `${Math.min(Math.max(value, 0), 100)}%`,
            backgroundColor: resolvedColor,
            borderRadius: '2px',
            transition: 'width 0.2s ease',
          }}
        />
      )}
    </div>
  );
};
