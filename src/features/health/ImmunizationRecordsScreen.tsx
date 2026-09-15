import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type ImmunizationStatus = 'Completed' | 'Due';

interface ImmunizationRecord {
  id: number;
  name: string;
  isQrCertified: boolean;
  status: ImmunizationStatus;
  date: string;
}

interface ImmunizationProfile {
  name: string;
  cardType: string | null;
  records: ImmunizationRecord[];
}

export interface ImmunizationRecordsScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

const profiles: ImmunizationProfile[] = [
  {
    name: 'Pedro Garcia (Adult Profile)',
    cardType: null,
    records: [
      { id: 1, name: 'COVID-19 Booster (Bivalent)', isQrCertified: true, status: 'Completed', date: 'Nov 14, 2025' },
      { id: 2, name: 'Influenza (Quadrivalent)', isQrCertified: true, status: 'Completed', date: 'Sep 02, 2025' },
      { id: 3, name: 'Tetanus Toxoid', isQrCertified: true, status: 'Completed', date: 'Jun 19, 2024' },
      { id: 4, name: 'Hepatitis B Vaccine', isQrCertified: false, status: 'Due', date: 'Pending Schedule' },
    ],
  },
  {
    name: 'Sofia Garcia (Child, 2 yrs)',
    cardType: 'Pediatric Card',
    records: [
      { id: 5, name: 'BCG (Tuberculosis)', isQrCertified: true, status: 'Completed', date: 'Aug 10, 2024' },
      { id: 6, name: 'DPT 1st & 2nd Dose', isQrCertified: true, status: 'Completed', date: 'Jan 15, 2025' },
      { id: 7, name: 'MMR Booster (Measles, Mumps)', isQrCertified: false, status: 'Due', date: 'July 28, 2026' },
    ],
  },
];

function ImmunizationContent({
  onClose,
  compact,
}: {
  onClose?: () => void;
  compact?: boolean;
}) {
  const { isDarkMode } = useTheme();
  return (
    <SafeAreaView style={[styles.container, compact && styles.sheetContainer, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <View style={[styles.header, isDarkMode && { backgroundColor: '#1C2541', borderBottomColor: '#3A506B' }]}>
        <View>
          <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Immunization Records</Text>
          <Text style={styles.subtitle}>Verified Health Passport</Text>
        </View>
        {onClose ? (
          <TouchableOpacity
            accessibilityLabel="Close immunization records"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        style={styles.recordsScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {profiles.map((profile) => (
          <View key={profile.name} style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <Text style={[styles.profileName, isDarkMode && { color: '#F8FAFC' }]}>{profile.name}</Text>
              {profile.cardType ? <Text style={styles.cardType}>{profile.cardType}</Text> : null}
            </View>

            {profile.records.map((record) => {
              const isCompleted = record.status === 'Completed';
              const statusColor = isCompleted ? '#10B981' : '#F59E0B';
              return (
                <View key={record.id} style={[styles.vaccineCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                  <View style={styles.vaccineTopRow}>
                    <Text style={[styles.vaccineName, isDarkMode && { color: '#F8FAFC' }]}>{record.name}</Text>
                    {record.isQrCertified ? (
                      <View style={styles.qrTag}>
                        <Text style={styles.qrTagText}>QR Certified</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.vaccineBottomRow}>
                    <View style={styles.statusDetails}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusText, { color: statusColor }]}>{record.status}</Text>
                      <Text style={styles.dateText}>• {record.date}</Text>
                    </View>
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'time-outline'}
                      size={22}
                      color={statusColor}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.actionRow, isDarkMode && { backgroundColor: '#0B132B', borderTopColor: '#3A506B' }]}>
        <TouchableOpacity style={styles.qrButton} activeOpacity={0.85}>
          <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
          <Text style={styles.qrButtonText}>Digital Health QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.reminderButton, isDarkMode && { backgroundColor: '#334155' }]} activeOpacity={0.85}>
          <Ionicons name="notifications-outline" size={18} color="#1E293B" />
          <Text style={styles.reminderButtonText}>Set Reminders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function ImmunizationRecordsScreen({
  visible,
  onClose,
}: ImmunizationRecordsScreenProps) {
  if (visible === undefined) {
    return <ImmunizationContent onClose={onClose} />;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <ImmunizationContent onClose={onClose} compact />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheetContainer: {
    flex: 1,
    marginTop: '6%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: { color: '#1E293B', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#0EA5E9', fontSize: 13, fontWeight: '600', marginTop: 4 },
  closeButton: { padding: 2 },
  recordsScroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 16 },
  profileSection: { marginBottom: 18 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  profileName: { flex: 1, color: '#1E293B', fontSize: 16, fontWeight: '800' },
  cardType: { color: '#0EA5E9', fontSize: 11, fontWeight: '700' },
  vaccineCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  vaccineTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  vaccineName: { flex: 1, color: '#1E293B', fontSize: 14, fontWeight: '800', lineHeight: 19 },
  qrTag: { paddingHorizontal: 6, paddingVertical: 4, backgroundColor: '#DCFCE7', borderRadius: 4 },
  qrTagText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  vaccineBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statusDetails: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 7 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusText: { fontSize: 12, fontWeight: '800' },
  dateText: { color: '#64748B', fontSize: 12, flexShrink: 1 },
  actionRow: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  qrButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10,
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
  },
  qrButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  reminderButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  reminderButtonText: { color: '#1E293B', fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
