import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

export default function ApplyPermitScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addPermit } = useApp();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    address: '',
    paymentMethod: '',
  });

  const [uploads, setUploads] = useState({
    businessPermit: false,
    floorPlan: false,
    healthCert: false,
  });

  const [activePicker, setActivePicker] = useState<'type' | 'payment' | null>(null);

  const businessTypes = [
    'Food Establishment (Eatery / Restaurant)',
    'Water Refilling Station',
    'Beauty Salon / Barber Shop / Spa',
    'Public Market Stall / Vendor',
    'Grocery / Convenience Store',
    'General Commercial Business',
  ];

  const paymentMethods = [
    'GCash e-Wallet',
    'Maya e-Wallet',
    'Credit / Debit Card (Visa/Mastercard)',
    'Over-the-Counter (City Treasurer Office)',
  ];

  const handleUpload = async (docKey: keyof typeof uploads, docName: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your gallery to attach documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploads((prev) => ({ ...prev, [docKey]: true }));
      Alert.alert('File Attached', `${docName} has been attached successfully.`);
    }
  };

  const handleSubmit = () => {
    if (!form.businessName || !form.businessType || !form.address || !form.paymentMethod) {
      Alert.alert('Incomplete', 'Please fill in all required fields including business category and payment method.');
      return;
    }
    
    addPermit({
      businessName: form.businessName,
      businessType: form.businessType,
      address: form.address,
      paymentMethod: form.paymentMethod,
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
          <Text style={[styles.confirmationTitle, { color: colors.text }]}>Application Submitted!</Text>
          <View style={[styles.confirmationDetails, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Business</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.businessName}</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Category</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.businessType}</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Payment</Text>
              <Text style={[styles.confirmationValue, { color: colors.text }]}>{form.paymentMethod}</Text>
            </View>
            <View style={[styles.confirmationRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.confirmationLabel, { color: colors.subtext }]}>Status</Text>
              <Text style={[styles.confirmationValue, { color: colors.warning }]}>Pending Inspection</Text>
            </View>
          </View>
          <Text style={[styles.confirmationNote, { color: colors.subtext }]}>Your permit application is now listed in Track Requests.</Text>
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
          <Text style={[styles.title, { color: colors.text }]}>Apply Sanitation Permit</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Business Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter registered business name"
              placeholderTextColor={colors.subtext}
              value={form.businessName}
              onChangeText={(text) => setForm({ ...form, businessName: text })}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Business Category *</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('type')}
            >
              <Text style={[styles.pickerText, { color: form.businessType ? colors.text : colors.subtext }]}>
                {form.businessType || 'Select Business Category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Business Address *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder="Building No, Street, Barangay"
              placeholderTextColor={colors.subtext}
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.text }]}>Upload Requirements</Text>
          
          <View style={[styles.uploadItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={uploads.businessPermit ? "checkmark-circle" : "document-outline"} size={24} color={uploads.businessPermit ? colors.success : colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[styles.uploadLabel, { color: colors.text }]}>Business Registration / DTI</Text>
              <Text style={[styles.uploadSub, { color: colors.subtext }]}>{uploads.businessPermit ? "DTI_Registration_2026.pdf" : "PDF or JPG format"}</Text>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: colors.primary }, uploads.businessPermit && { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success }]}
              onPress={() => handleUpload('businessPermit', 'Business Registration')}
            >
              <Text style={[styles.uploadButtonText, uploads.businessPermit && { color: colors.success }]}>
                {uploads.businessPermit ? "Attached ✓" : "Upload"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.uploadItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={uploads.floorPlan ? "checkmark-circle" : "document-outline"} size={24} color={uploads.floorPlan ? colors.success : colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[styles.uploadLabel, { color: colors.text }]}>Facility Floor Plan</Text>
              <Text style={[styles.uploadSub, { color: colors.subtext }]}>{uploads.floorPlan ? "Store_FloorPlan_v1.png" : "Sanitation layout plan"}</Text>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: colors.primary }, uploads.floorPlan && { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success }]}
              onPress={() => handleUpload('floorPlan', 'Floor Plan')}
            >
              <Text style={[styles.uploadButtonText, uploads.floorPlan && { color: colors.success }]}>
                {uploads.floorPlan ? "Attached ✓" : "Upload"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.uploadItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={uploads.healthCert ? "checkmark-circle" : "document-outline"} size={24} color={uploads.healthCert ? colors.success : colors.primary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[styles.uploadLabel, { color: colors.text }]}>Staff Health Cards</Text>
              <Text style={[styles.uploadSub, { color: colors.subtext }]}>{uploads.healthCert ? "Health_Certificates.pdf" : "Medical clearance of workers"}</Text>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: colors.primary }, uploads.healthCert && { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success }]}
              onPress={() => handleUpload('healthCert', 'Health Cards')}
            >
              <Text style={[styles.uploadButtonText, uploads.healthCert && { color: colors.success }]}>
                {uploads.healthCert ? "Attached ✓" : "Upload"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Permit Fee</Text>
            <Text style={[styles.feeText, { color: colors.primary }]}>₱500.00</Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Payment Method *</Text>
            <TouchableOpacity
              style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setActivePicker('payment')}
            >
              <Text style={[styles.pickerText, { color: form.paymentMethod ? colors.text : colors.subtext }]}>
                {form.paymentMethod || 'Select Payment Option'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>SUBMIT APPLICATION</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <OptionPickerModal
        visible={activePicker === 'type'}
        title="Select Business Category"
        options={businessTypes}
        selectedValue={form.businessType}
        onSelect={(val) => setForm({ ...form, businessType: val })}
        onClose={() => setActivePicker(null)}
      />

      <OptionPickerModal
        visible={activePicker === 'payment'}
        title="Select Payment Method"
        options={paymentMethods}
        selectedValue={form.paymentMethod}
        onSelect={(val) => setForm({ ...form, paymentMethod: val })}
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
  uploadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  uploadLabel: {
    ...Typography.body,
    color: '#0d4f64',
    fontWeight: '600',
  },
  uploadSub: {
    ...Typography.small,
    color: '#86B6F6',
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  uploadedBtn: {
    backgroundColor: '#2ecc7120',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  uploadButtonText: {
    ...Typography.small,
    color: '#ffffff',
    fontWeight: '600',
  },
  uploadedBtnText: {
    color: '#2ecc71',
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