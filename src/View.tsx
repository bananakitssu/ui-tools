import React from 'react';

export type ViewDirection = 'row' | 'column';
export type ViewAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type ViewJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

export interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  direction?: ViewDirection;
  align?: ViewAlign;
  justify?: ViewJustify;
  wrap?: boolean;
  
  gap?: string | number;
  flex?: string | number;
  children?: React.ReactNode;
}

const alignMap: Record<ViewAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const justifyMap: Record<ViewJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};


export const View: React.FC<ViewProps> = ({
  as: Tag = 'div',
  direction = 'column',
  align,
  justify,
  wrap = false,
  gap,
  flex,
  style,
  children,
  ...rest
}) => {
  return (
    <Tag
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align ? alignMap[align] : undefined,
        justifyContent: justify ? justifyMap[justify] : undefined,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        flex,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};
