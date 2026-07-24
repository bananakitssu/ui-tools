import React from 'react';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  
  container?: boolean;
  
  span?: number;
  
  columns?: number;
  
  spacing?: number | string;
  children?: React.ReactNode;
}


export const Grid: React.FC<GridProps> = ({
  container = false,
  span,
  columns = 12,
  spacing = 16,
  style,
  children,
  ...rest
}) => {
  const gap = typeof spacing === 'number' ? `${spacing}px` : spacing;

  if (container) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        gridColumn: span ? `span ${span} / span ${span}` : undefined,
        minWidth: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
