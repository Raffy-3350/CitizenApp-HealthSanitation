import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const FILTERS = [
  'All Results (15)',
  'Appointments (2)',
  'Sanitation Permits (2)',
  'Wastewater Services (2)',
  'Immunization Records (7)',
  'Filed Reports (2)',
];

type TransactionIcon = keyof typeof Ionicons.glyphMap;

interface Transaction {
  id: string;
  category: string;
  title: string;
  status: string;
  statusColor: string;
  qrId: string;
  description: string;
  address: string;
  fee: string;
  color: string;
  icon: TransactionIcon;
  actionLabel: string;
  certificateTitle: string;
  certificateLabel: string;
  certificateSubject: string;
  certificateType: string;
  certificateHint: string;
  certificateStatusLabel: string;
  certificateDateLabel: string;
  certificateDate: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-78210',
    category: 'SANITATION PERMIT',
    title: 'Barangay Sanitary Permit',
    status: 'Under Review',
    statusColor: '#D97706',
    qrId: 'QR-8031-94',
    description: 'Application submitted for food stall renewal',
    address: 'Unit 12, Caloocan Market Stall',
    fee: '₱1,200.00',
    color: '#3B82F6',
    icon: 'document-text-outline',
    actionLabel: 'View Permit Certificate',
    certificateTitle: 'Sanitation Permit Certificate',
    certificateLabel: 'CITY HEALTH OFFICE OFFICIAL PERMIT',
    certificateSubject: "Pedro's Fresh Eatery",
    certificateType: 'Food Establishment (Eatery)',
    certificateHint: 'Present this QR code to City Health Inspection officers for digital verification',
    certificateStatusLabel: 'Permit Status',
    certificateDateLabel: 'Issued Date',
    certificateDate: 'July 15, 2026',
  },
  {
    id: 'TXN-78211',
    category: 'APPOINTMENT',
    title: 'Health Consultation',
    status: 'Verified',
    statusColor: '#059669',
    qrId: 'QR-8032-17',
    description: 'Medical consultation approved by health center',
    address: 'Barangay 171 Health Center',
    fee: '₱0.00',
    color: '#10B981',
    icon: 'calendar-outline',
    actionLabel: 'View Appointment Details',
    certificateTitle: 'Health Appointment Record',
    certificateLabel: 'CITY HEALTH OFFICE APPOINTMENT',
    certificateSubject: 'Health Consultation',
    certificateType: 'Barangay 171 Health Center',
    certificateHint: 'Present this appointment QR code when checking in at the health center',
    certificateStatusLabel: 'Appointment Status',
    certificateDateLabel: 'Location',
    certificateDate: 'Barangay 171 Health Center',
  },
  {
    id: 'TXN-78212',
    category: 'WASTEWATER SERVICE',
    title: 'Sewer Line Inspection',
    status: 'Verified',
    statusColor: '#059669',
    qrId: 'QR-8033-58',
    description: 'Inspection passed and service scheduled',
    address: '202 P. Dela Cruz St.',
    fee: '₱980.00',
    color: '#8B5CF6',
    icon: 'water-outline',
    actionLabel: 'View Service Receipt',
    certificateTitle: 'Wastewater Service Receipt',
    certificateLabel: 'CITY SANITATION SERVICE RECORD',
    certificateSubject: 'Sewer Line Inspection',
    certificateType: 'Wastewater Service',
    certificateHint: 'Present this QR code to the sanitation service team for verification',
    certificateStatusLabel: 'Service Status',
    certificateDateLabel: 'Service Address',
    certificateDate: '202 P. Dela Cruz St.',
  },
  {
    id: 'TXN-78213',
    category: 'IMMUNIZATION RECORD',
    title: 'Child Vaccination Record',
    status: 'Expired',
    statusColor: '#D97706',
    qrId: 'QR-8034-66',
    description: 'Vaccination certificate needs renewal',
    address: 'Caloocan Health Unit 3',
    fee: '₱0.00',
    color: '#F59E0B',
    icon: 'medkit-outline',
    actionLabel: 'View Immunization Record',
    certificateTitle: 'Immunization Record',
    certificateLabel: 'CITY HEALTH OFFICE VACCINE RECORD',
    certificateSubject: 'Child Vaccination Record',
    certificateType: 'Caloocan Health Unit 3',
    certificateHint: 'Present this QR code to the health unit to verify the immunization record',
    certificateStatusLabel: 'Record Status',
    certificateDateLabel: 'Health Unit',
    certificateDate: 'Caloocan Health Unit 3',
  },
  {
    id: 'TXN-78214',
    category: 'FILED REPORT',
    title: 'Drainage Complaint Report',
    status: 'Under Review',
    statusColor: '#D97706',
    qrId: 'QR-8035-81',
    description: 'Submitted to public works and sanitation team',
    address: 'R. Mapa Avenue, Zone 8',
    fee: '₱0.00',
    color: '#EF4444',
    icon: 'flag-outline',
    actionLabel: 'View Filed Report',
    certificateTitle: 'Filed Report Details',
    certificateLabel: 'CIVENTRAL COMMUNITY REPORT',
    certificateSubject: 'Drainage Complaint Report',
    certificateType: 'Public Works and Sanitation Team',
    certificateHint: 'Present this QR code when following up with the assigned response team',
    certificateStatusLabel: 'Report Status',
    certificateDateLabel: 'Report Location',
    certificateDate: 'R. Mapa Avenue, Zone 8',
  },
  {
    id: 'TXN-78215',
    category: 'SANITATION PERMIT',
    title: 'Food Stall Permit',
    status: 'Verified',
    statusColor: '#059669',
    qrId: 'QR-8036-92',
    description: 'Permit validated and QR certificate issued',
    address: 'Caloocan Public Market',
    fee: '₱1,500.00',
    color: '#2563EB',
    icon: 'document-text-outline',
    actionLabel: 'View Permit Certificate',
    certificateTitle: 'Sanitation Permit Certificate',
    certificateLabel: 'CITY HEALTH OFFICE OFFICIAL PERMIT',
    certificateSubject: 'Food Stall Permit',
    certificateType: 'Caloocan Public Market',
    certificateHint: 'Present this QR code to City Health Inspection officers for digital verification',
    certificateStatusLabel: 'Permit Status',
    certificateDateLabel: 'Issued Date',
    certificateDate: 'July 20, 2026',
  },
];

export default function RecordsScreen() {
  const { isDarkMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const visibleTransactions = useMemo(() => {
    if (activeFilter === 'All Results (15)') {
      return TRANSACTIONS;
    }

    const label = activeFilter.split(' (')[0];
    return TRANSACTIONS.filter((transaction) => transaction.category === label.toUpperCase());
  }, [activeFilter]);

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Transaction Results</Text>
        <Text style={[styles.subtitle, isDarkMode && { color: '#CBD5E1' }]}>Issued permits, confirmed clinic slips, service receipts & vaccine records</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(filter)}
                style={[styles.filterPill, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isDarkMode && { color: '#CBD5E1' }, isActive && styles.filterPillTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {visibleTransactions.map((transaction) => (
          <View key={transaction.id} style={[styles.card, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${transaction.color}22` },
                  ]}
                >
                  <Ionicons name={transaction.icon} size={22} color={transaction.color} />
                </View>

                <View style={styles.titleWrap}>
                  <Text style={[styles.categoryText, { color: transaction.color }]}>
                    {transaction.category}
                  </Text>
                  <Text style={[styles.recordTitle, isDarkMode && { color: '#F8FAFC' }]}>{transaction.title}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${transaction.statusColor}22` },
                ]}
              >
                <Text style={[styles.statusText, { color: transaction.statusColor }]}>
                  {transaction.status}
                </Text>
              </View>
            </View>

            <View style={[styles.qrBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B' }]}>
              <View style={styles.qrLeft}>
                <View style={styles.qrIconWrap}>
                  <Ionicons name="qr-code-outline" size={22} color="#059669" />
                </View>
                <View style={styles.qrTextWrap}>
                  <Text style={styles.qrLabel}>OFFICIAL QR VERIFIED</Text>
                  <Text style={[styles.qrId, isDarkMode && { color: '#F8FAFC' }]}>{transaction.qrId}</Text>
                  <Text style={[styles.qrDescription, isDarkMode && { color: '#CBD5E1' }]}>{transaction.description}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>{transaction.address}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Fee Paid</Text>
              <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>{transaction.fee}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionButton, { borderColor: transaction.color }]}
              onPress={() => setSelectedTransaction(transaction)}
            >
              <Ionicons name="qr-code-outline" size={16} color={transaction.color} />
              <Text style={[styles.actionButtonText, { color: transaction.color }]}>
                {transaction.actionLabel}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {selectedTransaction ? (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>{selectedTransaction.certificateTitle}</Text>
              <TouchableOpacity onPress={() => setSelectedTransaction(null)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={[styles.certificateCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B' }]}>
              <View style={styles.topSection}>
                <Ionicons name={selectedTransaction.icon} size={32} color={selectedTransaction.color} />
                <Text style={[styles.certLabel, { color: selectedTransaction.color }]}>
                  {selectedTransaction.certificateLabel}
                </Text>
                <Text style={[styles.certId, { color: selectedTransaction.color }]}>
                  {selectedTransaction.id}
                </Text>
                <Text style={[styles.establishmentName, isDarkMode && { color: '#F8FAFC' }]}>{selectedTransaction.certificateSubject}</Text>
                <Text style={[styles.establishmentType, isDarkMode && { color: '#CBD5E1' }]}>{selectedTransaction.certificateType}</Text>
              </View>

              <View style={[styles.qrCertificateBox, isDarkMode && { backgroundColor: '#1C2541' }]}>
                <View style={styles.qrCertificateIconWrap}>
                  <Ionicons name="qr-code-outline" size={48} color={selectedTransaction.color} />
                </View>
                <Text style={[styles.qrCertificateText, { color: selectedTransaction.color }]}>
                  VERIFIED - {selectedTransaction.qrId}
                </Text>
                <Text style={[styles.qrHint, isDarkMode && { color: '#CBD5E1' }]}>
                  {selectedTransaction.certificateHint}
                </Text>
              </View>

              <View style={styles.detailList}>
                <View style={styles.detailListRow}>
                  <Text style={styles.detailListLabel}>Address:</Text>
                  <Text style={[styles.detailListValue, isDarkMode && { color: '#F8FAFC' }]}>{selectedTransaction.address}</Text>
                </View>

                <View style={styles.detailListRow}>
                  <Text style={styles.detailListLabel}>{selectedTransaction.certificateStatusLabel}:</Text>
                  <Text style={[styles.detailListStatus, { color: selectedTransaction.statusColor }]}>
                    {selectedTransaction.status}
                  </Text>
                </View>

                <View style={styles.detailListRow}>
                  <Text style={styles.detailListLabel}>Fee Paid:</Text>
                  <Text style={[styles.detailListValue, isDarkMode && { color: '#F8FAFC' }]}>{selectedTransaction.fee}</Text>
                </View>

                <View style={styles.detailListRowLast}>
                  <Text style={styles.detailListLabel}>{selectedTransaction.certificateDateLabel}:</Text>
                  <Text style={[styles.detailListValue, isDarkMode && { color: '#F8FAFC' }]}>{selectedTransaction.certificateDate}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 110,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 18,
  },
  filterRow: {
    paddingBottom: 18,
    gap: 10,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  filterPillText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  recordTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  qrBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qrLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8FFF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  qrTextWrap: {
    flex: 1,
  },
  qrLabel: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  qrId: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  qrDescription: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  actionButton: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 12,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  certificateCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 24,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  certLabel: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  certId: {
    color: '#059669',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  establishmentName: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  establishmentType: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  qrCertificateBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  qrCertificateIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qrCertificateText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  qrHint: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  detailList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  detailListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 16,
  },
  detailListRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    gap: 16,
  },
  detailListLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  detailListValue: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  detailListStatus: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    flex: 1,
  },
});
