import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { AlertItem, useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AlertsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { alerts, markAlertRead, markAllAlertsRead } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'health'>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const filteredAlerts = alerts.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'health') return item.type.toLowerCase().includes('health') || item.type.toLowerCase().includes('dengue');
    return true;
  });

  const changeFilter = (filter: 'all' | 'unread' | 'health') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveFilter(filter);
  };

  const handleMarkAllRead = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    markAllAlertsRead();
  };

  const handleAlertPress = (alertItem: AlertItem) => {
    markAlertRead(alertItem.id);
    setSelectedAlert(alertItem);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Alerts & Notifications</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Health notices & request status updates</Text>
        </View>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: `All (${alerts.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'health', label: 'Health Notices' },
        ].map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.chip,
                { backgroundColor: isActive ? colors.primary : colors.card, borderColor: isActive ? colors.primary : colors.border },
              ]}
              onPress={() => changeFilter(filter.key as any)}
            >
              <Text style={[styles.chipText, { color: isActive ? '#ffffff' : colors.text }]}>{filter.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No alerts in this category</Text>
          </View>
        ) : (
          filteredAlerts.map((alert, index) => (
            <Animated.View key={alert.id} entering={FadeInDown.delay(index * 60).springify()}>
              <TouchableOpacity
                style={[
                  styles.alertCard,
                  { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                  !alert.read && { borderLeftWidth: 4, borderLeftColor: colors.primary },
                ]}
                onPress={() => handleAlertPress(alert)}
                activeOpacity={0.75}
              >
                <View style={[styles.alertIcon, { backgroundColor: alert.color + '20' }]}>
                  <Ionicons name={alert.icon as any} size={22} color={alert.color} />
                </View>
                <View style={styles.alertContent}>
                  <View style={styles.alertTop}>
                    <Text style={[styles.alertType, { color: colors.text }]}>{alert.type}</Text>
                    <Text style={[styles.alertTime, { color: colors.subtext }]}>{alert.time}</Text>
                  </View>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
                  <Text style={[styles.alertMessage, { color: colors.subtext }]} numberOfLines={2}>
                    {alert.message}
                  </Text>
                </View>
                {!alert.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

        {unreadCount > 0 && (
          <TouchableOpacity style={[styles.markAllButton, { backgroundColor: colors.primaryLight }]} onPress={handleMarkAllRead}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Alert Detail Modal */}
      <Modal visible={!!selectedAlert} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedAlert && (
              <>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.alertIcon, { backgroundColor: selectedAlert.color + '20' }]}>
                      <Ionicons name={selectedAlert.icon as any} size={22} color={selectedAlert.color} />
                    </View>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedAlert.type}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedAlert(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedAlert.title}</Text>
                <Text style={[styles.detailTime, { color: colors.subtext }]}>{selectedAlert.time}</Text>

                <View style={[styles.detailMessageBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.detailMessageText, { color: colors.text }]}>{selectedAlert.message}</Text>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setSelectedAlert(null);
                      router.push('/(tabs)/track-requests' as any);
                    }}
                  >
                    <Text style={styles.modalActionBtnText}>Track Requests</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: colors.subtext }]}
                    onPress={() => setSelectedAlert(null)}
                  >
                    <Text style={styles.modalActionBtnText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Typography.heading,
    color: '#0d4f64',
  },
  subtitle: {
    ...Typography.small,
    color: '#86B6F6',
  },
  unreadBadge: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  unreadText: {
    ...Typography.small,
    color: '#ffffff',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  chipActive: {
    backgroundColor: '#176B87',
    borderColor: '#176B87',
  },
  chipText: {
    ...Typography.small,
    color: '#0d4f64',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  alertUnread: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 3,
    borderLeftColor: '#176B87',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertType: {
    ...Typography.caption,
    fontWeight: '600',
    color: '#0d4f64',
  },
  alertTime: {
    ...Typography.small,
    color: '#86B6F6',
  },
  alertTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
    marginTop: 2,
  },
  alertMessage: {
    ...Typography.small,
    color: '#86B6F6',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#176B87',
    marginLeft: Spacing.sm,
    marginTop: 4,
  },
  markAllButton: {
    backgroundColor: '#B4D4FF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  markAllText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    ...Typography.body,
    color: '#86B6F6',
    marginTop: Spacing.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 79, 100, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    ...Typography.heading,
    color: '#0d4f64',
    fontSize: 18,
  },
  detailTitle: {
    ...Typography.heading,
    color: '#0d4f64',
    fontSize: 18,
    marginTop: Spacing.xs,
  },
  detailTime: {
    ...Typography.small,
    color: '#86B6F6',
    marginBottom: Spacing.md,
  },
  detailMessageBox: {
    backgroundColor: '#EEF5FF50',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  detailMessageText: {
    ...Typography.body,
    color: '#0d4f64',
    lineHeight: 22,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  modalActionBtn: {
    flex: 1,
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalActionBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },
});