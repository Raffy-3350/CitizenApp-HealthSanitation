import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  LinearTransition,
} from 'react-native-reanimated';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import {
  Appointment,
  Permit,
  WastewaterService,
  useApp,
} from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

type RecordFilter = 'all' | 'appointments' | 'permits' | 'services' | 'vaccines' | 'reports';

export default function RecordsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { userProfile, vaccines, appointments, permits, services, reports } = useApp();

  const [activeFilter, setActiveFilter] = useState<RecordFilter>('all');
  const [hoveredFilter, setHoveredFilter] = useState<RecordFilter | null>(null);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedService, setSelectedService] = useState<WastewaterService | null>(null);

  const filterScrollViewRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});

  const filterOptions: { id: RecordFilter; label: string; count: number; icon: string; desc: string }[] = [
    { id: 'all', label: 'All Results', count: appointments.length + permits.length + services.length + vaccines.length + reports.length, icon: 'apps-outline', desc: 'Display all transactions & receipts' },
    { id: 'appointments', label: 'Appointments', count: appointments.length, icon: 'calendar-outline', desc: 'Filter confirmed clinic appointment slips' },
    { id: 'permits', label: 'Sanitation Permits', count: permits.length, icon: 'document-text-outline', desc: 'Filter issued sanitation permits & QR certificates' },
    { id: 'services', label: 'Wastewater Services', count: services.length, icon: 'water-outline', desc: 'Filter wastewater desludging receipts' },
    { id: 'vaccines', label: 'Immunization Records', count: vaccines.length, icon: 'medkit-outline', desc: 'Filter family immunization records' },
    { id: 'reports', label: 'Filed Reports', count: reports.length, icon: 'warning-outline', desc: 'Filter community health investigation cases' },
  ];

  const handleFilterSelect = (id: RecordFilter) => {
    const currentIndex = filterOptions.findIndex((f) => f.id === activeFilter);
    const nextIndex = filterOptions.findIndex((f) => f.id === id);

    if (nextIndex !== currentIndex) {
      setSlideDirection(nextIndex > currentIndex ? 'forward' : 'backward');
      setActiveFilter(id);
    }

    const layout = chipLayouts.current[id];
    if (layout && filterScrollViewRef.current) {
      filterScrollViewRef.current.scrollTo({
        x: Math.max(0, layout.x - 28),
        animated: true,
      });
    }
  };

  const enteringAnim = slideDirection === 'forward'
    ? FadeInRight.duration(280).springify()
    : FadeInLeft.duration(280).springify();

  const exitingAnim = slideDirection === 'forward'
    ? FadeOutLeft.duration(220)
    : FadeOutRight.duration(220);

  const activeOptionObj = filterOptions.find((f) => f.id === activeFilter);
  const hoveredOptionObj = filterOptions.find((f) => f.id === hoveredFilter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Ionicons name="folder-open-outline" size={14} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>RESULTS & OFFICIAL RECORDS</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Transaction Results</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Issued permits, confirmed clinic slips, service receipts & vaccine records
          </Text>
        </View>

        {/* Scrollable Sideways Filter Bar with Hover Support */}
        <View style={styles.filterBarWrapper}>
          <ScrollView
            ref={filterScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBar}
          >
            {filterOptions.map((opt) => {
              const isSelected = activeFilter === opt.id;
              const isHovered = hoveredFilter === opt.id;

              return (
                <Pressable
                  key={opt.id}
                  onLayout={(e) => {
                    chipLayouts.current[opt.id] = e.nativeEvent.layout;
                  }}
                  onHoverIn={() => setHoveredFilter(opt.id)}
                  onHoverOut={() => setHoveredFilter(null)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : isHovered
                        ? colors.primary + '22'
                        : colors.card,
                      borderColor: isSelected || isHovered ? colors.primary : colors.border,
                      transform: [{ scale: pressed ? 0.95 : isHovered ? 1.05 : 1 }],
                      elevation: isHovered ? 4 : isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleFilterSelect(opt.id)}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={16}
                    color={isSelected ? '#ffffff' : colors.primary}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#ffffff' : isHovered ? colors.primary : colors.text,
                        fontWeight: isSelected || isHovered ? '800' : '700',
                      },
                    ]}
                  >
                    {opt.label} ({opt.count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Animated Results Section */}
        <Animated.View
          key={activeFilter}
          entering={enteringAnim}
          exiting={exitingAnim}
          layout={LinearTransition.springify()}
          style={styles.recordsContainer}
        >
          {/* 1. APPOINTMENTS */}
          {(activeFilter === 'all' || activeFilter === 'appointments') &&
            appointments.map((a, idx) => (
              <Animated.View key={`appt-${a.id}`} entering={FadeInDown.delay(idx * 60).springify()}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
                        <Ionicons name="calendar" size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={[styles.cardCategory, { color: colors.primary }]}>APPOINTMENT SLIP</Text>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{a.service}</Text>
                      </View>
                    </View>
                    <StatusBadge status={a.statusType} label={a.status} />
                  </View>

                  <View style={[styles.metaGrid, { backgroundColor: colors.background }]}>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Appt ID:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]}>{a.id}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Health Center:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]} numberOfLines={1}>{a.center}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Schedule:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]}>{a.date} at {a.time}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: colors.primary }]}
                    onPress={() => setSelectedAppt(a)}
                  >
                    <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>View Appointment Pass</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}

          {/* 2. SANITATION PERMITS (WITH DEDICATED QR CONTAINER) */}
          {(activeFilter === 'all' || activeFilter === 'permits') &&
            permits.map((p, idx) => (
              <Animated.View key={`permit-${p.id}`} entering={FadeInDown.delay(idx * 60).springify()}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: '#05966918' }]}>
                        <Ionicons name="document-text" size={20} color="#059669" />
                      </View>
                      <View>
                        <Text style={[styles.cardCategory, { color: '#059669' }]}>SANITATION PERMIT</Text>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{p.businessName}</Text>
                      </View>
                    </View>
                    <StatusBadge status={p.statusType} label={p.status} />
                  </View>

                  {/* QR Code Container Box in Card */}
                  <View style={[styles.qrContainerBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.qrIconContainer}>
                      <Ionicons name="qr-code" size={44} color="#059669" />
                    </View>
                    <View style={styles.qrInfoCol}>
                      <View style={styles.verifiedTagRow}>
                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                        <Text style={styles.verifiedTagText}>OFFICIAL QR VERIFIED</Text>
                      </View>
                      <Text style={[styles.qrTokenText, { color: colors.text }]}>{p.id} • {p.businessType}</Text>
                      <Text style={[styles.qrHintText, { color: colors.subtext }]}>Scan to verify permit status with city inspectors</Text>
                    </View>
                  </View>

                  <View style={[styles.metaGrid, { backgroundColor: colors.background }]}>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Address:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]} numberOfLines={1}>{p.address}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Fee Paid:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]}>{p.fee} ({p.paymentMethod})</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: '#059669' }]}
                    onPress={() => setSelectedPermit(p)}
                  >
                    <Ionicons name="ribbon-outline" size={16} color="#059669" />
                    <Text style={[styles.actionBtnText, { color: '#059669' }]}>View Permit & QR Certificate</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}

          {/* 3. WASTEWATER SERVICES */}
          {(activeFilter === 'all' || activeFilter === 'services') &&
            services.map((s, idx) => (
              <Animated.View key={`service-${s.id}`} entering={FadeInDown.delay(idx * 60).springify()}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: '#0284C718' }]}>
                        <Ionicons name="water" size={20} color="#0284C7" />
                      </View>
                      <View>
                        <Text style={[styles.cardCategory, { color: '#0284C7' }]}>WASTEWATER SERVICE RECEIPT</Text>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{s.serviceType}</Text>
                      </View>
                    </View>
                    <StatusBadge status={s.statusType} label={s.status} />
                  </View>

                  <View style={[styles.metaGrid, { backgroundColor: colors.background }]}>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Ticket ID:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]}>{s.id}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Tank Capacity:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]}>{s.tankSize}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Cost:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]}>{s.cost}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: '#0284C7' }]}
                    onPress={() => setSelectedService(s)}
                  >
                    <Ionicons name="receipt-outline" size={16} color="#0284C7" />
                    <Text style={[styles.actionBtnText, { color: '#0284C7' }]}>View Service Receipt</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}

          {/* 4. IMMUNIZATION RECORDS */}
          {(activeFilter === 'all' || activeFilter === 'vaccines') && (
            <Animated.View entering={FadeInDown.springify()}>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: '#8B5CF618' }]}>
                      <Ionicons name="medkit" size={20} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text style={[styles.cardCategory, { color: '#8B5CF6' }]}>IMMUNIZATION RECORDS</Text>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{userProfile.name} & Family</Text>
                    </View>
                  </View>
                  <StatusBadge status="completed" label={`${vaccines.filter((v) => v.status === 'Completed').length} Recorded`} />
                </View>

                <View style={[styles.metaGrid, { backgroundColor: colors.background }]}>
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.subtext }]}>Pedro (Self):</Text>
                    <Text style={[styles.metaVal, { color: colors.text }]}>COVID-19, Flu, Tetanus</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: colors.subtext }]}>Sofia (Daughter):</Text>
                    <Text style={[styles.metaVal, { color: colors.text }]}>BCG, DPT 1st & 2nd</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: '#8B5CF6' }]}
                  onPress={() => router.push('/(tabs)/view-vaccines' as any)}
                >
                  <Ionicons name="open-outline" size={16} color="#8B5CF6" />
                  <Text style={[styles.actionBtnText, { color: '#8B5CF6' }]}>Open Vaccine Certificates Portal</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* 5. FILED HEALTH REPORTS */}
          {(activeFilter === 'all' || activeFilter === 'reports') &&
            reports.map((r, idx) => (
              <Animated.View key={`report-${r.id}`} entering={FadeInDown.delay(idx * 60).springify()}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.iconCircle, { backgroundColor: '#EF444418' }]}>
                        <Ionicons name="warning" size={20} color="#EF4444" />
                      </View>
                      <View>
                        <Text style={[styles.cardCategory, { color: '#EF4444' }]}>FILED REPORT TRACKING</Text>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{r.issueType}</Text>
                      </View>
                    </View>
                    <StatusBadge status={r.statusType} label={r.status} />
                  </View>

                  <View style={[styles.metaGrid, { backgroundColor: colors.background }]}>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Case ID:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]}>{r.id}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Urgency:</Text>
                      <Text style={[styles.metaVal, { color: r.urgency === 'urgent' ? '#EF4444' : colors.text }]}>
                        {r.urgency.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaLabel, { color: colors.subtext }]}>Location:</Text>
                      <Text style={[styles.metaVal, { color: colors.text }]} numberOfLines={1}>{r.location}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: '#EF4444' }]}
                    onPress={() => router.push('/(tabs)/track-requests' as any)}
                  >
                    <Ionicons name="search-outline" size={16} color="#EF4444" />
                    <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Track Investigation Progress</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ─── MODAL: Sanitation Permit Digital Certificate with Dedicated QR Container ─── */}
      <Modal visible={!!selectedPermit} transparent animationType="slide" onRequestClose={() => setSelectedPermit(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sanitation Permit Certificate</Text>
              <TouchableOpacity onPress={() => setSelectedPermit(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedPermit && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.certBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={styles.sealRow}>
                    <Ionicons name="ribbon" size={44} color="#059669" />
                    <Text style={styles.sealText}>CITY HEALTH OFFICE OFFICIAL PERMIT</Text>
                  </View>

                  <Text style={styles.certPermitId}>{selectedPermit.id}</Text>
                  <Text style={[styles.certBusinessName, { color: colors.text }]}>{selectedPermit.businessName}</Text>
                  <Text style={[styles.certBusinessType, { color: colors.subtext }]}>{selectedPermit.businessType}</Text>

                  {/* Dedicated Large QR Container Box */}
                  <View style={[styles.modalQrBox, { backgroundColor: colors.card, borderColor: '#059669' }]}>
                    <Ionicons name="qr-code" size={110} color="#059669" />
                    <Text style={styles.qrVerificationHash}>VERIFIED • {selectedPermit.id} • CHOS-2026</Text>
                    <Text style={[styles.qrModalHint, { color: colors.subtext }]}>
                      Present this QR code to City Health Inspection officers for digital verification
                    </Text>
                  </View>

                  <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Address:</Text>
                    <Text style={[styles.certMetaVal, { color: colors.text }]}>{selectedPermit.address}</Text>
                  </View>
                  <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Permit Status:</Text>
                    <Text style={[styles.certMetaVal, { color: '#059669', fontWeight: '800' }]}>
                      {selectedPermit.status}
                    </Text>
                  </View>
                  <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Fee Paid:</Text>
                    <Text style={[styles.certMetaVal, { color: colors.text }]}>{selectedPermit.fee} ({selectedPermit.paymentMethod})</Text>
                  </View>
                  <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Issued Date:</Text>
                    <Text style={[styles.certMetaVal, { color: colors.text }]}>{selectedPermit.date}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── MODAL: Appointment Pass ─── */}
      <Modal visible={!!selectedAppt} transparent animationType="slide" onRequestClose={() => setSelectedAppt(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Clinic Appointment Pass</Text>
              <TouchableOpacity onPress={() => setSelectedAppt(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedAppt && (
              <View style={[styles.certBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="qr-code" size={90} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 10 }} />
                <Text style={[styles.certPermitId, { color: colors.primary }]}>{selectedAppt.id}</Text>
                <Text style={[styles.certBusinessName, { color: colors.text }]}>{selectedAppt.service}</Text>

                <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Clinic:</Text>
                  <Text style={[styles.certMetaVal, { color: colors.text }]}>{selectedAppt.center}</Text>
                </View>
                <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Schedule:</Text>
                  <Text style={[styles.certMetaVal, { color: colors.text }]}>{selectedAppt.date} at {selectedAppt.time}</Text>
                </View>
                <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Doctor:</Text>
                  <Text style={[styles.certMetaVal, { color: colors.text }]}>{selectedAppt.doctor}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── MODAL: Wastewater Receipt ─── */}
      <Modal visible={!!selectedService} transparent animationType="slide" onRequestClose={() => setSelectedService(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Wastewater Service Receipt</Text>
              <TouchableOpacity onPress={() => setSelectedService(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedService && (
              <View style={[styles.certBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="receipt-outline" size={48} color="#0284C7" style={{ alignSelf: 'center', marginBottom: 6 }} />
                <Text style={[styles.certPermitId, { color: '#0284C7' }]}>{selectedService.id}</Text>
                <Text style={[styles.certBusinessName, { color: colors.text }]}>{selectedService.serviceType}</Text>

                <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Location:</Text>
                  <Text style={[styles.certMetaVal, { color: colors.text }]}>{selectedService.address}</Text>
                </View>
                <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Tank Capacity:</Text>
                  <Text style={[styles.certMetaVal, { color: colors.text }]}>{selectedService.tankSize}</Text>
                </View>
                <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Amount Paid:</Text>
                  <Text style={[styles.certMetaVal, { fontWeight: '800', color: colors.text }]}>{selectedService.cost}</Text>
                </View>
                <View style={[styles.certMetaRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.certMetaLabel, { color: colors.subtext }]}>Status:</Text>
                  <Text style={[styles.certMetaVal, { color: '#0284C7', fontWeight: '800' }]}>{selectedService.status}</Text>
                </View>
              </View>
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
    paddingBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#176B8718',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    ...Typography.heading,
    fontSize: 24,
    color: '#0d4f64',
    lineHeight: 30,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  filterBarWrapper: {
    marginVertical: 10,
  },
  filterBar: {
    paddingHorizontal: Spacing.md,
    paddingRight: 32,
    paddingVertical: 6,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chipText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 13.5,
  },
  recordsContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCategory: {
    ...Typography.caption,
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardTitle: {
    ...Typography.subheading,
    fontSize: 16.5,
    fontWeight: '700',
    lineHeight: 22,
  },
  qrContainerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  qrIconContainer: {
    padding: 8,
    backgroundColor: '#05966914',
    borderRadius: 10,
  },
  qrInfoCol: {
    flex: 1,
  },
  verifiedTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  verifiedTagText: {
    ...Typography.caption,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  qrTokenText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 13.5,
    lineHeight: 19,
  },
  qrHintText: {
    ...Typography.small,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  metaGrid: {
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaLabel: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  metaVal: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    textAlign: 'right',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
  },
  actionBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 79, 100, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.heading,
    fontSize: 18,
  },
  certBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sealRow: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sealText: {
    ...Typography.caption,
    fontWeight: '800',
    fontSize: 11,
    color: '#059669',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  certPermitId: {
    ...Typography.subheading,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 20,
    color: '#059669',
    marginBottom: 4,
  },
  certBusinessName: {
    ...Typography.subheading,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  certBusinessType: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalQrBox: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginVertical: Spacing.md,
  },
  qrVerificationHash: {
    ...Typography.caption,
    fontWeight: '800',
    color: '#059669',
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  qrModalHint: {
    ...Typography.small,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
  },
  certMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  certMetaLabel: {
    ...Typography.caption,
  },
  certMetaVal: {
    ...Typography.caption,
    fontWeight: '600',
  },
});