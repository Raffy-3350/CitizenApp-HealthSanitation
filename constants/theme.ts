import { TextStyle } from 'react-native';

// ─── Spacing ───────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// ─── Border Radius ─────────────────────────────────────────────────────────
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

// ─── Typography ────────────────────────────────────────────────────────────
export const Typography: Record<string, TextStyle> = {
  heading: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  small: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
};

// ─── Colors ────────────────────────────────────────────────────────────────
export const Colors = {
  light: {
    primary: '#176B87',
    primaryLight: '#B4D4FF',
    primaryMuted: '#0284C7',
    background: '#EEF5FF',
    card: '#ffffff',
    text: '#0d4f64',
    subtext: '#475569',
    inputBg: '#ffffff',
    border: '#CBD5E1',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0284C7',
  },
  dark: {
    primary: '#38BDF8',
    primaryLight: '#1e3a5f',
    primaryMuted: '#38BDF8',
    background: '#0d1b2a',
    card: '#1a2d40',
    text: '#EEF5FF',
    subtext: '#94A3B8',
    inputBg: '#112233',
    border: '#2a4a5e',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#38BDF8',
  },
} as const;
