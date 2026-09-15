import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useMemo, useState } from 'react';
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

export interface TrackRequestsScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

type RequestType = 'Sanitation Permit' | 'Wastewater Service';
type RequestStatus = 'Under Review' | 'Expired' | 'Pending Assignment';

type RequestItem = {
  id: string;
  type: RequestType;
  status: RequestStatus;
  title: string;
  location: string;
  date: string;
  detail: string;
};

const FILTERS = ['All Requests', 'Appointments', 'Permits', 'Wastewater', 'Health'] as const;

const REQUESTS: RequestItem[] = [
  { id: 'SP-1042', type: 'Sanitation Permit', status: 'Under Review', title: "Pedro's Fresh Eatery", location: 'Food Establishment (Eatery)', date: 'July 15, 2026', detail: 'Status Detail: Site Inspection Scheduling' },
  { id: 'SP-1038', type: 'Sanitation Permit', status: 'Expired', title: 'Pedro Water Refilling Station', location: 'Water Refilling Station', date: 'June 10, 2025', detail: 'Status Detail: Site Inspection Scheduling' },
  { id: 'WW-201', type: 'Wastewater Service', status: 'Pending Assignment', title: 'Septic Tank Desludging & Cleaning', location: '123 Sampaguita St, Brgy. 7', date: 'July 25, 2026 (10:00 AM - 12:00 PM)', detail: 'Status Detail: Cost: ₱1,200.00' },
];

const STATUS_CONFIG: Record<RequestStatus, { color: string; background: string; icon: keyof typeof Ionicons.glyphMap }> = {
  'Under Review': { color: '#D97706', background: '#FEF3C7', icon: 'time-outline' },
  'Pending Assignment': { color: '#CA8A04', background: '#FEF9C3', icon: 'time-outline' },
  Expired: { color: '#DC2626', background: '#FEE2E2', icon: 'alert-circle' },
};

function matchesFilter(request: RequestItem, filter: (typeof FILTERS)[number]): boolean {
  switch (filter) {
    case 'Appointments':
      return false;
    case 'Permits':
      return request.type === 'Sanitation Permit';
    case 'Wastewater':
      return request.type === 'Wastewater Service';
    case 'Health':
      return false;
    default:
      return true;
  }
}

function TrackRequestsContent({ onClose }: { onClose?: () => void }) {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('All Requests');

  const visibleRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return REQUESTS.filter((request) => {
      const matchesSearch = !query || [request.id, request.type, request.title, request.location, request.detail]
        .some((value) => value.toLowerCase().includes(query));
      return matchesFilter(request, activeFilter) && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, isDarkMode && { backgroundColor: '#1C2541' }]}>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Track Requests</Text>
            <Text style={[styles.subtitle, isDarkMode && { color: '#CBD5E1' }]}>Real-time tracking for all your applications</Text>
          </View>
          <TouchableOpacity accessibilityLabel="Close track requests" onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, isDarkMode && { backgroundColor: '#1C2541' }]}>
          <Ionicons name="search-outline" size={19} color="#64748B" />
          <TextInput
            style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by ID or keyword (e.g. SP-1042)..."
            placeholderTextColor="#64748B"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Clear request search">
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, isDarkMode && { backgroundColor: '#1C2541' }, isActive && styles.filterButtonActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isDarkMode && { color: '#CBD5E1' }, isActive && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.requestList}>
          {visibleRequests.length ? visibleRequests.map((request) => {
            const status = STATUS_CONFIG[request.status];
            return (
              <TouchableOpacity key={request.id} style={[styles.requestCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]} activeOpacity={0.85} onPress={() => console.log('Request selected:', request.id)}>
                <View style={styles.cardTopRow}>
                  <View style={styles.requestMeta}>
                    <Text style={styles.requestId}>{request.id}</Text>
                    <Text style={styles.metaSeparator}>•</Text>
                    <Text style={styles.requestType}>{request.type}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                    <Ionicons name={status.icon} size={14} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{request.status}</Text>
                  </View>
                </View>
                <Text style={[styles.requestTitle, isDarkMode && { color: '#F8FAFC' }]}>{request.title}</Text>
                <Text style={[styles.requestDetail, isDarkMode && { color: '#CBD5E1' }]}>{request.location}</Text>
                <Text style={[styles.requestDetail, isDarkMode && { color: '#CBD5E1' }]}>{request.date}</Text>
                <Text style={[styles.statusDetail, isDarkMode && { color: '#CBD5E1', borderTopColor: '#334155' }]}>{request.detail}</Text>
              </TouchableOpacity>
            );
          }) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={28} color="#94A3B8" />
              <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>No requests found</Text>
              <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>Try another search or filter.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function TrackRequestsScreen({ visible, onClose }: TrackRequestsScreenProps) {
  const { isDarkMode } = useTheme();

  if (visible === undefined) return <TrackRequestsContent onClose={onClose} />;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        {onClose ? <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} /> : null}
        <View style={[styles.sheet, isDarkMode && { backgroundColor: '#0B132B' }]}>
          <TrackRequestsContent onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 18 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  sheet: { height: '94%', overflow: 'hidden', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  headerCopy: { flex: 1 },
  title: { color: '#1E293B', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
  closeButton: { padding: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 4, paddingHorizontal: 12, height: 46, backgroundColor: '#F1F5F9', borderRadius: 10 },
  searchInput: { flex: 1, marginLeft: 8, color: '#1E293B', fontSize: 13 },
  filterContent: { gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  filterButton: { paddingHorizontal: 13, paddingVertical: 8, backgroundColor: '#F1F5F9', borderRadius: 8 },
  filterButtonActive: { backgroundColor: '#0EA5E9' },
  filterText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  requestList: { paddingHorizontal: 16 },
  requestCard: { padding: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  requestMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  requestId: { color: '#0EA5E9', fontSize: 12, fontWeight: '800' },
  metaSeparator: { color: '#94A3B8', fontSize: 12 },
  requestType: { color: '#64748B', fontSize: 11, flexShrink: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', flexShrink: 1 },
  requestTitle: { color: '#1E293B', fontSize: 15, fontWeight: '800', marginTop: 14 },
  requestDetail: { color: '#64748B', fontSize: 12, marginTop: 5 },
  statusDetail: { color: '#64748B', fontSize: 11, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { color: '#1E293B', fontSize: 15, fontWeight: '800', marginTop: 10 },
  emptyText: { color: '#64748B', fontSize: 12, marginTop: 4 },
});
