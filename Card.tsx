import React from 'react';
import { Paper, type PaperElevation } from './Paper';
import { Typography } from './Typography';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  elevation?: 'flat' | 'card' | 'modal';
  variant?: 'elevation' | 'outlined';
  children?: React.ReactNode;
}

const elevationMap: Record<'flat' | 'card' | 'modal', PaperElevation> = {
  flat: 0,
  card: 2,
  modal: 4,
};

export const Card: React.FC<CardProps> = ({
  title,
  elevation = 'card',
  variant = 'elevation',
  style,
  children,
  ...rest
}) => {
  return (
    <Paper elevation={elevationMap[elevation]} variant={variant} style={{ padding: '20px', ...style }} {...rest}>
      {title && (
        <Typography variant="h4" style={{ marginBottom: children ? '12px' : 0 }}>
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
};
