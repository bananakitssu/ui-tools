import React, { createContext, useContext, useMemo } from 'react';

export const defaultTheme = {
  colors: {
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    primaryActive: '#3730A3',
    primaryLight: '#EEF0FF',
    primaryBorder: '#C7C2F5',

    accent: '#F59E0B',
    accentLight: '#FEF3E2',

    success: '#1F8A4C',
    successLight: '#E3F3E9',

    error: '#E5484D',
    errorLight: 'rgba(229, 72, 77, 0.14)',

    ink: '#18181B',
    textMuted: '#6E6D7A',
    textDisabled: '#A5A3B3',

    border: '#D9D7E3',
    borderSubtle: '#EAE9EE',

    surface: '#FFFFFF',
    surfaceSunken: '#FAFAFA',

    focusRing: 'rgba(79, 70, 229, 0.28)',
    focusRingSoft: 'rgba(79, 70, 229, 0.16)',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  radii: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '8px',
    pill: '999px',
  },

  shadow: {
    sm: '0px 2px 1px -1px rgba(0,0,0,0.08), 0px 1px 1px 0px rgba(0,0,0,0.06), 0px 1px 3px 0px rgba(0,0,0,0.05)',
    card: '0px 1px 1px -1px rgba(0,0,0,0.06), 0px 1px 1px 0px rgba(0,0,0,0.05), 0px 1px 3px 0px rgba(0,0,0,0.06)',
    modal: '0px 11px 15px -7px rgba(0,0,0,0.10), 0px 24px 38px 3px rgba(0,0,0,0.08), 0px 9px 46px 8px rgba(0,0,0,0.07)',
    dropdown: '0px 5px 5px -3px rgba(0,0,0,0.08), 0px 8px 10px 1px rgba(0,0,0,0.06), 0px 3px 14px 2px rgba(0,0,0,0.05)',
    toast: '0px 3px 5px -1px rgba(0,0,0,0.10), 0px 6px 10px 0px rgba(0,0,0,0.07), 0px 1px 18px 0px rgba(0,0,0,0.06)',
  },

  typography: {
    display: "'Sora', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    size: {
      xs: '12px',
      sm: '13px',
      base: '15px',
      md: '16px',
      lg: '17px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
} as const;

export type Theme = typeof defaultTheme;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

const ThemeContext = createContext<Theme>(defaultTheme);

function deepMerge<T extends object>(base: T, overrides: DeepPartial<T> | undefined): T {
  if (!overrides) return base;
  const result: any = { ...base };
  for (const key in overrides) {
    const value = (overrides as any)[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge((base as any)[key] ?? {}, value);
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export interface ThemeProviderProps {
  theme?: DeepPartial<Theme>;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  const merged = useMemo(() => deepMerge(defaultTheme, theme), [theme]);
  return <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => useContext(ThemeContext);
