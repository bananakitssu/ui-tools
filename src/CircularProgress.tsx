import React from 'react';
import { useTheme } from './theme';

export interface CircularProgressProps {
  
  value?: number;
  
  size?: number;
  
  strokeWidth?: number;
  
  color?: string;
  
  trackColor?: string;
  style?: React.CSSProperties;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 40,
  strokeWidth = 4,
  color,
  trackColor,
  style,
}) => {
  const theme = useTheme();
  const resolvedColor = color || theme.colors.primary;
  const resolvedTrackColor = trackColor || theme.colors.primaryLight;
  const isIndeterminate = value === undefined;

  
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  
  const clampedValue = Math.min(100, Math.max(0, value ?? 0));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          
          transform: isIndeterminate ? 'none' : 'rotate(-90deg)',
          animation: isIndeterminate ? 'spin 1.2s linear infinite' : 'none',
        }}
      >
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
        />

        
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isIndeterminate ? circumference * 0.25 : strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: isIndeterminate ? 'none' : 'stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
    </div>
  );
};