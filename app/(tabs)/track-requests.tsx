import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function TrackRequestsScreen() {
  const colors = useColors();
  const { appointments, permits, services, reports } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'appointments' | 'permits' | 'services' | 'reports'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Map all context items into a unified display model
  const allItems = [
    ...appointments.map((a) => ({
      id: a.id,
      type: 'Appointment',
      category: 'appointments',
      title: a.service,
      subtitle: a.center,
      status: a.status,
      statusType: a.statusType,
      date: `${a.date} (${a.time})`,
      nextAction: `Assigned: ${a.doctor}`,
      icon: 'calendar',
      details: a,
    })),
    ...permits.map((p) => ({
      id: p.id,
      type: 'Sanitation Permit',
      category: 'permits',
      title: p.businessName,
      subtitle: p.businessType,
      status: p.status,
      statusType: p.statusType,
      date: p.date,
      nextAction: 'Site Inspection Scheduling',
      icon: 'document-text',
      details: p,
    })),
    ...services.map((s) => ({
      id: s.id,
      type: 'Wastewater Service',
      category: 'services',
      title: s.serviceType,
      subtitle: s.address,
      status: s.status,
      statusType: s.statusType,
      date: `${s.scheduleDate} (${s.scheduleTime})`,
      nextAction: `Cost: ${s.cost}`,
      icon: 'water',
      details: s,
    })),
    ...reports.map((r) => ({
      id: r.id,
      type: 'Health Report',
      category: 'reports',
      title: r.issueType,
      subtitle: r.location,
      status: r.status,
      statusType: r.statusType,
      date: r.date,
      nextAction: `Urgency: ${r.urgency.toUpperCase()}`,
      icon: 'warning',
      details: r,
    })),
  ];

  // Filter by tab and search
  const filteredItems = allItems.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'pending':
        return colors.warning;
      case 'approved':
      case 'completed':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'pending':
        return 'time-outline';
      case 'approved':
      case 'completed':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Track Requests</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Real-time tracking for all your applications</Text>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by ID or keyword (e.g. SP-1042)..."
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.subtext} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'appointments', label: 'Appointments' },
            { key: 'permits', label: 'Permits' },
            { key: 'services', label: 'Wastewater' },
            { key: 'reports', label: 'Health Reports' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabChip,
                  { backgroundColor: isActive ? colors.primary : colors.card, borderColor: isActive ? colors.primary : colors.border },
                ]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text style={[styles.tabChipText, { color: isActive ? '#ffffff' : colors.text }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={colors.subtext} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No matching requests</Text>
            <Text style={[styles.emptySub, { color: colors.subtext }]}>Try adjusting your search query or tab filter.</Text>
          </View>
        ) : (
          filteredItems.map((req, index) => (
            <Animated.View key={req.id} entering={FadeInDown.delay(index * 60).springify()}>
              <TouchableOpacity
                style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setSelectedItem(req)}
                activeOpacity={0.75}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.requestIdRow}>
                    <Ionicons name={req.icon as any} size={20} color={colors.primary} />
                    <Text style={[styles.requestId, { color: colors.text }]}>{req.id}</Text>
                    <Text style={[styles.requestTypeTag, { color: colors.subtext }]}>• {req.type}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.statusType) + '18' }]}>
                    <Ionicons name={getStatusIcon(req.statusType)} size={14} color={getStatusColor(req.statusType)} />
                    <Text style={[styles.statusText, { color: getStatusColor(req.statusType) }]}>
                      {req.status}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.requestTitle, { color: colors.text }]}>{req.title}</Text>
                <Text style={[styles.requestSub, { color: colors.subtext }]}>{req.subtitle}</Text>
                <Text style={[styles.requestDate, { color: colors.primary }]}>{req.date}</Text>

                <View style={[styles.nextAction, { borderTopColor: colors.border }]}>
                  <Text style={[styles.nextActionLabel, { color: colors.subtext }]}>Status Detail:</Text>
                  <Text style={[styles.nextActionValue, { color: colors.text }]}>{req.nextAction}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Item Detail Modal */}
      <Modal visible={!!selectedItem} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {selectedItem && (
              <>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name={selectedItem.icon} size={24} color={colors.primary} />
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedItem.id}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedItem(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={[styles.detailCategory, { color: colors.primary }]}>{selectedItem.type.toUpperCase()}</Text>
                  <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedItem.title}</Text>
                  <Text style={[styles.detailSub, { color: colors.subtext }]}>{selectedItem.subtitle}</Text>

                  {/* Status Timeline */}
                  <View style={[styles.timelineBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.timelineHeader, { color: colors.text }]}>Progress Timeline</Text>
                    <View style={styles.timelineStep}>
                      <View style={[styles.timelineDot, styles.dotDone, { backgroundColor: colors.success }]} />
                      <View>
                        <Text style={[styles.timelineStepTitle, { color: colors.text }]}>Request Submitted</Text>
                        <Text style={[styles.timelineStepDate, { color: colors.subtext }]}>{selectedItem.date}</Text>
                      </View>
                    </View>
                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    <View style={styles.timelineStep}>
                      <View
                        style={[
                          styles.timelineDot,
                          selectedItem.statusType !== 'pending' ? { backgroundColor: colors.success } : { backgroundColor: colors.warning },
                        ]}
                      />
                      <View>
                        <Text style={[styles.timelineStepTitle, { color: colors.text }]}>Officer Review & Verification</Text>
                        <Text style={[styles.timelineStepDate, { color: colors.subtext }]}>
                          {selectedItem.statusType === 'pending' ? 'Currently In Progress' : 'Completed'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    <View style={styles.timelineStep}>
                      <View
                        style={[
                          styles.timelineDot,
                          selectedItem.statusType === 'approved' || selectedItem.statusType === 'completed'
                            ? { backgroundColor: colors.success }
                            : { backgroundColor: colors.border },
                        ]}
                      />
                      <View>
                        <Text style={[styles.timelineStepTitle, { color: colors.text }]}>Final Approval & Fulfillment</Text>
                        <Text style={[styles.timelineStepDate, { color: colors.subtext }]}>
                          {selectedItem.statusType === 'approved' || selectedItem.statusType === 'completed'
                            ? 'Approved & Ready'
                            : 'Awaiting Verification'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.closeModalBtn, { backgroundColor: colors.primary }]} onPress={() => setSelectedItem(null)}>
                    <Text style={styles.closeModalBtnText}>CLOSE DETAILS</Text>
                  </TouchableOpacity>
                </ScrollView>
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Typography.heading,
    color: '#0d4f64',
  },
  subtitle: {
    ...Typography.body,
    color: '#86B6F6',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: '#0d4f64',
  },
  tabsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  tabChip: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  tabChipActive: {
    backgroundColor: '#176B87',
    borderColor: '#176B87',
  },
  tabChipText: {
    ...Typography.small,
    fontWeight: '600',
    color: '#0d4f64',
  },
  tabChipTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  requestIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestId: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#0d4f64',
  },
  requestTypeTag: {
    ...Typography.small,
    color: '#86B6F6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '600',
  },
  requestTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  requestSub: {
    ...Typography.small,
    color: '#86B6F6',
    marginTop: 1,
  },
  requestDate: {
    ...Typography.small,
    color: '#176B87',
    marginTop: 4,
    fontWeight: '500',
  },
  nextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#EEF5FF',
  },
  nextActionLabel: {
    ...Typography.small,
    color: '#86B6F6',
  },
  nextActionValue: {
    ...Typography.small,
    fontWeight: '600',
    color: '#0d4f64',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...Typography.subheading,
    color: '#0d4f64',
    marginTop: Spacing.md,
  },
  emptySub: {
    ...Typography.small,
    color: '#86B6F6',
    marginTop: 4,
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
  },
  detailCategory: {
    ...Typography.small,
    fontWeight: '700',
    color: '#176B87',
    marginTop: Spacing.xs,
  },
  detailTitle: {
    ...Typography.heading,
    color: '#0d4f64',
    fontSize: 20,
    marginTop: 2,
  },
  detailSub: {
    ...Typography.body,
    color: '#86B6F6',
    marginTop: 2,
  },
  timelineBox: {
    backgroundColor: '#EEF5FF50',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  timelineHeader: {
    ...Typography.subheading,
    color: '#0d4f64',
    marginBottom: Spacing.md,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotDone: {
    backgroundColor: '#2ecc71',
  },
  dotActive: {
    backgroundColor: '#f39c12',
  },
  dotPending: {
    backgroundColor: '#B4D4FF',
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#B4D4FF',
    marginLeft: 5,
    marginVertical: 2,
  },
  timelineStepTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  timelineStepDate: {
    ...Typography.small,
    color: '#86B6F6',
  },
  closeModalBtn: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  closeModalBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },
});