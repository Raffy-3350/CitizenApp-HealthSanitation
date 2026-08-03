import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
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

export default function ReportIssueScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addReport } = useApp();

  const [submitted, setSubmitted] = useState(false);
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [photoAttached, setPhotoAttached] = useState(false);
  const [form, setForm] = useState({
    issueType: '',
    location: '',
    description: '',
  });

  const [activePicker, setActivePicker] = useState<boolean>(false);

  const issueTypes = [
    'Symptom / Illness Reporting (Dengue, Fever, etc.)',
    'Disease Outbreak Case in Neighborhood',
    'Sanitation & Waste Disposal Violation',
    'Stagnant Water / Mosquito Breeding Site',
    'Contaminated Water Supply',
    'Food Sanitation Violation (Eatery / Vendor)',
    'Other Public Health Concern',
  ];

  const handleGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is needed to set your incident location.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      const formattedAddress = address[0]
        ? `${address[0].street || address[0].name || ''}, ${address[0].city || address[0].subregion || ''}, ${address[0].region || ''}`.replace(/^,\s*/, '')
        : `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;
      setForm((prev) => ({ ...prev, location: formattedAddress }));
      Alert.alert('Location Captured', `Location set to: ${formattedAddress}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to get location. Please try again.');
    }
  };

  const handlePhoto = async (mode: 'camera' | 'upload') => {
    if (mode === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your camera to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        setPhotoAttached(true);
        Alert.alert('Photo Captured', 'Photo taken and attached to report.');
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your gallery to attach photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        setPhotoAttached(true);
        Alert.alert('Photo Selected', 'Image file selected from gallery.');
      }
    }
  };

  const handleSubmit = () => {
    if (!form.issueType || !form.location || !form.description) {
      Alert.alert('Incomplete', 'Please fill in Issue Type, Location, and Description.');
      return;
    }

    addReport({
      issueType: form.issueType,
      location: form.location,
      description: form.description,
      urgency: urgency,
      photoAttached: photoAttached,
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
          <Text style={[styles.confirmationTitle, { color: colors.text }]}>Report Submitted!</Text>
          <View style={[styles.confirmationDetails, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Category</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.issueType}</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Urgency</Text>
              <Text style={[styles.confirmationValue, { color: urgency === 'emergency' ? colors.error : urgency === 'urgent' ? colors.warning : colors.primary }]}>
                {urgency.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Status</Text>
              <Text style={[styles.confirmationValue, { color: colors.warning }]}>Health Officer Notified</Text>
            </View>
          </View>
          <Text style={[styles.confirmationNote, { color: colors.subtext }]}>Your report is now listed in Track Requests.</Text>
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
          <Text style={[styles.title, { color: colors.text }]}>Report Health Issue</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Issue Type *</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker(true)}
            >
              <Text style={[styles.pickerText, { color: form.issueType ? colors.text : colors.subtext }]}>
                {form.issueType || 'Select Issue Category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Incident Location *</Text>
            <View style={styles.locationWrapper}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter address or tap GPS icon"
                placeholderTextColor={colors.subtext}
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
              />
              <TouchableOpacity style={[styles.gpsButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={handleGPS}>
                <Ionicons name="locate-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="Describe what happened, number of affected people, symptoms, etc..."
              placeholderTextColor={colors.subtext}
              multiline
              numberOfLines={4}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Attach Photo (Optional)</Text>
            <View style={styles.photoRow}>
              <TouchableOpacity
                style={[
                  styles.photoButton,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                  photoAttached && { borderColor: colors.success, backgroundColor: colors.success + '15' },
                ]}
                onPress={() => handlePhoto('camera')}
              >
                <Ionicons name="camera-outline" size={22} color={photoAttached ? colors.success : colors.primary} />
                <Text style={[styles.photoButtonText, { color: colors.text }, photoAttached && { color: colors.success }]}>
                  {photoAttached ? "Retake Photo" : "Take Photo"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.photoButton,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                  photoAttached && { borderColor: colors.success, backgroundColor: colors.success + '15' },
                ]}
                onPress={() => handlePhoto('upload')}
              >
                <Ionicons name="cloud-upload-outline" size={22} color={photoAttached ? colors.success : colors.primary} />
                <Text style={[styles.photoButtonText, { color: colors.text }, photoAttached && { color: colors.success }]}>
                  {photoAttached ? "Change File" : "Upload File"}
                </Text>
              </TouchableOpacity>
            </View>
            {photoAttached && (
              <Text style={[styles.attachedHint, { color: colors.success }]}>✓ 1 photo attached</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Urgency Level</Text>
            <View style={styles.urgencyRow}>
              <TouchableOpacity
                style={[
                  styles.urgencyOption,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  urgency === 'normal' && { borderColor: colors.primary, backgroundColor: colors.primaryLight + '30' },
                ]}
                onPress={() => setUrgency('normal')}
              >
                <View style={[styles.urgencyDot, { backgroundColor: colors.info }]} />
                <Text style={[styles.urgencyText, { color: colors.subtext }, urgency === 'normal' && { color: colors.text, fontWeight: '600' }]}>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.urgencyOption,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  urgency === 'urgent' && { borderColor: colors.warning, backgroundColor: colors.warning + '20' },
                ]}
                onPress={() => setUrgency('urgent')}
              >
                <View style={[styles.urgencyDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.urgencyText, { color: colors.subtext }, urgency === 'urgent' && { color: colors.text, fontWeight: '600' }]}>Urgent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.urgencyOption,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  urgency === 'emergency' && { borderColor: colors.error, backgroundColor: colors.error + '20' },
                ]}
                onPress={() => setUrgency('emergency')}
              >
                <View style={[styles.urgencyDot, { backgroundColor: colors.error }]} />
                <Text style={[styles.urgencyText, { color: colors.subtext }, urgency === 'emergency' && { color: colors.text, fontWeight: '600' }]}>Emergency</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>SUBMIT HEALTH REPORT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <OptionPickerModal
        visible={activePicker}
        title="Select Issue Category"
        options={issueTypes}
        selectedValue={form.issueType}
        onSelect={(val) => setForm({ ...form, issueType: val })}
        onClose={() => setActivePicker(false)}
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  gpsButton: {
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  photoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#B4D4FF',
    gap: 6,
  },
  photoAttachedBtn: {
    borderColor: '#2ecc71',
    backgroundColor: '#2ecc7110',
  },
  photoButtonText: {
    ...Typography.body,
    color: '#0d4f64',
  },
  attachedHint: {
    ...Typography.small,
    color: '#2ecc71',
    fontWeight: '600',
    marginTop: 4,
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  urgencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#B4D4FF',
    gap: 6,
  },
  urgencySelected: {
    borderColor: '#176B87',
    backgroundColor: '#B4D4FF40',
  },
  urgencyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  urgencyText: {
    ...Typography.body,
    color: '#86B6F6',
  },
  urgencyTextSelected: {
    color: '#0d4f64',
    fontWeight: '600',
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