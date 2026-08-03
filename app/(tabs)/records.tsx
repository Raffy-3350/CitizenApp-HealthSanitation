import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function RecordsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { userProfile, vaccines, appointments, permits, services } = useApp();

  const [activeModal, setActiveModal] = useState<'profile' | null>(null);

  const completedVaccinesCount = vaccines.filter((v) => v.status === 'Completed').length;
  const dueVaccinesCount = vaccines.filter((v) => v.status === 'Due').length;
  const activeApptsCount = appointments.filter((a) => a.status !== 'Completed' && a.status !== 'Cancelled').length;
  const activePermitsCount = permits.filter((p) => p.status !== 'Expired').length;
  const activeServicesCount = services.filter((s) => s.status !== 'Completed').length;

  const records = [
    {
      icon: 'person-outline',
      title: 'Personal Health Profile',
      value: `Blood Type: ${userProfile.bloodType} • PhilHealth Verified`,
      sub: `Allergies: ${userProfile.allergies}`,
      action: 'View Profile Summary',
      onPress: () => setActiveModal('profile'),
    },
    {
      icon: 'medkit-outline',
      title: 'Immunization Records',
      value: `${completedVaccinesCount} Completed Vaccines`,
      sub: `${dueVaccinesCount} Vaccine(s) Due`,
      action: 'View Full Vaccine History',
      onPress: () => router.push('/(tabs)/view-vaccines' as any),
    },
    {
      icon: 'calendar-outline',
      title: 'My Appointments',
      value: `${activeApptsCount} Active Appointment(s)`,
      sub: appointments.length > 0 ? `${appointments[0].service} - ${appointments[0].date}` : 'No upcoming appointments',
      action: 'Book New Appointment',
      onPress: () => router.push('/(tabs)/book-appointment' as any),
    },
    {
      icon: 'document-text-outline',
      title: 'My Sanitation Permits',
      value: `${activePermitsCount} Active Permit(s)`,
      sub: permits.length > 0 ? `${permits[0].id}: ${permits[0].status}` : 'No permits applied',
      action: 'Apply for New Permit',
      onPress: () => router.push('/(tabs)/apply-permit' as any),
    },
    {
      icon: 'water-outline',
      title: 'My Wastewater Requests',
      value: `${activeServicesCount} Active Service Request(s)`,
      sub: services.length > 0 ? `${services[0].id}: ${services[0].status}` : 'No active requests',
      action: 'Track Active Requests',
      onPress: () => router.push('/(tabs)/track-requests' as any),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>My Health Records</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>{userProfile.name}</Text>
        </View>

        {records.map((record, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
            onPress={record.onPress}
            activeOpacity={0.75}
          >
            <View style={[styles.recordIcon, { backgroundColor: colors.background }]}>
              <Ionicons name={record.icon as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.recordContent}>
              <Text style={[styles.recordTitle, { color: colors.text }]}>{record.title}</Text>
              <Text style={[styles.recordValue, { color: colors.text }]}>{record.value}</Text>
              {record.sub && <Text style={[styles.recordSub, { color: colors.subtext }]}>{record.sub}</Text>}
              {record.action && (
                <Text style={[styles.recordAction, { color: colors.primary }]}>{record.action}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Profile Summary Modal */}
      <Modal visible={activeModal === 'profile'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Personal Health Profile</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Full Name:', value: userProfile.name },
              { label: 'PhilHealth ID:', value: userProfile.philhealth },
              { label: 'Blood Type:', value: userProfile.bloodType },
              { label: 'Allergies:', value: userProfile.allergies },
              { label: 'Contact Number:', value: userProfile.phone },
              { label: 'Home Address:', value: userProfile.address },
            ].map((item, idx) => (
              <View key={idx} style={[styles.profileSummaryRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.subtext }]}>{item.label}</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{item.value}</Text>
              </View>
            ))}

            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.primary }]} onPress={() => setActiveModal(null)}>
              <Text style={styles.closeBtnText}>CLOSE SUMMARY</Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0d4f64',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#176B87',
    marginTop: 2,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0d4f64',
  },
  recordValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#0d4f64',
    marginTop: 1,
  },
  recordSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#86B6F6',
    marginTop: 1,
  },
  recordAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#176B87',
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
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.heading,
    color: '#0d4f64',
  },
  profileSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
  },
  summaryLabel: {
    ...Typography.body,
    color: '#86B6F6',
  },
  summaryValue: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
    maxWidth: '60%',
    textAlign: 'right',
  },
  closeBtn: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  closeBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },
});