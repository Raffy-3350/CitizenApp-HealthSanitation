import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { OptionPickerModal } from '../../components/ui/OptionPickerModal';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function RequestServiceScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addService } = useApp();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    serviceType: '',
    address: '123 Sampaguita St, Brgy. 7',
    tankSize: '',
    lastMaintenance: '',
    date: '',
    time: '',
  });

  const [activePicker, setActivePicker] = useState<'service' | 'tank' | 'lastMaint' | 'date' | 'time' | null>(null);

  const serviceTypes = [
    'Septic Tank Desludging & Cleaning',
    'Grease Trap Cleaning & Inspection',
    'Sewage Pipeline De-clogging',
    'Water Quality & Bacteria Testing',
    'Disinfection & Decontamination',
  ];

  const tankSizes = [
    'Small (1,000 Liters - Residential)',
    'Medium (2,500 Liters - Family Home)',
    'Large (5,000 Liters - Apartment / Commercial)',
    'Extra Large (10,000+ Liters - Industrial)',
  ];

  const lastMaintenanceOptions = [
    'Within last 1 year',
    '1 - 2 years ago',
    'More than 3 years ago',
    'Never cleaned / Unknown',
  ];

  const dates = [
    'Tomorrow (July 21, 2026)',
    'July 22, 2026',
    'July 23, 2026',
    'July 25, 2026',
    'July 28, 2026',
  ];

  const times = [
    '8:00 AM - 10:00 AM (Morning)',
    '10:00 AM - 12:00 PM (Morning)',
    '1:00 PM - 3:00 PM (Afternoon)',
    '3:00 PM - 5:00 PM (Afternoon)',
  ];

  const handleSubmit = () => {
    if (!form.serviceType || !form.address || !form.date || !form.time) {
      Alert.alert('Incomplete', 'Please select a Service Type, Address, Date, and Time.');
      return;
    }

    addService({
      serviceType: form.serviceType,
      address: form.address,
      tankSize: form.tankSize || 'Medium (2,500 Liters)',
      scheduleDate: form.date,
      scheduleTime: form.time,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.confirmationContainer}>
          <View style={styles.confirmationIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={[styles.confirmationTitle, { color: colors.text }]}>Request Submitted!</Text>
          <View style={[styles.confirmationDetails, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Service</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.serviceType}</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Schedule</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.date} ({form.time})</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Status</Text>
              <Text style={[styles.confirmationValue, { color: colors.warning }]}>Pending Assignment</Text>
            </View>
          </View>
          <Text style={[styles.confirmationNote, { color: colors.subtext }]}>Your service request is now listed in Track Requests.</Text>
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/track-requests' as any)}
          >
            <Text style={styles.doneButtonText}>VIEW TRACK REQUESTS</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={[styles.title, { color: colors.text }]}>Request Wastewater Service</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Service Type *</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('service')}
            >
              <Text style={[styles.pickerText, { color: form.serviceType ? colors.text : colors.subtext }]}>
                {form.serviceType || 'Select Wastewater Service'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Service Location Address *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter complete address"
              placeholderTextColor={colors.subtext}
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.text }]}>Septic Tank Specifications</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Tank Size / Capacity</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('tank')}
            >
              <Text style={[styles.pickerText, { color: form.tankSize ? colors.text : colors.subtext }]}>
                {form.tankSize || 'Select Capacity'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Last Maintenance Date</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('lastMaint')}
            >
              <Text style={[styles.pickerText, { color: form.lastMaintenance ? colors.text : colors.subtext }]}>
                {form.lastMaintenance || 'Select Last Maintenance'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.text }]}>Preferred Schedule</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: Spacing.sm }]}>
              <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
              <TouchableOpacity
                style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                onPress={() => setActivePicker('date')}
              >
                <Text style={[styles.pickerText, { color: form.date ? colors.text : colors.subtext }]}>
                  {form.date || 'Select Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: Spacing.sm }]}>
              <Text style={[styles.label, { color: colors.text }]}>Time Slot *</Text>
              <TouchableOpacity
                style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                onPress={() => setActivePicker('time')}
              >
                <Text style={[styles.pickerText, { color: form.time ? colors.text : colors.subtext }]}>
                  {form.time || 'Select Time'}
                </Text>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Estimated Cost</Text>
            <Text style={[styles.feeText, { color: colors.primary }]}>₱1,200.00</Text>
          </View>

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>REQUEST SERVICE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <OptionPickerModal
        visible={activePicker === 'service'}
        title="Select Service Type"
        options={serviceTypes}
        selectedValue={form.serviceType}
        onSelect={(val) => setForm({ ...form, serviceType: val })}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'tank'}
        title="Select Septic Tank Capacity"
        options={tankSizes}
        selectedValue={form.tankSize}
        onSelect={(val) => setForm({ ...form, tankSize: val })}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'lastMaint'}
        title="Select Last Maintenance"
        options={lastMaintenanceOptions}
        selectedValue={form.lastMaintenance}
        onSelect={(val) => setForm({ ...form, lastMaintenance: val })}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'date'}
        title="Select Service Date"
        options={dates}
        selectedValue={form.date}
        onSelect={(val) => setForm({ ...form, date: val })}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'time'}
        title="Select Time Slot"
        options={times}
        selectedValue={form.time}
        onSelect={(val) => setForm({ ...form, time: val })}
        onClose={() => setActivePicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  form: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.heading,
    color: '#0d4f64',
    marginBottom: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    color: '#0d4f64',
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
    ...Typography.body,
    color: '#0d4f64',
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  pickerText: {
    ...Typography.body,
    color: '#0d4f64',
    flex: 1,
  },
  placeholderText: {
    color: '#86B6F6',
  },
  sectionLabel: {
    ...Typography.subheading,
    color: '#0d4f64',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  feeText: {
    ...Typography.heading,
    color: '#176B87',
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Confirmation
  confirmationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  confirmationIcon: {
    marginBottom: Spacing.lg,
  },
  confirmationTitle: {
    ...Typography.heading,
    color: '#0d4f64',
    marginBottom: Spacing.lg,
  },
  confirmationDetails: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.md,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
  },
  confirmationLabel: {
    ...Typography.body,
    color: '#86B6F6',
  },
  confirmationValue: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
    maxWidth: '60%',
    textAlign: 'right',
  },
  confirmationNote: {
    ...Typography.caption,
    color: '#86B6F6',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  doneButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },
});