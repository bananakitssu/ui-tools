import React from 'react';
import { useTheme } from './theme';

export interface CircularProgressProps 
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