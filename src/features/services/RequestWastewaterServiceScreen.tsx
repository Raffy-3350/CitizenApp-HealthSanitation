import { ThemedPicker } from '@/src/components/common/ThemedPicker';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface RequestWastewaterServiceScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

type PickerMode = 'maintenanceDate' | 'scheduleDate' | 'scheduleTime';

const SERVICE_TYPES = ['Septic Tank Desludging', 'Grease Trap Cleaning'];
const TANK_SIZES = ['1,000L', '2,000L'];

function formatDate(value: Date | null): string {
  return value ? value.toLocaleDateString() : '';
}

function formatTime(value: Date | null): string {
  return value
    ? value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';
}

function formatDateInputValue(value: Date | null): string {
  if (!value) return '';
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

function formatTimeInputValue(value: Date | null): string {
  if (!value) return '';
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function parseTime(value: string): Date | null {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  const result = new Date();
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function RequestWastewaterContent({ onClose }: { onClose?: () => void }) {
  const { isDarkMode } = useTheme();
  const [serviceType, setServiceType] = useState('');
  const [locationAddress, setLocationAddress] = useState('123 Sampaguita St, Brgy. 7');
  const [tankSize, setTankSize] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState<Date | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState<Date | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);

  const openPicker = (mode: PickerMode) => setPickerMode(mode);

  const handlePickerChange = (event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS !== 'ios' || event.type === 'dismissed') {
      setPickerMode(null);
    }
    if (event.type !== 'set' || !value || !pickerMode) return;

    if (pickerMode === 'maintenanceDate') setMaintenanceDate(value);
    if (pickerMode === 'scheduleDate') setScheduleDate(value);
    if (pickerMode === 'scheduleTime') setScheduleTime(value);
  };

  const handleSubmit = () => {
    console.log('Wastewater service request:', {
      serviceType,
      locationAddress,
      tankSize,
      maintenanceDate: maintenanceDate?.toISOString() || null,
      scheduleDate: scheduleDate?.toISOString() || null,
      scheduleTime: scheduleTime?.toISOString() || null,
      estimatedCost: '₱1,200.00',
    });
    onClose?.();
  };

  const pickerValue = pickerMode === 'maintenanceDate'
    ? maintenanceDate || new Date()
    : pickerMode === 'scheduleDate'
      ? scheduleDate || new Date()
      : scheduleTime || new Date();

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
      {onClose ? <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} /> : null}
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none">
        <View style={[styles.container, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Request Wastewater Service</Text>
            {onClose ? (
              <TouchableOpacity accessibilityLabel="Close wastewater service form" onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Service Type <Text style={styles.required}>*</Text></Text>
            <View style={[styles.pickerContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B' }]}>
              <ThemedPicker value={serviceType} onChange={setServiceType} placeholder="Select Wastewater Service" options={SERVICE_TYPES} isDarkMode={isDarkMode} />
            </View>

            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Service Location Address <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B' }]}>
              <Ionicons name="location-outline" size={18} color="#94A3B8" />
              <TextInputLike value={locationAddress} onChangeText={setLocationAddress} isDarkMode={isDarkMode} />
            </View>

            <Text style={[styles.sectionHeader, isDarkMode && { color: '#F8FAFC' }]}>Septic Tank Specifications</Text>
            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Tank Size / Capacity</Text>
            <View style={[styles.pickerContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B' }]}>
              <ThemedPicker value={tankSize} onChange={setTankSize} placeholder="Select Capacity" options={TANK_SIZES} isDarkMode={isDarkMode} />
            </View>

            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Last Maintenance Date</Text>
            <DateField
              value={maintenanceDate}
              placeholder="Select Last Maintenance"
              icon="calendar-outline"
              onPress={() => openPicker('maintenanceDate')}
              webType="date"
              onWebChange={setMaintenanceDate}
              isDarkMode={isDarkMode}
            />

            <Text style={[styles.sectionHeader, isDarkMode && { color: '#F8FAFC' }]}>Preferred Schedule</Text>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeField}>
                <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Date <Text style={styles.required}>*</Text></Text>
                <DateField
                  value={scheduleDate}
                  placeholder="Select Date"
                  icon="calendar-outline"
                  onPress={() => openPicker('scheduleDate')}
                  webType="date"
                  onWebChange={setScheduleDate}
                  isDarkMode={isDarkMode}
                />
              </View>
              <View style={styles.dateTimeField}>
                <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>Time Slot <Text style={styles.required}>*</Text></Text>
                <DateField
                  value={scheduleTime}
                  placeholder="Select Time"
                  icon="time-outline"
                  onPress={() => openPicker('scheduleTime')}
                  webType="time"
                  onWebChange={setScheduleTime}
                  isDarkMode={isDarkMode}
                />
              </View>
            </View>

            {Platform.OS !== 'web' && pickerMode ? (
              <DateTimePicker
                value={pickerValue}
                mode={pickerMode === 'scheduleTime' ? 'time' : 'date'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handlePickerChange}
                maximumDate={pickerMode === 'maintenanceDate' ? new Date() : undefined}
              />
            ) : null}

            <Text style={[styles.costLabel, isDarkMode && { color: '#F8FAFC' }]}>Estimated Cost</Text>
            <Text style={styles.costValue}>₱1,200.00</Text>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.submitButtonText}>REQUEST SERVICE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function TextInputLike({ value, onChangeText, isDarkMode }: { value: string; onChangeText: (value: string) => void; isDarkMode: boolean }) {
  return (
    <TextInput
      style={[styles.input, isDarkMode && { color: '#F8FAFC' }]}
      value={value}
      onChangeText={onChangeText}
      placeholder="123 Sampaguita St, Brgy. 7"
      placeholderTextColor="#94A3B8"
    />
  );
}

function DateField({
  value,
  placeholder,
  icon,
  onPress,
  webType,
  onWebChange,
  isDarkMode,
}: {
  value: Date | null;
  placeholder: string;
  icon: 'calendar-outline' | 'time-outline';
  onPress: () => void;
  webType: 'date' | 'time';
  onWebChange: (value: Date | null) => void;
  isDarkMode: boolean;
}) {
  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: webType,
      value: webType === 'date' ? formatDateInputValue(value) : formatTimeInputValue(value),
      onChange: (event: { target: { value: string } }) => onWebChange(webType === 'date' ? parseDate(event.target.value) : parseTime(event.target.value)),
      style: { ...webDateInputStyle, color: isDarkMode ? '#F8FAFC' : '#1E293B', backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', border: `1px solid ${isDarkMode ? '#3A506B' : '#CBD5E1'}` },
      'aria-label': placeholder,
    });
  }

  return (
    <TouchableOpacity style={[styles.dateButton, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B' }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[value ? styles.value : styles.placeholder, isDarkMode && { color: value ? '#F8FAFC' : '#94A3B8' }]}>{value ? (webType === 'date' ? formatDate(value) : formatTime(value)) : placeholder}</Text>
      <Ionicons name={icon} size={18} color="#38BDF8" />
    </TouchableOpacity>
  );
}

export function RequestWastewaterServiceScreen({ visible, onClose }: RequestWastewaterServiceScreenProps) {
  if (visible === undefined) return <RequestWastewaterContent onClose={onClose} />;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <RequestWastewaterContent onClose={onClose} />
    </Modal>
  );
}

const webDateInputStyle = {
  boxSizing: 'border-box',
  width: '100%',
  height: 50,
  padding: '0 12px',
  color: '#1E293B',
  backgroundColor: '#FFFFFF',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  fontSize: 13,
  fontFamily: 'inherit',
} as React.CSSProperties;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  container: { maxHeight: '94%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { flex: 1, color: '#1E293B', fontSize: 20, fontWeight: '800' },
  closeButton: { padding: 3 },
  formContent: { padding: 20, paddingBottom: 80 },
  label: { color: '#1E293B', fontSize: 13, fontWeight: '700', marginTop: 13, marginBottom: 7 },
  required: { color: '#DC2626' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8 },
  input: { flex: 1, height: 48, color: '#1E293B', fontSize: 13 },
  pickerContainer: { height: 50, justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, overflow: 'hidden' },
  picker: { color: '#1E293B', height: 50 },
  sectionHeader: { color: '#1E293B', fontSize: 16, fontWeight: '800', marginTop: 24, marginBottom: 4 },
  dateTimeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  dateTimeField: { flex: 1 },
  dateButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8 },
  placeholder: { color: '#64748B', fontSize: 13 },
  value: { color: '#1E293B', fontSize: 13 },
  costLabel: { color: '#1E293B', fontSize: 14, fontWeight: '800', marginTop: 24 },
  costValue: { color: '#0EA5E9', fontSize: 26, fontWeight: '900', marginTop: 4 },
  submitButton: { width: '100%', alignItems: 'center', backgroundColor: '#0EA5E9', borderRadius: 8, paddingVertical: 14, marginTop: 20 },
  submitButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
