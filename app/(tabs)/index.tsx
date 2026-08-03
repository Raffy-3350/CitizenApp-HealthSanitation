import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { QuickAction } from '../../components/ui/QuickAction';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { userProfile, appointments, permits, services, reports, alerts } = useApp();

  const quickActions = [
    { icon: 'calendar-outline' as const, label: 'Book Appt', route: '/(tabs)/book-appointment' },
    { icon: 'document-text-outline' as const, label: 'Apply Permit', route: '/(tabs)/apply-permit' },
    { icon: 'medkit-outline' as const, label: 'View Vaccines', route: '/(tabs)/view-vaccines' },
    { icon: 'water-outline' as const, label: 'Request Service', route: '/(tabs)/request-service' },
    { icon: 'search-outline' as const, label: 'Track Requests', route: '/(tabs)/track-requests' },
    { icon: 'warning-outline' as const, label: 'Report Issue', route: '/(tabs)/report-issue' },
  ];

  const unreadAlerts = alerts.filter((a) => !a.read);
  const pendingCount =
    appointments.filter((a) => a.statusType === 'pending').length +
    permits.filter((p) => p.statusType === 'pending').length +
    services.filter((s) => s.statusType === 'pending').length +
    reports.filter((r) => r.statusType === 'pending').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Good Day, {userProfile.name.split(' ')[0]}! 👋</Text>
            <Text style={[styles.subGreeting, { color: colors.subtext }]}>Health & Sanitation Portal</Text>
          </View>
          <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/(tabs)/alerts' as any)}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadAlerts.length > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { count: appointments.length, label: 'Appts' },
            { count: permits.length, label: 'Permits' },
            { count: services.length, label: 'Services' },
            { count: pendingCount, label: 'Pending' },
          ].map((stat, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => router.push('/(tabs)/track-requests' as any)}
            >
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stat.count}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Alerts</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/alerts' as any)}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All ({alerts.length})</Text>
            </TouchableOpacity>
          </View>
          {alerts.slice(0, 3).map((alert, index) => (
            <Animated.View key={alert.id} entering={FadeInDown.delay(index * 80).springify()}>
              <TouchableOpacity
                style={[styles.alertCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => router.push('/(tabs)/alerts' as any)}
              >
                <View style={[styles.alertIcon, { backgroundColor: alert.color + '20' }]}>
                  <Ionicons name={alert.icon as any} size={20} color={alert.color} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertType, { color: colors.text }]}>{alert.type}</Text>
                  <Text style={[styles.alertMessage, { color: colors.subtext }]} numberOfLines={1}>{alert.message}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                icon={action.icon}
                label={action.label}
                onPress={() => router.push(action.route as any)}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    ...Typography.heading,
    color: '#0d4f64',
  },
  subGreeting: {
    ...Typography.body,
    color: '#86B6F6',
    marginTop: 2,
  },
  notifButton: {
    padding: Spacing.sm,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    ...Typography.heading,
    color: '#176B87',
    fontSize: 20,
  },
  statLabel: {
    ...Typography.caption,
    color: '#86B6F6',
    marginTop: 2,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: '#0d4f64',
  },
  viewAllText: {
    ...Typography.small,
    color: '#176B87',
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    ...Typography.caption,
    fontWeight: '600',
    color: '#0d4f64',
  },
  alertMessage: {
    ...Typography.small,
    color: '#86B6F6',
    marginTop: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});