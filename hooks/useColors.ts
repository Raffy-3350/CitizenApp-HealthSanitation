import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export function useColors() {
  const systemScheme = useRNColorScheme();
  try {
    const { themeMode } = useApp();
    if (themeMode === 'light') return Colors.light;
    if (themeMode === 'dark') return Colors.dark;
  } catch (e) {
    // Fallback if rendered outside AppProvider
  }
  const resolved = systemScheme === 'dark' ? 'dark' : 'light';
  return Colors[resolved];
}

export function useResolvedColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme();
  try {
    const { themeMode } = useApp();
    if (themeMode === 'light') return 'light';
    if (themeMode === 'dark') return 'dark';
  } catch (e) {
    // Fallback
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}
