import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * StandaloneTabBar — identical pill design to CustomTabBar,
 * but uses useRouter/usePathname instead of Tabs navigator props.
 * Used by department layout screens (education, health, etc.)
 * that live outside (tabs)/ but still need the nav bar.
 */

const TAB_ITEMS = [
  { route: '/(tabs)/', icon: 'house.fill', label: 'Home' },
  { route: '/(tabs)/services', icon: 'square.grid.2x2.fill', label: 'Services' },
  { route: '/(tabs)/records', icon: 'folder-open-outline', label: 'Records', isCenter: true },
  { route: '/(tabs)/tracker', icon: 'map', label: 'Maps' },
  { route: '/(tabs)/profile', icon: 'person.crop.circle.fill', label: 'Profile' },
] as const;

export function StandaloneTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();

  const activeColor = isDarkMode ? '#38BDF8' : '#176B87';
  const inactiveColor = isDarkMode ? '#64748B' : '#94A3B8';

  return (
    <View
      style={[
        styles.container,
        isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
      ]}>
      {TAB_ITEMS.map((item) => {
        const isCenter = 'isCenter' in item && item.isCenter;

        if (isCenter) {
          return (
            <TouchableOpacity
              key={item.route}
              accessibilityRole="button"
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.85}
              style={styles.centerButtonContainer}>
              <View style={[styles.centerCircle, isDarkMode && { borderColor: '#1C2541' }]}>
                <Ionicons name="folder-open-outline" size={28} color="#FFFFFF" />
              </View>
              <Text style={[styles.centerLabel, isDarkMode && { color: '#E2E8F0' }]}>Records</Text>
            </TouchableOpacity>
          );
        }

        // Consider tab active if pathname starts with the tab root
        const isActive = item.label === 'Home'
          ? pathname === '/'
          : pathname.startsWith(item.route.replace('/(tabs)', ''));

        const color = isActive ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={item.route}
            accessibilityRole="button"
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
            style={styles.tabItem}>
            <IconSymbol name={item.icon as any} size={22} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    height: 60,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    marginTop: -22,
    paddingBottom: 4,
  },
  centerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  centerLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
  },
});

