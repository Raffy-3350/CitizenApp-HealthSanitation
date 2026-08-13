import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { AnnouncementModal } from '../../components/ui/AnnouncementModal';
import { QuickAction } from '../../components/ui/QuickAction';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Announcement, useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 56, 320);
const CARD_GAP = 12;
const CARD_INTERVAL = CARD_WIDTH + CARD_GAP;

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { userProfile, appointments, permits, services, reports, alerts, announcements, t } = useApp();

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);
  const announcementScrollRef = useRef<ScrollView>(null);

  const citizenAnnouncements = announcements.filter(
    (a) => a.targetRole === 'citizen' || a.targetRole === 'all'
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_INTERVAL);
    if (index >= 0 && index < citizenAnnouncements.length && index !== activeAnnouncementIndex) {
      setActiveAnnouncementIndex(index);
    }
  };

  const quickActions = [
    { icon: 'calendar-outline' as const, label: t('bookAppt'), route: '/(tabs)/book-appointment' },
    { icon: 'document-text-outline' as const, label: t('applyPermit'), route: '/(tabs)/apply-permit' },
    { icon: 'medkit-outline' as const, label: t('viewVaccines'), route: '/(tabs)/view-vaccines' },
    { icon: 'water-outline' as const, label: t('requestService'), route: '/(tabs)/request-service' },
    { icon: 'search-outline' as const, label: t('trackRequests'), route: '/(tabs)/track-requests' },
    { icon: 'warning-outline' as const, label: t('reportIssue'), route: '/(tabs)/report-issue' },
  ];

  const unreadAlerts = alerts.filter((a) => !a.read);
  const pendingCount =
    appointments.filter((a) => a.statusType === 'pending').length +
    permits.filter((p) => p.statusType === 'pending').length +
    services.filter((s) => s.statusType === 'pending').length +
    reports.filter((r) => r.statusType === 'pending').length;

  const handleOpenAnnouncement = (item: Announcement) => {
    setSelectedAnnouncement(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.roleBadge}>
              <Ionicons name="person-circle-outline" size={14} color="#0284C7" />
              <Text style={styles.roleBadgeText}>{t('citizenPortal')}</Text>
            </View>
            <Text style={[styles.greeting, { color: colors.text }]}>{t('goodDay')}, {userProfile.name.split(' ')[0]}! 👋</Text>
            <Text style={[styles.subGreeting, { color: colors.subtext }]}>{t('healthSanitationOffice')}</Text>
          </View>
          <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/(tabs)/alerts' as any)}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadAlerts.length > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>
        </View>

        {/* Public Announcements Carousel */}
        <View style={styles.announcementSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.announcementTitleRow}>
              <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('publicAnnouncements')}</Text>
            </View>
          </View>

          <ScrollView
            ref={announcementScrollRef}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_INTERVAL}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.announcementCarousel}
          >
            {citizenAnnouncements.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInRight.delay(index * 100).springify()}>
                <TouchableOpacity
                  style={[
                    styles.announcementCard,
                    {
                      width: CARD_WIDTH,
                      backgroundColor: colors.card,
                      borderColor: index === activeAnnouncementIndex ? colors.primary : colors.border,
                      borderWidth: index === activeAnnouncementIndex ? 1.5 : 1,
                    },
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleOpenAnnouncement(item)}
                >
                  <View style={styles.announcementTopRow}>
                    <View style={[styles.categoryTag, { backgroundColor: item.color + '18' }]}>
                      <Text style={[styles.categoryTagText, { color: item.color }]}>
                        {item.badgeText || item.category}
                      </Text>
                    </View>
                    {item.priority === 'urgent' && (
                      <View style={styles.urgentBadge}>
                        <Ionicons name="alert-circle" size={14} color="#EF4444" />
                        <Text style={styles.urgentBadgeText}>Urgent</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.announcementTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.announcementDate, { color: colors.subtext }]}>
                    📅 {item.date}
                  </Text>

                  <Text style={[styles.announcementPreview, { color: colors.subtext }]} numberOfLines={2}>
                    {item.content}
                  </Text>

                  <View style={styles.announcementFooter}>
                    <Text style={[styles.readMoreText, { color: colors.primary }]}>
                      {t('readFullAdvisory')}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Dot Pagination Indicators */}
          <View style={styles.dotsContainer}>
            {citizenAnnouncements.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setActiveAnnouncementIndex(idx);
                  announcementScrollRef.current?.scrollTo({
                    x: idx * CARD_INTERVAL,
                    animated: true,
                  });
                }}
              >
                <View
                  style={[
                    styles.dot,
                    idx === activeAnnouncementIndex
                      ? [styles.activeDot, { backgroundColor: colors.primary }]
                      : { backgroundColor: colors.border },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { count: appointments.length, label: t('appts') },
            { count: permits.length, label: t('permits') },
            { count: services.length, label: t('services') },
            { count: pendingCount, label: t('pending') },
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
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

      {/* Announcement Full Detail Modal */}
      <AnnouncementModal
        visible={modalVisible}
        announcement={selectedAnnouncement}
        onClose={() => setModalVisible(false)}
        onActionPress={(route) => {
          if (route) {
            router.push(route as any);
          }
        }}
      />
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
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C715',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  announcementSection: {
    marginTop: Spacing.md,
  },
  announcementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  advisoryCount: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  announcementCarousel: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.md,
  },
  announcementCard: {
    width: 280,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  announcementTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryTagText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EF444415',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  urgentBadgeText: {
    ...Typography.caption,
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  announcementTitle: {
    ...Typography.subheading,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  announcementDate: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  announcementPreview: {
    ...Typography.small,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  announcementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF5FF',
    paddingTop: Spacing.xs,
  },
  readMoreText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  swipeHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    height: 6,
    borderRadius: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});