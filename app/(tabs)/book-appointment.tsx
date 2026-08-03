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

export default function BookAppointmentScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addAppointment } = useApp();

  const [form, setForm] = useState({
    center: '',
    service: '',
    date: '',
    time: '',
    doctor: '',
    reason: '',
  });
  const [confirmed, setConfirmed] = useState(false);

  // Modal Visibility States
  const [activePicker, setActivePicker] = useState<'center' | 'service' | 'date' | 'time' | 'doctor' | null>(null);

  const centers = ['Health Center 1 - Brgy. 7', 'Health Center 2 - Main Plaza', 'Health Center 3 - West District'];
  const services = ['General Health Checkup', 'Vaccination / Immunization', 'Dental Care & Prophylaxis', 'Prenatal & Maternal Care', 'Sanitation Health Inspection'];
  const dates = [
    'Today (July 20, 2026)',
    'Tomorrow (July 21, 2026)',
    'July 22, 2026',
    'July 25, 2026',
    'July 28, 2026',
    'August 02, 2026',
  ];
  const times = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const doctors = ['Dr. Santos (General Medicine)', 'Dr. Reyes (Pediatrics)', 'Dr. Cruz (Dentistry)', 'Dr. Garcia (Public Sanitation)'];

  const handleBook = () => {
    if (!form.center || !form.service || !form.date || !form.time) {
      Alert.alert('Incomplete Form', 'Please select a Health Center, Service Type, Date, and Time.');
      return;
    }
    
    // Add to global state
    addAppointment({
      service: form.service,
      center: form.center,
      date: form.date,
      time: form.time,
      doctor: form.doctor || 'Assigned Duty Doctor',
      reason: form.reason || 'Routine Visit',
    });

    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.confirmationContainer}>
          <View style={styles.confirmationIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={[styles.confirmationTitle, { color: colors.text }]}>Appointment Confirmed!</Text>
          <View style={[styles.confirmationDetails, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Service</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.service}</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Date</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.date}</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Time</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.time}</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Location</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.center}</Text>
            </View>
            {form.doctor ? (
              <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Doctor</Text>
                <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.doctor}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.confirmationNote, { color: colors.subtext }]}>Your appointment is now listed in Track Requests & Records.</Text>
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/track-requests' as any)}
          >
            <Text style={styles.doneButtonText}>VIEW MY REQUESTS</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={[styles.title, { color: colors.text }]}>Book Appointment</Text>

          {/* Health Center */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Health Center *</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('center')}
            >
              <Text style={[styles.pickerText, { color: form.center ? colors.text : colors.subtext }]}>
                {form.center || 'Select Health Center'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Service Type */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Service Type *</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('service')}
            >
              <Text style={[styles.pickerText, { color: form.service ? colors.text : colors.subtext }]}>
                {form.service || 'Select Service Type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Date & Time */}
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
              <Text style={[styles.label, { color: colors.text }]}>Time *</Text>
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

          {/* Preferred Doctor */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Preferred Doctor (Optional)</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('doctor')}
            >
              <Text style={[styles.pickerText, { color: form.doctor ? colors.text : colors.subtext }]}>
                {form.doctor || 'Select Preferred Doctor'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Reason */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Reason for Visit</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="Describe symptoms or purpose of visit..."
              placeholderTextColor={colors.subtext}
              multiline
              numberOfLines={3}
              value={form.reason}
              onChangeText={(text) => setForm({ ...form, reason: text })}
            />
          </View>

          <TouchableOpacity style={[styles.bookButton, { backgroundColor: colors.primary }]} onPress={handleBook}>
            <Text style={styles.bookButtonText}>CONFIRM APPOINTMENT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Interactive Option Modals */}
      <OptionPickerModal
        visible={activePicker === 'center'}
        title="Select Health Center"
        options={centers}
        selectedValue={form.center}
        onSelect={(val) => setForm({ ...form, center: val })}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'service'}
        title="Select Service Type"
        options={services}
        selectedValue={form.service}
        onSelect={(val) => setForm({ ...form, service: val })}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'date'}
        title="Select Appointment Date"
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

      <OptionPickerModal
        visible={activePicker === 'doctor'}
        title="Select Preferred Doctor"
        options={doctors}
        selectedValue={form.doctor}
        onSelect={(val) => setForm({ ...form, doctor: val })}
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
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
    minHeight: 80,
    textAlignVertical: 'top',
    ...Typography.body,
    color: '#0d4f64',
  },
  row: {
    flexDirection: 'row',
  },
  bookButton: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  bookButtonText: {
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