import React from 'react';
import { useTheme } from './theme';

export type TypographyVariant =
  | 'h1' | 'h2' | 'h3' | 'h4'
  | 'body1' | 'body2'
  | 'caption' | 'overline';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

const variantConfig: Record<
  TypographyVariant,
  { tag: React.ElementType; font: 'display' | 'body'; size: string; weight: number; lineHeight: number; letterSpacing?: string; textTransform?: React.CSSProperties['textTransform']; defaultColor: 'ink' | 'textMuted' }
> = {
  h1: { tag: 'h1', font: 'display', size: '3xl', weight: 700, lineHeight: 1.15, letterSpacing: '-0.01em', defaultColor: 'ink' },
  h2: { tag: 'h2', font: 'display', size: '2xl', weight: 700, lineHeight: 1.2, letterSpacing: '-0.01em', defaultColor: 'ink' },
  h3: { tag: 'h3', font: 'display', size: 'xl', weight: 700, lineHeight: 1.3, defaultColor: 'ink' },
  h4: { tag: 'h4', font: 'display', size: 'lg', weight: 700, lineHeight: 1.35, defaultColor: 'ink' },
  body1: { tag: 'p', font: 'body', size: 'base', weight: 400, lineHeight: 1.6, defaultColor: 'ink' },
  body2: { tag: 'p', font: 'body', size: 'sm', weight: 400, lineHeight: 1.55, defaultColor: 'textMuted' },
  caption: { tag: 'span', font: 'body', size: 'xs', weight: 400, lineHeight: 1.4, defaultColor: 'textMuted' },
  overline: { tag: 'span', font: 'display', size: 'xs', weight: 700, lineHeight: 1.4, letterSpacing: '0.08em', textTransform: 'uppercase', defaultColor: 'ink' },
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  as,
  color,
  align,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const config = variantConfig[variant];
  const Tag = as || config.tag;
  const resolvedColor = color || theme.colors[config.defaultColor];

  return (
    <Tag
      style={{
        margin: 0,
        fontFamily: config.font === 'display' ? theme.typography.display : theme.typography.body,
        fontSize: theme.typography.size[config.size as keyof typeof theme.typography.size],
        fontWeight: config.weight,
        lineHeight: config.lineHeight,
        letterSpacing: config.letterSpacing,
        textTransform: config.textTransform,
        color: resolvedColor,
        textAlign: align,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};
