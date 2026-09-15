import { ThemedPicker } from "@/src/components/common/ThemedPicker";
import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { useTheme } from "@/src/context/ThemeContext";
import { ImmunizationRecordsScreen } from "@/src/features/health";
import { ReportHealthIssueScreen } from "@/src/features/services/ReportHealthIssueScreen";
import { RequestWastewaterServiceScreen } from "@/src/features/services/RequestWastewaterServiceScreen";
import { TrackRequestsScreen } from "@/src/features/services/TrackRequestsScreen";
import { AuthService } from "@/src/services/auth-service";
import {
  CitizenProfileData,
  ProfileService,
} from "@/src/services/profile-service";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles/HomeScreen.styles";

import { HomeScreenSkeleton } from "./HomeScreenSkeleton";

export interface AnnouncementItem {
  id: string;
  category: "EMERGENCY ADVISORY" | "COMMUNITY BROADCAST" | "CIVIC NOTICE";
  badgeVariant: "danger" | "info" | "success";
  title: string;
  date: string;
  summary: string;
  fullBody: string;
  department: string;
}

interface ActivityItem {
  id: string;
  serviceTitle: string;
  status: "Under Review" | "Approved" | "Completed" | "Processing";
  updatedAt: string;
  domainId: string;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ANC-101",
    category: "EMERGENCY ADVISORY",
    badgeVariant: "danger",
    title: "Typhoon Weather Advisory #2 - DRRM Command Center",
    date: "July 27, 2026 - 10 mins ago",
    summary:
      "Caloocan DRRM Command Center issued heavy rainfall alert for Barangay Central. Emergency response teams deployed.",
    fullBody:
      "The Caloocan Disaster Risk Reduction and Management (DRRM) Office has raised Alert Level 2 due to heavy monsoon rains. Emergency evacuation shelters at Barangay Covered Courts are open. For emergency rescue, tap the SOS button or call hotline (02) 8888-CALOOCAN.",
    department: "Caloocan DRRM Command Center",
  },
  {
    id: "ANC-102",
    category: "COMMUNITY BROADCAST",
    badgeVariant: "info",
    title: "Free Mobile Health Vaccination Clinic in Barangay 171",
    date: "July 26, 2026 - 1 day ago",
    summary:
      "Free health checkups, dental services, and childhood vaccinations scheduled at Barangay 171 Covered Court this Friday.",
    fullBody:
      "The City Health Department invites all residents of Barangay 171 to the free Mobile Health Caravan on Friday from 8:00 AM to 4:00 PM. Free services include general consultations, blood pressure checks, pediatric checkups, and flu vaccinations.",
    department: "City Health Department",
  },
  {
    id: "ANC-103",
    category: "CIVIC NOTICE",
    badgeVariant: "success",
    title: "Online Business Permit Renewal Fast-Track Portal Open",
    date: "July 25, 2026 - 2 days ago",
    summary:
      "Caloocan City Treasury launches instant digital clearance processing for Q3 business permit renewals.",
    fullBody:
      "Business owners can now apply for, renew, and pay Q3 business permits completely online via Civentral. Approved e-permits with official QR verification will be issued within 24 hours of payment clearance.",
    department: "Business Permits and Licensing Office (BPLO)",
  },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "APP-2026-001",
    serviceTitle: "Barangay Clearance and Citizen ID",
    status: "Under Review",
    updatedAt: "Today",
    domainId: "identity",
  },
  {
    id: "APP-2026-042",
    serviceTitle: "New Business Permit Application",
    status: "Approved",
    updatedAt: "Yesterday",
    domainId: "business",
  },
];

const QUICK_ACTIONS = [
  { title: "Book\nAppointments", icon: "calendar-outline" },
  { title: "Apply\nPermit", icon: "document-text-outline" },
  { title: "View\nVaccines", icon: "medical-outline" },
  { title: "Request\nService", icon: "construct-outline" },
  { title: "Track\nRequests", icon: "time-outline" },
  { title: "Report\nIssue", icon: "warning-outline" },
] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "Approved":
      return { bg: "#DCFCE7", text: "#15803D" };
    case "Completed":
      return { bg: "#DBEAFE", text: "#1D4ED8" };
    case "Processing":
      return { bg: "#FEF3C7", text: "#B45309" };
    default:
      return { bg: "#F1F5F9", text: "#475569" };
  }
}

function getActivityIcon(domainId: string): string {
  switch (domainId) {
    case "business":
      return "briefcase.fill";
    case "treasury":
      return "creditcard.fill";
    case "education":
      return "book.closed.fill";
    case "health":
      return "cross.case.fill";
    default:
      return "person.text.rectangle.fill";
  }
}

interface BookAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
}

const HEALTH_CENTERS = [
  "Downtown Health Clinic",
  "Westside Medical Center",
  "Northgate Hospital",
];

const SERVICE_TYPES = [
  "General Consultation",
  "Dental Checkup",
  "Pediatrics",
  "Vaccination",
];

const PREFERRED_DOCTORS = [
  "Dr. Smith",
  "Dr. Jones",
  "Dr. Emily Chen",
  "No Preference",
];

interface ApplySanitationPermitModalProps {
  visible: boolean;
  onClose: () => void;
}

const BUSINESS_CATEGORIES = [
  "Food Establishment",
  "Retail Store",
  "Manufacturing",
  "Service Business",
];

const PAYMENT_OPTIONS = ["Cash", "G-Cash", "Credit or Debit Card", "Online Banking"];

const SANITATION_REQUIREMENTS = [
  { title: "Business Registration / DTI", subtitle: "PDF or JPG format" },
  { title: "Facility Floor Plan", subtitle: "Sanitation layout plan" },
  { title: "Staff Health Cards", subtitle: "Medical clearance of workers" },
];

function formatDateInputValue(value: Date | null): string {
  if (!value) return "";
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

function formatTimeInputValue(value: Date | null): string {
  if (!value) return "";
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseTimeInputValue(value: string): Date | null {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  const result = new Date();
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function BookAppointmentModal({
  visible,
  onClose,
}: BookAppointmentModalProps) {
  const { isDarkMode } = useTheme();
  const [healthCenter, setHealthCenter] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [preferredDoctor, setPreferredDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
  const [appointmentError, setAppointmentError] = useState("");

  const openPicker = (mode: "date" | "time") => {
    setAppointmentError("");
    setPickerMode(mode);
  };

  const handleDateTimeChange = (
    mode: "date" | "time",
    event: DateTimePickerEvent,
    value?: Date,
  ) => {
    if (Platform.OS !== "ios" || event.type === "dismissed") {
      setPickerMode(null);
    }

    if (event.type !== "set" || !value) return;

    if (mode === "date") {
      setAppointmentDate(value);
    } else {
      setAppointmentTime(value);
    }
  };

  const handleSubmit = () => {
    if (!healthCenter || !serviceType || !appointmentDate || !appointmentTime) {
      setAppointmentError("Please select a health center, service, date, and time.");
      return;
    }

    console.log("Appointment booking:", {
      healthCenter,
      serviceType,
      date: appointmentDate?.toISOString() || null,
      time: appointmentTime?.toISOString() || null,
      preferredDoctor: preferredDoctor || "No Preference",
      reason,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          style={appointmentStyles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          pointerEvents="box-none"
        >
          <View style={[appointmentStyles.container, isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B" }]}>
            <View style={[appointmentStyles.header, isDarkMode && { borderBottomColor: "#3A506B" }]}>
              <Text style={[appointmentStyles.title, isDarkMode && { color: "#F8FAFC" }]}>Book Appointment</Text>
              <TouchableOpacity
                accessibilityLabel="Close appointment form"
                onPress={onClose}
                style={appointmentStyles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={appointmentStyles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[appointmentStyles.label, isDarkMode && { color: "#CBD5E1" }]}>
                Health Center <Text style={appointmentStyles.required}>*</Text>
              </Text>
              <View style={[appointmentStyles.pickerContainer, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" }]}>
                <ThemedPicker value={healthCenter} onChange={setHealthCenter} placeholder="Select a health center" options={HEALTH_CENTERS} isDarkMode={isDarkMode} />
              </View>

              <Text style={[appointmentStyles.label, isDarkMode && { color: "#CBD5E1" }]}>
                Service Type <Text style={appointmentStyles.required}>*</Text>
              </Text>
              <View style={[appointmentStyles.pickerContainer, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" }]}>
                <ThemedPicker value={serviceType} onChange={setServiceType} placeholder="Select a service" options={SERVICE_TYPES} isDarkMode={isDarkMode} />
              </View>

              <View style={appointmentStyles.dateTimeRow}>
                <View style={appointmentStyles.dateTimeField}>
                  <Text style={[appointmentStyles.label, isDarkMode && { color: "#CBD5E1" }]}>
                    Date <Text style={appointmentStyles.required}>*</Text>
                  </Text>
                  {Platform.OS === "web" ? (
                    React.createElement("input", {
                      type: "date",
                      value: formatDateInputValue(appointmentDate),
                      min: formatDateInputValue(new Date()),
                      onChange: (event: { target: { value: string } }) =>
                        setAppointmentDate(parseDateInputValue(event.target.value)),
                      style: getDateTimeInputStyle(isDarkMode),
                      "aria-label": "Appointment date",
                    })
                  ) : (
                    <TouchableOpacity
                      style={[appointmentStyles.dateTimeButton, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" }]}
                      onPress={() => openPicker("date")}
                      activeOpacity={0.8}
                    >
                      <Text style={[appointmentDate ? appointmentStyles.value : appointmentStyles.placeholder, isDarkMode && { color: appointmentDate ? "#F8FAFC" : "#94A3B8" }]}>
                        {appointmentDate ? appointmentDate.toLocaleDateString() : "Select date"}
                      </Text>
                      <Ionicons name="calendar-outline" size={18} color="#38BDF8" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={appointmentStyles.dateTimeField}>
                  <Text style={[appointmentStyles.label, isDarkMode && { color: "#CBD5E1" }]}>
                    Time <Text style={appointmentStyles.required}>*</Text>
                  </Text>
                  {Platform.OS === "web" ? (
                    React.createElement("input", {
                      type: "time",
                      value: formatTimeInputValue(appointmentTime),
                      onChange: (event: { target: { value: string } }) =>
                        setAppointmentTime(parseTimeInputValue(event.target.value)),
                      style: getDateTimeInputStyle(isDarkMode),
                      "aria-label": "Appointment time",
                    })
                  ) : (
                    <TouchableOpacity
                      style={[appointmentStyles.dateTimeButton, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" }]}
                      onPress={() => openPicker("time")}
                      activeOpacity={0.8}
                    >
                      <Text style={[appointmentTime ? appointmentStyles.value : appointmentStyles.placeholder, isDarkMode && { color: appointmentTime ? "#F8FAFC" : "#94A3B8" }]}>
                        {appointmentTime
                          ? appointmentTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                          : "Select time"}
                      </Text>
                      <Ionicons name="time-outline" size={18} color="#38BDF8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {Platform.OS !== "web" && pickerMode ? (
                <DateTimePicker
                  value={pickerMode === "date" ? appointmentDate || new Date() : appointmentTime || new Date()}
                  mode={pickerMode}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, value) => handleDateTimeChange(pickerMode, event, value)}
                  minimumDate={pickerMode === "date" ? new Date() : undefined}
                />
              ) : null}

              {appointmentError ? (
                <Text style={appointmentStyles.errorText}>{appointmentError}</Text>
              ) : null}

              <Text style={[appointmentStyles.label, isDarkMode && { color: "#CBD5E1" }]}>Preferred Doctor (Optional)</Text>
              <View style={[appointmentStyles.pickerContainer, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" }]}>
                <ThemedPicker value={preferredDoctor} onChange={setPreferredDoctor} placeholder="Choose a doctor" options={PREFERRED_DOCTORS} isDarkMode={isDarkMode} />
              </View>

              <Text style={[appointmentStyles.label, isDarkMode && { color: "#CBD5E1" }]}>Reason for Visit</Text>
              <TextInput
                style={[appointmentStyles.reasonInput, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B", color: "#F8FAFC" }]}
                placeholder="Tell us briefly how we can help"
                placeholderTextColor="#94A3B8"
                value={reason}
                onChangeText={setReason}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={appointmentStyles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={appointmentStyles.submitButtonText}>CONFIRM APPOINTMENT</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function ApplySanitationPermitModal({
  visible,
  onClose,
}: ApplySanitationPermitModalProps) {
  const { isDarkMode } = useTheme();
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [uploadedRequirements, setUploadedRequirements] = useState<Record<string, boolean>>({});

  const toggleUpload = (title: string) => {
    setUploadedRequirements((current) => ({
      ...current,
      [title]: !current[title],
    }));
  };

  const handleSubmit = () => {
    console.log("Sanitation permit application:", {
      businessName,
      businessCategory,
      businessAddress,
      requirements: uploadedRequirements,
      permitFee: "₱500.00",
      paymentMethod,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          style={permitStyles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          pointerEvents="box-none"
        >
          <View style={[permitStyles.container, isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B" }]}>
            <View style={[permitStyles.header, isDarkMode && { borderBottomColor: "#3A506B" }]}>
              <Text style={[permitStyles.title, isDarkMode && { color: "#F8FAFC" }]}>Apply Sanitation Permit</Text>
              <TouchableOpacity
                accessibilityLabel="Close sanitation permit form"
                onPress={onClose}
                style={permitStyles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={permitStyles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[permitStyles.label, isDarkMode && { color: "#CBD5E1" }]}>
                Business Name <Text style={permitStyles.required}>*</Text>
              </Text>
              <TextInput
                style={[permitStyles.input, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B", color: "#F8FAFC" }]}
                placeholder="Enter registered business name"
                placeholderTextColor="#64748B"
                value={businessName}
                onChangeText={setBusinessName}
              />

              <Text style={[permitStyles.label, isDarkMode && { color: "#CBD5E1" }]}>
                Business Category <Text style={permitStyles.required}>*</Text>
              </Text>
              <View style={[permitStyles.pickerContainer, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" }]}>
                <ThemedPicker
                  value={businessCategory}
                  onChange={setBusinessCategory}
                  placeholder="Select Business Category"
                  options={BUSINESS_CATEGORIES}
                  isDarkMode={isDarkMode}
                />
              </View>

              <Text style={[permitStyles.label, isDarkMode && { color: "#CBD5E1" }]}>
                Business Address <Text style={permitStyles.required}>*</Text>
              </Text>
              <TextInput
                style={[permitStyles.input, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B", color: "#F8FAFC" }]}
                placeholder="Building No, Street, Barangay"
                placeholderTextColor="#64748B"
                value={businessAddress}
                onChangeText={setBusinessAddress}
              />

              <Text style={[permitStyles.sectionHeader, isDarkMode && { color: "#F8FAFC" }]}>Upload Requirements</Text>
              {SANITATION_REQUIREMENTS.map((requirement) => {
                const isUploaded = Boolean(uploadedRequirements[requirement.title]);
                return (
                  <View key={requirement.title} style={permitStyles.requirementRow}>
                    <Ionicons name="document-text-outline" size={24} color="#0EA5E9" />
                    <View style={permitStyles.requirementInfo}>
                      <Text style={[permitStyles.requirementTitle, isDarkMode && { color: "#F8FAFC" }]}>{requirement.title}</Text>
                      <Text style={[permitStyles.requirementSubtitle, isDarkMode && { color: "#94A3B8" }]}>{requirement.subtitle}</Text>
                    </View>
                    <TouchableOpacity
                      style={[permitStyles.uploadButton, isUploaded && permitStyles.uploadedButton]}
                      onPress={() => toggleUpload(requirement.title)}
                      activeOpacity={0.8}
                    >
                      <Text style={permitStyles.uploadButtonText}>{isUploaded ? "Added" : "Upload"}</Text>
                      <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                );
              })}

              <Text style={[permitStyles.feeLabel, isDarkMode && { color: "#F8FAFC" }]}>Permit Fee</Text>
              <Text style={permitStyles.feeValue}>₱500.00</Text>

              <Text style={[permitStyles.label, isDarkMode && { color: "#CBD5E1" }]}>
                Payment Method <Text style={permitStyles.required}>*</Text>
              </Text>
              <View style={[permitStyles.pickerContainer, isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" }]}>
                <ThemedPicker
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  placeholder="Select Payment Option"
                  options={PAYMENT_OPTIONS}
                  isDarkMode={isDarkMode}
                />
              </View>

              <TouchableOpacity
                style={permitStyles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={permitStyles.submitButtonText}>SUBMIT APPLICATION</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const permitStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  container: {
    maxHeight: "94%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: { color: "#1E293B", fontSize: 20, fontWeight: "800" },
  closeButton: { padding: 3 },
  formContent: { padding: 20, paddingBottom: 80 },
  label: { color: "#1E293B", fontSize: 13, fontWeight: "700", marginBottom: 7, marginTop: 13 },
  required: { color: "#DC2626" },
  input: {
    height: 48,
    paddingHorizontal: 12,
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    fontSize: 13,
  },
  pickerContainer: {
    height: 50,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { color: "#1E293B", height: 50 },
  sectionHeader: { color: "#1E293B", fontSize: 16, fontWeight: "800", marginTop: 24, marginBottom: 10 },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 10,
  },
  requirementInfo: { flex: 1 },
  requirementTitle: { color: "#1E293B", fontSize: 13, fontWeight: "700" },
  requirementSubtitle: { color: "#64748B", fontSize: 11, marginTop: 3 },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: "#0EA5E9",
    borderRadius: 6,
  },
  uploadedButton: { backgroundColor: "#16A34A" },
  uploadButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  feeLabel: { color: "#1E293B", fontSize: 14, fontWeight: "800", marginTop: 22 },
  feeValue: { color: "#0EA5E9", fontSize: 25, fontWeight: "900", marginTop: 4 },
  submitButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 20,
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});

function getDateTimeInputStyle(isDarkMode: boolean) {
  return {
    boxSizing: "border-box",
    width: "100%",
    height: 50,
    padding: "0 12px",
    color: isDarkMode ? "#F8FAFC" : "#0F172A",
    backgroundColor: isDarkMode ? "#0F172A" : "#FFFFFF",
    border: `1px solid ${isDarkMode ? "#3A506B" : "#CBD5E1"}`,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "inherit",
  } as React.CSSProperties;
}

const appointmentStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  container: {
    maxHeight: "94%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: { color: "#0F172A", fontSize: 20, fontWeight: "800" },
  closeButton: { padding: 3 },
  formContent: { padding: 20, paddingBottom: 80 },
  label: { color: "#0F172A", fontSize: 13, fontWeight: "700", marginBottom: 7, marginTop: 13 },
  required: { color: "#F87171" },
  pickerContainer: {
    height: 50,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { color: "#0F172A", height: 50 },
  dateTimeRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  dateTimeField: { flex: 1 },
  dateTimeButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
  },
  placeholder: { color: "#94A3B8", fontSize: 13 },
  value: { color: "#0F172A", fontSize: 13 },
  errorText: { color: "#DC2626", fontSize: 12, marginTop: 10 },
  reasonInput: {
    height: 100,
    padding: 12,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    fontSize: 13,
  },
  submitButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#38BDF8",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});

export function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams<{
    isGuest?: string;
    email?: string;
    citizenUserId?: string;
  }>();

  const session = AuthService.getCurrentUser();
  const activeEmail = session.isGuest ? "" : params.email || session.email || "";
  const activeUserId = session.isGuest
    ? undefined
    : params.citizenUserId
      ? parseInt(params.citizenUserId, 10)
      : session.citizen_user_id || undefined;
  const isGuestMode =
    session.isGuest ||
    params.isGuest === "true" ||
    (!activeEmail && !activeUserId);

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(!isGuestMode);
  const [userProfile, setUserProfile] = useState<CitizenProfileData>({
    citizen_user_id: activeUserId || 0,
    first_name: isGuestMode ? "Guest" : "",
    middle_name: "",
    last_name: isGuestMode ? "Resident" : "",
    suffix: "",
    fullName: isGuestMode ? "Guest Resident" : "Active Citizen",
    initials: isGuestMode ? "GR" : "AC",
    email: activeEmail || (isGuestMode ? "guest@caloocan.gov.ph" : ""),
    phone: "",
    address: "",
    city: "Caloocan City",
    barangay: "",
    birthDate: "",
    civilStatus: "Registered Resident",
    citizenId: activeUserId
      ? `CIV-2026-${String(activeUserId).padStart(5, "0")}`
      : isGuestMode
        ? "CIV-GUEST-2026"
        : "CIV-2026-00001",
    status: isGuestMode ? "Guest" : "Active",
    isVerified: true,
    registryCompleted: true,
    biometricEnabled: false,
    memberSince: "2026",
    lastLogin: isGuestMode ? "Current Session (Guest Mode)" : "Just Now",
  });

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    useState(false);
  const [isSanitationPermitModalVisible, setIsSanitationPermitModalVisible] =
    useState(false);
  const [isImmunizationModalVisible, setIsImmunizationModalVisible] =
    useState(false);
  const [isWastewaterModalVisible, setIsWastewaterModalVisible] =
    useState(false);
  const [isTrackRequestsModalVisible, setIsTrackRequestsModalVisible] =
    useState(false);
  const [isHealthIssueModalVisible, setIsHealthIssueModalVisible] =
    useState(false);

  const loadProfile = async () => {
    if (isGuestMode) return;
    const emailToUse = activeEmail || userProfile.email;
    const res = await ProfileService.getProfile(
      emailToUse,
      activeUserId || userProfile.citizen_user_id,
    );
    if (res.status === "success" && res.data) {
      const data = res.data;
      setUserProfile((prev) => ({
        ...prev,
        ...data,
        status: data.status || "Active",
      }));
    }
  };

  useEffect(() => {
    async function initData() {
      if (isGuestMode) {
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      await loadProfile();
      setIsLoadingProfile(false);
    }
    initData();
  }, [isGuestMode, activeEmail, activeUserId]);

  const handleRefresh = async () => {
    if (isGuestMode) return;
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  };

  const firstName =
    userProfile.first_name ||
    (userProfile.fullName ? userProfile.fullName.split(" ")[0] : "Citizen");

  const locationLabel = userProfile.barangay
    ? `${userProfile.barangay}, Caloocan City`
    : "Caloocan City Resident";

  const dm = isDarkMode;
  const C = {
    bg: dm ? "#0B132B" : "#F6F8FA",
    surface: dm ? "#1C2541" : "#FFFFFF",
    border: dm ? "#3A506B" : "#E5E7EB",
    textPrimary: dm ? "#F8FAFC" : "#111827",
    textSecondary: dm ? "#94A3B8" : "#667085",
    blue: dm ? "#38BDF8" : "#176B87",
    blueLight: dm ? "#0F2942" : "#EBF5FB",
  };

  if (isLoadingProfile) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          !isGuestMode ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#176B87"
            />
          ) : undefined
        }
      >
        {/* TOP HERO BANNER WITH EDGE-TO-EDGE CITYHALL BACKGROUND */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={
              isDarkMode
                ? require("@/assets/images/cityhall-dark.png")
                : require("@/assets/images/cityhall.png")
            }
            style={styles.heroBackground}
            imageStyle={styles.heroImageStyle}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <Text style={[styles.heroGreetingText, { color: dm ? "#F8FAFC" : "#1E293B" }]}>
                {getGreeting()}, {firstName} 👋
              </Text>
              <Text style={[styles.heroSubText, { color: dm ? "#CBD5E1" : "#64748B" }]}>
                {locationLabel}
              </Text>
            </View>
          </ImageBackground>
        </View>


        {/* MAIN PADDED CONTAINER WITH OVERLAY CIVIC ACTIVITY CARD */}
        <View style={styles.bodyContent}>
          {/* SECTION 1: Public Announcements */}
          <View style={[styles.sectionBlock, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
                Public Announcements
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={312}
              decelerationRate="fast"
              scrollEventThrottle={16}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / 312);
                setActiveIndex(Math.max(0, Math.min(index, INITIAL_ANNOUNCEMENTS.length - 1)));
              }}
            >
              {INITIAL_ANNOUNCEMENTS.map((announcement) => (
                <TouchableOpacity
                  key={announcement.id}
                  style={[
                    styles.announcementCard,
                    { backgroundColor: C.surface, borderColor: C.border },
                  ]}
                  onPress={() => console.log(`Read more: ${announcement.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.featuredAccent} />
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredTopRow}>
                      <View style={styles.emergencyBadge}>
                        <Text style={styles.emergencyBadgeText}>
                          {announcement.category}
                        </Text>
                      </View>
                      <Text
                        style={[styles.featuredDate, { color: C.textSecondary }]}
                        numberOfLines={1}
                      >
                        {announcement.date}
                      </Text>
                    </View>
                    <Text
                      style={[styles.featuredTitle, { color: C.textPrimary }]}
                    >
                      {announcement.title}
                    </Text>
                    <Text
                      style={[styles.featuredSummary, { color: C.textSecondary }]}
                      numberOfLines={2}
                    >
                      {announcement.summary}
                    </Text>
                    <View style={styles.featuredFooter}>
                      <Text
                        style={[styles.featuredDept, { color: C.textSecondary }]}
                        numberOfLines={1}
                      >
                        {announcement.department}
                      </Text>
                      <View style={styles.readRow}>
                        <Text style={[styles.readText, { color: C.blue }]}>
                          Read more
                        </Text>
                        <IconSymbol name="chevron.right" size={13} color={C.blue} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.announcementPagination}>
              {INITIAL_ANNOUNCEMENTS.map((announcement, index) => (
                <View
                  key={announcement.id}
                  style={[
                    index === activeIndex
                      ? styles.announcementDotActive
                      : styles.announcementDot,
                    {
                      backgroundColor:
                        index === activeIndex ? "#00A3FF" : "#CBD5E1",
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* SEARCH BAR CONTAINER */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <IconSymbol
              name="magnifyingglass"
              size={20}
              color={C.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: C.textPrimary }]}
              placeholder="Search services, permits, announcements..."
              placeholderTextColor={C.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearBtn}
              >
                <Text style={[styles.clearText, { color: C.textSecondary }]}>
                  x
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsQrModalVisible(true)}
                style={styles.scanBtn}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="qrcode.viewfinder"
                  size={20}
                  color={dm ? "#38BDF8" : "#0284C7"}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* SECTION 4: SERVICE LAUNCHER */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
                Quick Actions
              </Text>
            </View>
            <View style={styles.quickActionGrid}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.title}
                  style={[
                    styles.quickActionItem,
                    { backgroundColor: dm ? "#1E293B" : C.surface, borderColor: C.border },
                  ]}
                  onPress={() => {
                    if (action.title === "Book\nAppointments") {
                      setIsAppointmentModalVisible(true);
                    } else if (action.title === "Apply\nPermit") {
                      setIsSanitationPermitModalVisible(true);
                    } else if (action.title === "View\nVaccines") {
                      setIsImmunizationModalVisible(true);
                    } else if (action.title === "Request\nService") {
                      setIsWastewaterModalVisible(true);
                    } else if (action.title === "Track\nRequests") {
                      setIsTrackRequestsModalVisible(true);
                    } else if (action.title === "Report\nIssue") {
                      setIsHealthIssueModalVisible(true);
                    } else {
                      router.push("/(tabs)/services");
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={action.icon} size={24} color={C.blue} />
                  <Text
                    style={[
                      styles.quickActionTitle,
                      { color: dm ? "#FFFFFF" : C.textPrimary },
                    ]}
                    numberOfLines={2}
                  >
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SECTION 5: MY ACTIVITY */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
                My Activity
              </Text>
            </View>
            <View
              style={[
                styles.activityCard,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
            >
              {RECENT_ACTIVITY.map((item, index) => {
                const statusColor = getStatusColor(item.status);
                const isLast = index === RECENT_ACTIVITY.length - 1;
                return (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.activityRow}
                      onPress={() => router.push("/(tabs)/tracker")}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.activityIconBox,
                          { backgroundColor: C.blueLight },
                        ]}
                      >
                        <IconSymbol
                          name={getActivityIcon(item.domainId) as any}
                          size={16}
                          color={C.blue}
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text
                          style={[styles.activityTitle, { color: C.textPrimary }]}
                          numberOfLines={1}
                        >
                          {item.serviceTitle}
                        </Text>
                        <Text
                          style={[
                            styles.activityMeta,
                            { color: C.textSecondary },
                          ]}
                        >
                          Updated {item.updatedAt}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColor.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: statusColor.text },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {!isLast && (
                      <View
                        style={[styles.rowDivider, { backgroundColor: C.border }]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

        </View>
      </ScrollView>

      <BookAppointmentModal
        visible={isAppointmentModalVisible}
        onClose={() => setIsAppointmentModalVisible(false)}
      />
      <ApplySanitationPermitModal
        visible={isSanitationPermitModalVisible}
        onClose={() => setIsSanitationPermitModalVisible(false)}
      />
      <ImmunizationRecordsScreen
        visible={isImmunizationModalVisible}
        onClose={() => setIsImmunizationModalVisible(false)}
      />
      <RequestWastewaterServiceScreen
        visible={isWastewaterModalVisible}
        onClose={() => setIsWastewaterModalVisible(false)}
      />
      <TrackRequestsScreen
        visible={isTrackRequestsModalVisible}
        onClose={() => setIsTrackRequestsModalVisible(false)}
      />
      <ReportHealthIssueScreen
        visible={isHealthIssueModalVisible}
        onClose={() => setIsHealthIssueModalVisible(false)}
      />

      {/* MODAL 1: QR PASS */}
      <Modal
        visible={isQrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.qrModalContainer,
              dm && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.qrModalHeader}>
              <Text style={[styles.qrModalTitle, dm && { color: "#F8FAFC" }]}>
                Civentral Resident Pass
              </Text>
              <TouchableOpacity
                onPress={() => setIsQrModalVisible(false)}
                style={[
                  styles.modalCloseBtn,
                  dm && { backgroundColor: "#0B132B" },
                ]}
              >
                <Text
                  style={[styles.modalCloseText, dm && { color: "#F8FAFC" }]}
                >
                  x
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.qrCodeBox,
                dm && {
                  backgroundColor: "#FFFFFF",
                  padding: 12,
                  borderRadius: 16,
                },
              ]}
            >
              <IconSymbol name="qrcode" size={180} color="#0F172A" />
            </View>
            <Text style={[styles.qrCitizenName, dm && { color: "#F8FAFC" }]}>
              {userProfile.fullName || "Citizen Resident"}
            </Text>
            <Text style={[styles.qrCitizenId, dm && { color: "#38BDF8" }]}>
              {userProfile.citizenId || "CITIZEN-PASS"}
            </Text>
            <Badge
              label={
                isGuestMode
                  ? "GUEST PASS - CALOOCAN CITY"
                  : "ACTIVE RESIDENT - CALOOCAN CITY"
              }
              variant={isGuestMode ? "neutral" : "success"}
            />
            <Text
              style={[styles.qrInstructionText, dm && { color: "#CBD5E1" }]}
            >
              Scan this QR code at City Hall entry checkpoints, Barangay Health
              Centers, or Civic Service counters.
            </Text>
            <TouchableOpacity
              style={styles.primaryModalBtn}
              onPress={() => setIsQrModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryModalBtnText}>Close Digital Pass</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ANNOUNCEMENT DETAIL */}
      <Modal
        visible={selectedAnnouncement !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalOverlay}>
          {selectedAnnouncement ? (
            <View
              style={[
                styles.announcementModalContainer,
                dm && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.qrModalHeader}>
                <Badge
                  label={selectedAnnouncement.category}
                  variant={selectedAnnouncement.badgeVariant}
                />
                <TouchableOpacity
                  onPress={() => setSelectedAnnouncement(null)}
                  style={[
                    styles.modalCloseBtn,
                    dm && { backgroundColor: "#0B132B" },
                  ]}
                >
                  <Text
                    style={[styles.modalCloseText, dm && { color: "#F8FAFC" }]}
                  >
                    x
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 380, marginVertical: 12 }}>
                <Text
                  style={[styles.ancModalTitle, dm && { color: "#F8FAFC" }]}
                >
                  {selectedAnnouncement.title}
                </Text>
                <Text style={[styles.ancModalDate, dm && { color: "#94A3B8" }]}>
                  {selectedAnnouncement.date}
                </Text>
                <Text style={[styles.ancModalDept, dm && { color: "#38BDF8" }]}>
                  Issued by: {selectedAnnouncement.department}
                </Text>
                <View
                  style={[
                    styles.ancModalDivider,
                    dm && { backgroundColor: "#3A506B" },
                  ]}
                />
                <Text style={[styles.ancModalBody, dm && { color: "#CBD5E1" }]}>
                  {selectedAnnouncement.fullBody}
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.primaryModalBtn}
                onPress={() => setSelectedAnnouncement(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryModalBtnText}>
                  Dismiss Announcement
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
