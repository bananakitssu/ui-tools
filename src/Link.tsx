import { useState, useEffect } from 'react';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  style,
  onClick,
  ...rest
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    window.location.href = href ?? "";
  };
  
  return (
    <a onClick={(e) => {
      handleClick(e);
    }} href={href ?? ""} style={{ ...style }} {...rest}>
      {children}
    </a>
  )
}