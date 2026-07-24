import React from 'react';
import { useTheme, type Theme } from './theme';

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  p?: keyof Theme['spacing'];
  bgcolor?: 'primary' | 'secondary' | 'surface' | 'surfaceSunken' | string;
  children?: React.ReactNode;
}

const bgKeyMap: Record<string, keyof Theme['colors']> = {
  primary: 'primary',
  secondary: 'accent',
  surface: 'surface',
  surfaceSunken: 'surfaceSunken',
};

export const Box: React.FC<BoxProps> = ({
  as: Tag = 'div',
  p,
  bgcolor,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const paddingValue = p ? theme.spacing[p] : undefined;
  const bgKey = bgcolor && bgKeyMap[bgcolor];
  const bgValue = bgKey ? theme.colors[bgKey] : bgcolor;

  const combinedStyles: React.CSSProperties = {
    padding: paddingValue,
    backgroundColor: bgValue,
    ...style,
  };

  return (
    <Tag style={combinedStyles} {...rest}>
      {children}
    </Tag>
  );
};
