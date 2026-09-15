import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { AuthService } from '@/src/services/auth-service';
import { CivicAlert, NotificationService } from '@/src/services/notification-service';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export function NotificationsScreen() {
  const session = AuthService.getCurrentUser();
  const { isDarkMode } = useTheme();
  const { labels } = useLanguage();

  const [alerts, setAlerts] = useState<CivicAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'emergency' | 'services'>('all');
  const [selectedAlert, setSelectedAlert] = useState<CivicAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = async () => {
    const data = await NotificationService.getCivicAlerts(session.email || '');
    setAlerts(data);
  };

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      await fetchAlerts();
      setIsLoading(false);
    }
    load();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAlerts();
    setIsRefreshing(false);
  };

  const handleMarkAsRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const handleMarkAllAsRead = () => {
    setAlerts((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const filteredAlerts = alerts.filter((item) => {
    if (activeFilter === 'unread') return !item.isRead;
    if (activeFilter === 'emergency') return item.category === 'Emergency Alert';
    if (activeFilter === 'services') return item.category === 'Domain Update' || item.category === 'Service Status';
    return true;
  });

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'Emergency Alert':
        return 'danger';
      case 'Domain Update':
      case 'Service Status':
        return 'info';
      default:
        return 'success';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Emergency Alert':
        return 'exclamationmark.triangle.fill';
      case 'Domain Update':
      case 'Service Status':
        return 'doc.text.fill';
      default:
        return 'megaphone.fill';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Emergency Alert':
        return '#EF4444';
      case 'Domain Update':
      case 'Service Status':
        return '#0284C7';
      default:
        return '#10B981';
    }
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#176B87" />
        }
      >
        {/* Top Header Card */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
                {labels.notificationsTitle}
              </Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadgePill}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              {labels.notificationsSubtitle}
            </Text>
          </View>
        </View>

        {/* Action Controls & Filters */}
        <View style={styles.controlsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'all' && styles.filterChipActive,
                isDarkMode && activeFilter !== 'all' && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
              ]}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
                {labels.filterAll} ({alerts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'unread' && styles.filterChipActive,
                isDarkMode && activeFilter !== 'unread' && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
              ]}
              onPress={() => setActiveFilter('unread')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'unread' && styles.filterChipTextActive]}>
                {labels.filterUnread} ({unreadCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'emergency' && styles.filterChipActive,
                isDarkMode && activeFilter !== 'emergency' && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
              ]}
              onPress={() => setActiveFilter('emergency')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'emergency' && styles.filterChipTextActive]}>
                {labels.filterEmergency}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === 'services' && styles.filterChipActive,
                isDarkMode && activeFilter !== 'services' && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
              ]}
              onPress={() => setActiveFilter('services')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'services' && styles.filterChipTextActive]}>
                {labels.filterServices}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Mark All as Read Action */}
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead} activeOpacity={0.7}>
            <IconSymbol name="checkmark.seal.fill" size={14} color="#176B87" />
            <Text style={styles.markAllBtnText}>{labels.markAllRead}</Text>
          </TouchableOpacity>
        )}

        {/* Notifications Stack */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={isDarkMode ? '#38BDF8' : '#176B87'} />
            <Text style={[styles.loadingText, isDarkMode && { color: '#38BDF8' }]}>Loading notifications...</Text>
          </View>
        ) : filteredAlerts.length === 0 ? (
          <View style={[styles.emptyBox, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <View style={styles.emptyIconRing}>
              <IconSymbol name="bell.fill" size={28} color="#94A3B8" />
            </View>
            <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>{labels.noNotifications}</Text>
            <Text style={[styles.emptySub, isDarkMode && { color: '#94A3B8' }]}>{labels.noNotificationsSub}</Text>
          </View>
        ) : (
          <View style={styles.alertsStack}>
            {filteredAlerts.map((item) => {
              const categoryColor = getCategoryColor(item.category);
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.88}
                  style={[
                    styles.alertCard,
                    isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
                    !item.isRead && (isDarkMode ? { backgroundColor: '#0F2942', borderColor: '#0284C7' } : styles.unreadAlertCard),
                  ]}
                  onPress={() => {
                    handleMarkAsRead(item.id);
                    setSelectedAlert(item);
                  }}
                >
                  <View style={styles.alertHeaderRow}>
                    <View style={[styles.iconCircle, { backgroundColor: `${categoryColor}18` }]}>
                      <IconSymbol name={getCategoryIcon(item.category) as any} size={18} color={categoryColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.alertTopRow}>
                        <Badge label={item.category.toUpperCase()} variant={getCategoryBadgeVariant(item.category)} />
                        <Text style={[styles.timestampText, isDarkMode && { color: '#94A3B8' }]}>
                          {item.timestamp}
                        </Text>
                      </View>
                      <Text style={[styles.alertTitle, isDarkMode && { color: '#F8FAFC' }]}>{item.title}</Text>
                    </View>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={[styles.alertBody, isDarkMode && { color: '#CBD5E1' }]} numberOfLines={2}>
                    {item.body}
                  </Text>

                  {item.department && (
                    <View style={styles.departmentRow}>
                      <IconSymbol name="building.2.fill" size={12} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                      <Text style={[styles.departmentText, isDarkMode && { color: '#94A3B8' }]}>
                        {item.department}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Notification Detail Modal */}
      <Modal
        visible={Boolean(selectedAlert)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAlert(null)}
      >
        {selectedAlert && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
              <View style={styles.modalHeader}>
                <View style={[styles.iconCircle, { backgroundColor: `${getCategoryColor(selectedAlert.category)}20` }]}>
                  <IconSymbol
                    name={getCategoryIcon(selectedAlert.category) as any}
                    size={22}
                    color={getCategoryColor(selectedAlert.category)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Badge
                    label={selectedAlert.category.toUpperCase()}
                    variant={getCategoryBadgeVariant(selectedAlert.category)}
                  />
                  <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>{selectedAlert.title}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedAlert(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 240, marginVertical: 12 }}>
                <Text style={[styles.modalBodyText, isDarkMode && { color: '#CBD5E1' }]}>{selectedAlert.body}</Text>
              </ScrollView>

              <View style={[styles.modalMetaRow, isDarkMode && { borderTopColor: '#3A506B' }]}>
                {selectedAlert.department && (
                  <Text style={[styles.modalMetaText, isDarkMode && { color: '#94A3B8' }]}>
                    Dept: {selectedAlert.department}
                  </Text>
                )}
                <Text style={[styles.modalMetaText, isDarkMode && { color: '#94A3B8' }]}>
                  Received: {selectedAlert.timestamp}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseActionBtn}
                onPress={() => setSelectedAlert(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseActionText}>{labels.closeBtn || 'Close'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  headerRow: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  unreadBadgePill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  controlsRow: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#176B87',
    borderColor: '#176B87',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#176B87',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#176B87',
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  alertsStack: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  unreadAlertCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  alertBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    marginTop: 6,
  },
  departmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  departmentText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  modalBodyText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },
  modalMetaRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    gap: 4,
    marginBottom: 16,
  },
  modalMetaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  modalCloseActionBtn: {
    backgroundColor: '#176B87',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
