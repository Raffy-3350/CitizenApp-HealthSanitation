import { ThemedPicker } from '@/src/components/common/ThemedPicker';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
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

export interface ReportHealthIssueScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

type UrgencyLevel = 'Normal' | 'Urgent' | 'Emergency';

const ISSUE_TYPES = ['Dengue Symptoms', 'Food Poisoning', 'Sanitation Hazard'];
const URGENCY_LEVELS: UrgencyLevel[] = ['Normal', 'Urgent', 'Emergency'];
const URGENCY_DOT_COLORS: Record<UrgencyLevel, string> = {
  Normal: '#0EA5E9',
  Urgent: '#F59E0B',
  Emergency: '#EF4444',
};

function ReportHealthIssueContent({ onClose }: { onClose?: () => void }) {
  const { isDarkMode } = useTheme();
  const [issueType, setIssueType] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [attachment, setAttachment] = useState<string | null>(null);

  const handleUseGps = () => {
    setIncidentLocation('Current device location');
  };

  const handleSubmit = () => {
    console.log('Health issue report:', {
      issueType,
      incidentLocation,
      description,
      attachment,
      urgency,
    });
    onClose?.();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
      {onClose ? <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} /> : null}
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <View style={[styles.container, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>Report Health Issue</Text>
            {onClose ? (
              <TouchableOpacity
                accessibilityLabel="Close health issue report"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>
              Issue Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B' }]}>
              <ThemedPicker value={issueType} onChange={setIssueType} placeholder="Select Issue Category" options={ISSUE_TYPES} isDarkMode={isDarkMode} />
            </View>

            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>
              Incident Location <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.locationInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B', color: '#F8FAFC' }]}
                value={incidentLocation}
                onChangeText={setIncidentLocation}
                placeholder="Enter address or tap GPS icon"
                placeholderTextColor="#64748B"
              />
              <TouchableOpacity
                accessibilityLabel="Use current location"
                style={styles.gpsButton}
                onPress={handleUseGps}
                activeOpacity={0.8}
              >
                <Ionicons name="locate-outline" size={21} color="#0EA5E9" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, isDarkMode && { color: '#CBD5E1' }]}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.descriptionInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#3A506B', color: '#F8FAFC' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what happened, number of affected people, symptoms, etc..."
              placeholderTextColor="#64748B"
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.sectionHeader, isDarkMode && { color: '#F8FAFC' }]}>Attach Photo (Optional)</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.attachmentButton, isDarkMode && { backgroundColor: '#334155' }]}
                onPress={() => setAttachment('Photo selected')}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={19} color="#0EA5E9" />
                <Text style={[styles.actionText, isDarkMode && { color: '#F8FAFC' }]}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.attachmentButton, isDarkMode && { backgroundColor: '#334155' }]}
                onPress={() => setAttachment('File selected')}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload-outline" size={19} color="#0EA5E9" />
                <Text style={[styles.actionText, isDarkMode && { color: '#F8FAFC' }]}>Upload File</Text>
              </TouchableOpacity>
            </View>
            {attachment ? <Text style={styles.attachmentStatus}>{attachment}</Text> : null}

            <Text style={[styles.sectionHeader, isDarkMode && { color: '#F8FAFC' }]}>Urgency Level</Text>
            <View style={styles.urgencyRow}>
              {URGENCY_LEVELS.map((level) => {
                const selected = urgency === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.urgencyButton, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }, selected && styles.urgencyButtonSelected]}
                    onPress={() => setUrgency(level)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.urgencyDot, { backgroundColor: selected ? '#FFFFFF' : URGENCY_DOT_COLORS[level] }]} />
                    <Text style={[styles.urgencyText, isDarkMode && { color: '#F8FAFC' }, selected && styles.urgencyTextSelected]}>{level}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.submitButtonText}>SUBMIT HEALTH REPORT</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export function ReportHealthIssueScreen({ visible, onClose }: ReportHealthIssueScreenProps) {
  if (visible === undefined) return <ReportHealthIssueContent onClose={onClose} />;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ReportHealthIssueContent onClose={onClose} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  container: { maxHeight: '94%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { flex: 1, color: '#1E293B', fontSize: 20, fontWeight: '800' },
  closeButton: { padding: 3 },
  formContent: { padding: 20, paddingBottom: 80 },
  label: { color: '#1E293B', fontSize: 13, fontWeight: '700', marginTop: 13, marginBottom: 7 },
  required: { color: '#DC2626' },
  pickerContainer: { height: 50, justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, overflow: 'hidden' },
  picker: { color: '#1E293B', height: 50 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationInput: { flex: 1, height: 50, paddingHorizontal: 12, color: '#1E293B', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, fontSize: 13 },
  gpsButton: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 },
  descriptionInput: { height: 100, padding: 12, color: '#1E293B', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, fontSize: 13 },
  sectionHeader: { color: '#1E293B', fontSize: 15, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 12 },
  attachmentButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 8, backgroundColor: '#F1F5F9', borderRadius: 8 },
  actionText: { color: '#1E293B', fontSize: 12, fontWeight: '700' },
  attachmentStatus: { color: '#64748B', fontSize: 11, marginTop: 7 },
  urgencyRow: { flexDirection: 'row', gap: 8 },
  urgencyButton: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 5, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8 },
  urgencyButtonSelected: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  urgencyDot: { width: 8, height: 8, borderRadius: 4 },
  urgencyText: { color: '#1E293B', fontSize: 11, fontWeight: '700' },
  urgencyTextSelected: { color: '#FFFFFF' },
  submitButton: { width: '100%', alignItems: 'center', backgroundColor: '#0EA5E9', borderRadius: 8, paddingVertical: 14, marginTop: 22 },
  submitButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
