import { HeaderBar } from '@/src/components/common/HeaderBar';
import { CustomTabBar } from '@/src/components/navigation/CustomTabBar';
import { useLanguage } from '@/src/context/LanguageContext';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const router = useRouter();
  const { labels } = useLanguage();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        header: () => (
          <HeaderBar
            subtitle="Caloocan Government Services"
            onNotificationPress={() => router.push('/(tabs)/notifications')}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: labels.tabHome,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: labels.tabServices,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: labels.tabRecords,
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: labels.tabMaps,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: labels.tabProfile,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Health Map',
          href: null, // hidden from tab bar — navigate via router.push('/(tabs)/alerts')
        }}
      />
    </Tabs>
  );
}
