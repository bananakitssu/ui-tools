import React, { useState, useEffect } from "react";
import { useTheme, type Theme } from "./theme";

interface PerformanceNavigationTiming extends PerformanceEntry {
  type: "navigate" | "reload" | "back_forward" | "prerender";
  entryType: "navigation";
}

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bgcolor?: "primary" | "secondary" | string;
}

const bgKeyMap: Record<string, keyof Theme['colors']> = {
  primary: 'primary',
  secondary: 'accent',
  surface: 'surface',
  surfaceSunken: 'surfaceSunken',
};

export const TopLoader: React.FC<LoaderProps> = ({
  bgcolor = "primary",
  style,
  ...rest
}) => {
  const theme = useTheme();
  const [progress, setProgress] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);

  const bgKey = bgcolor && bgKeyMap[bgcolor];
  const bgValue = bgKey ? theme.colors[bgKey] : bgcolor;

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navType = navigationEntries[0]?.type;
    
    const wasLoading = sessionStorage.getItem("is_navigating");

    if (wasLoading === "true" && navType === "navigate") {
      setVisible(true);
      setProgress(90);
      
      sessionStorage.removeItem("is_navigating");

      const endTimeout = setTimeout(() => {
        setProgress(100);
        const hideTimeout = setTimeout(() => setVisible(false), 250);
        return () => clearTimeout(hideTimeout);
      }, 50);

      return () => clearTimeout(endTimeout);
    } else {
      sessionStorage.removeItem("is_navigating");
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (
        link &&
        link.href &&
        !link.target &&
        !link.href.startsWith("#") &&
        link.origin === window.location.origin &&
        link.href !== window.location.href
      ) {
        if (intervalId) clearInterval(intervalId);

        sessionStorage.setItem("is_navigating", "true");
        
        setVisible(true);
        setProgress(15);

        intervalId = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              if (intervalId) clearInterval(intervalId);
              return 85;
            }
            const increment = prev < 50 ? 12 : prev < 70 ? 4 : 0.8;
            return prev + increment;
          });
        }, 120);
      }
    };

    document.addEventListener("click", handleLinkClick);

    return () => {
      document.removeEventListener("click", handleLinkClick);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: "3px",
        backgroundColor: bgValue ?? "#00fff2",
        zIndex: 99999,
        transition: "width 0.2s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.3s ease",
        pointerEvents: "none",
        ...style
      }}
      {...rest}
    />
  );
}
