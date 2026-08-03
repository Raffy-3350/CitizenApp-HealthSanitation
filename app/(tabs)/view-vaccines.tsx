import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp, Vaccine } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function ViewVaccinesScreen() {
  const colors = useColors();
  const { vaccines, toggleVaccineStatus } = useApp();
  const [selectedCert, setSelectedCert] = useState<Vaccine | null>(null);

  const pedrosVaccines = vaccines.filter((v) => v.recipient === 'Pedro');
  const sofiasVaccines = vaccines.filter((v) => v.recipient === 'Sofia');

  const handleVaccinePress = (vaccine: Vaccine) => {
    if (vaccine.certId) {
      setSelectedCert(vaccine);
    } else {
      Alert.alert(
        'Update Vaccine Status',
        `Mark "${vaccine.name}" as ${vaccine.status === 'Completed' ? 'Pending' : 'Completed'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Update Status',
            onPress: () => toggleVaccineStatus(vaccine.id),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Immunization Records</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>Verified Health Passport</Text>
        </View>

        {/* Adult Vaccines */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pedro García (Adult Profile)</Text>
          {pedrosVaccines.map((vaccine, index) => (
            <Animated.View key={vaccine.id} entering={FadeInDown.delay(index * 60).springify()}>
              <TouchableOpacity
                style={[styles.vaccineCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => handleVaccinePress(vaccine)}
                activeOpacity={0.75}
              >
                <View style={styles.vaccineInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.vaccineName, { color: colors.text }]}>{vaccine.name}</Text>
                    {vaccine.certId && (
                      <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.verifiedBadgeText, { color: colors.success }]}>QR Certified</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.vaccineMeta}>
                    <View style={[styles.statusDot, { backgroundColor: vaccine.color }]} />
                    <Text style={[styles.vaccineStatus, { color: colors.text }]}>{vaccine.status}</Text>
                    <Text style={[styles.vaccineDate, { color: colors.subtext }]}>• {vaccine.date}</Text>
                  </View>
                </View>
                <Ionicons
                  name={vaccine.status === 'Completed' ? 'checkmark-circle' : 'time-outline'}
                  size={24}
                  color={vaccine.color}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Dependent Vaccines */}
        <View style={styles.section}>
          <View style={styles.childHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sofia García (Child, 2 yrs)</Text>
            <TouchableOpacity onPress={() => Alert.alert('Child Record', 'Sofia Garcia’s record is fully linked with Barangay Health Center 1.')}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>Pediatric Card</Text>
            </TouchableOpacity>
          </View>

          {sofiasVaccines.map((vaccine, index) => (
            <Animated.View key={vaccine.id} entering={FadeInDown.delay(index * 60 + 100).springify()}>
              <TouchableOpacity
                style={[styles.vaccineCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => handleVaccinePress(vaccine)}
                activeOpacity={0.75}
              >
                <View style={styles.vaccineInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.vaccineName, { color: colors.text }]}>{vaccine.name}</Text>
                    {vaccine.certId && (
                      <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.verifiedBadgeText, { color: colors.success }]}>QR Certified</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.vaccineMeta}>
                    <View style={[styles.statusDot, { backgroundColor: vaccine.color }]} />
                    <Text style={[styles.vaccineStatus, { color: colors.text }]}>{vaccine.status}</Text>
                    <Text style={[styles.vaccineDate, { color: colors.subtext }]}>• {vaccine.date}</Text>
                  </View>
                </View>
                <Ionicons
                  name={vaccine.status === 'Completed' ? 'checkmark-circle' : 'time-outline'}
                  size={24}
                  color={vaccine.color}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              const completed = pedrosVaccines.find((v) => v.certId);
              if (completed) setSelectedCert(completed);
            }}
          >
            <Ionicons name="qr-code-outline" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Digital Health QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.subtext }]}
            onPress={() => Alert.alert('Reminders Set', 'SMS reminders activated for Sofia’s upcoming MMR Booster.')}
          >
            <Ionicons name="notifications-outline" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Set Reminders</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Digital Certificate Modal */}
      <Modal visible={!!selectedCert} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.certCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.closeCert} onPress={() => setSelectedCert(null)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={[styles.certHeader, { borderBottomColor: colors.border }]}>
              <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
              <Text style={[styles.certHeaderTitle, { color: colors.text }]}>OFFICIAL IMMUNIZATION PASS</Text>
              <Text style={[styles.certHeaderSub, { color: colors.subtext }]}>Department of Health & Sanitation</Text>
            </View>

            {selectedCert && (
              <View style={styles.certBody}>
                <View style={[styles.qrPlaceholder, { backgroundColor: colors.background }]}>
                  <Ionicons name="qr-code" size={120} color={colors.text} />
                  <Text style={[styles.certCode, { color: colors.primary }]}>{selectedCert.certId}</Text>
                </View>

                <View style={styles.certDetails}>
                  <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.certLabel, { color: colors.subtext }]}>Patient</Text>
                    <Text style={[styles.certValue, { color: colors.text }]}>{selectedCert.recipient === 'Pedro' ? 'Pedro García' : 'Sofia García'}</Text>
                  </View>
                  <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.certLabel, { color: colors.subtext }]}>Vaccine</Text>
                    <Text style={[styles.certValue, { color: colors.text }]}>{selectedCert.name}</Text>
                  </View>
                  <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.certLabel, { color: colors.subtext }]}>Date Administered</Text>
                    <Text style={[styles.certValue, { color: colors.text }]}>{selectedCert.date}</Text>
                  </View>
                  <View style={[styles.certRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.certLabel, { color: colors.subtext }]}>Issuing Facility</Text>
                    <Text style={[styles.certValue, { color: colors.text }]}>Health Center 1 - Brgy 7</Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.doneCertBtn, { backgroundColor: colors.primary }]} onPress={() => setSelectedCert(null)}>
              <Text style={styles.doneCertBtnText}>CLOSE PASS</Text>
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
    ...Typography.heading,
    color: '#0d4f64',
  },
  subtitle: {
    ...Typography.subheading,
    color: '#176B87',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: '#0d4f64',
    marginBottom: Spacing.md,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    ...Typography.small,
    color: '#176B87',
    fontWeight: '600',
  },
  vaccineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  verifiedBadge: {
    backgroundColor: '#2ecc7120',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedBadgeText: {
    ...Typography.small,
    color: '#2ecc71',
    fontWeight: '600',
    fontSize: 9,
  },
  vaccineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  vaccineStatus: {
    ...Typography.small,
    color: '#0d4f64',
    fontWeight: '600',
    marginRight: 4,
  },
  vaccineDate: {
    ...Typography.small,
    color: '#86B6F6',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  actionButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Cert Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 79, 100, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  certCard: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    position: 'relative',
  },
  closeCert: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  certHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
    paddingBottom: Spacing.md,
  },
  certHeaderTitle: {
    ...Typography.heading,
    color: '#0d4f64',
    fontSize: 16,
    marginTop: 4,
  },
  certHeaderSub: {
    ...Typography.small,
    color: '#86B6F6',
  },
  certBody: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  qrPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  certCode: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#176B87',
    marginTop: 4,
  },
  certDetails: {
    width: '100%',
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
  },
  certLabel: {
    ...Typography.small,
    color: '#86B6F6',
  },
  certValue: {
    ...Typography.small,
    fontWeight: '600',
    color: '#0d4f64',
  },
  doneCertBtn: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  doneCertBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },
});