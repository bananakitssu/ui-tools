import React from 'react';
import { useTheme } from './theme';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  children?: React.ReactNode;
  disablePadding?: boolean;
}

export const List: React.FC<ListProps> = ({ children, disablePadding = false, style, ...rest }) => {
  const theme = useTheme();
  return (
    <ul
      style={{ listStyle: 'none', margin: 0, padding: disablePadding ? 0 : '8px 0', fontFamily: theme.typography.body, ...style }}
      {...rest}
    >
      {children}
    </ul>
  );
};
