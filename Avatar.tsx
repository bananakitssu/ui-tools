import React, { useState } from 'react';
import { useTheme } from './theme';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  
  children?: React.ReactNode;
  size?: number | 'small' | 'medium' | 'large';
  
  color?: string;
  variant?: 'circular' | 'rounded' | 'square';
}

const sizeMap = { small: 32, medium: 40, large: 56 };

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  children,
  size = 'medium',
  color,
  variant = 'circular',
  style,
  ...rest
}) => {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);
  const dimension = typeof size === 'number' ? size : sizeMap[size];
  const showImage = Boolean(src) && !imgError;

  const borderRadius = variant === 'circular' ? '50%' : variant === 'rounded' ? theme.radii.md : 0;

  
  
  const fallbackColors = [theme.colors.primary, theme.colors.accent, theme.colors.success, theme.colors.error];
  const initials = typeof children === 'string' ? children : '';
  const colorIndex = initials ? initials.charCodeAt(0) % fallbackColors.length : 0;
  const bgColor = color || fallbackColors[colorIndex];

  return (
    <div
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: showImage ? theme.colors.borderSubtle : bgColor,
        color: '#ffffff',
        fontFamily: theme.typography.display,
        fontWeight: theme.typography.weight.semibold,
        fontSize: `${Math.round(dimension * 0.4)}px`,
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        children
      )}
    </div>
  );
};
