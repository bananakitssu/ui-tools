import React from 'react';
import { useTheme } from './theme';

export interface Step {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  activeStep: number;
  orientation?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

export const Stepper: React.FC<StepperProps> = ({ steps, activeStep, orientation = 'horizontal', style }) => {
  const theme = useTheme();

  const circleStyle = (i: number): React.CSSProperties => {
    const isCompleted = i < activeStep;
    const isActive = i === activeStep;
    return {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: isCompleted || isActive ? theme.colors.primary : theme.colors.borderSubtle,
      color: isCompleted || isActive ? '#ffffff' : theme.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.semibold,
      flexShrink: 0,
      transition: 'background-color 0.2s ease',
    };
  };

  if (orientation === 'vertical') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', fontFamily: theme.typography.body, ...style }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={circleStyle(i)}>{i < activeStep ? '✓' : i + 1}</div>
              {i < steps.length - 1 && (
                <div style={{ width: '2px', flex: 1, minHeight: '24px', backgroundColor: i < activeStep ? theme.colors.primary : theme.colors.borderSubtle }} />
              )}
            </div>
            <div style={{ paddingBottom: '20px' }}>
              <div style={{ fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.medium, color: i <= activeStep ? theme.colors.ink : theme.colors.textMuted }}>
                {step.label}
              </div>
              {step.description && <div style={{ fontSize: theme.typography.size.xs, color: theme.colors.textMuted }}>{step.description}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', fontFamily: theme.typography.body, ...style }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={circleStyle(i)}>{i < activeStep ? '✓' : i + 1}</div>
            <div style={{ textAlign: 'center', fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.medium, color: i <= activeStep ? theme.colors.ink : theme.colors.textMuted, maxWidth: '90px' }}>
              {step.label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: '2px', marginTop: '14px', backgroundColor: i < activeStep ? theme.colors.primary : theme.colors.borderSubtle }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
