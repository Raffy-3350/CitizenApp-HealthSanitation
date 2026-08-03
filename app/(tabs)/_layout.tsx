import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function TabLayout() {
  const colors = useColors();
  const { alerts } = useApp();

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden screens (accessed via navigation) */}
      <Tabs.Screen
        name="book-appointment"
        options={{
          title: 'Book Appointment',
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="apply-permit"
        options={{
          title: 'Apply Sanitation Permit',
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="view-vaccines"
        options={{
          title: 'Immunization Records',
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="request-service"
        options={{
          title: 'Request Wastewater Service',
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="track-requests"
        options={{
          title: 'Track Requests',
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="report-issue"
        options={{
          title: 'Report Health Issue',
          href: null,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}