import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { useLanguage } from "@/src/context/LanguageContext";
import { useTheme } from "@/src/context/ThemeContext";
import { AuthService } from "@/src/services/auth-service";
import {
  CitizenProfileData,
  FamilyMember,
  HealthRecord,
  ProfileService,
} from "@/src/services/profile-service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles/ProfileScreen.styles";

function SkeletonItem({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const { isDarkMode } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const baseColor = isDarkMode ? "#2A3656" : "#E2E8F0";

  return (
    <Animated.View
      style={[
        {
          width: width ?? "100%",
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

function ProfileSkeletonLoading({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <View
      style={[styles.container, isDarkMode && { backgroundColor: "#0B132B" }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card Skeleton */}
        <View
          style={[
            styles.headerCard,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <SkeletonItem width={64} height={64} borderRadius={32} />
            <View style={[styles.headerInfo, { gap: 8 }]}>
              <SkeletonItem width="75%" height={22} borderRadius={6} />
              <SkeletonItem width="55%" height={14} borderRadius={4} />
              <SkeletonItem width="65%" height={14} borderRadius={4} />
            </View>
            <SkeletonItem width={50} height={50} borderRadius={12} />
          </View>
          <View style={[styles.badgesRow, { marginTop: 16 }]}>
            <SkeletonItem width={120} height={24} borderRadius={12} />
            <View style={styles.badgeSpacer} />
            <SkeletonItem width={140} height={24} borderRadius={12} />
          </View>
        </View>

        {/* Tab Switcher Skeleton */}
        <View
          style={[
            styles.tabBarContainer,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <SkeletonItem width="48%" height={38} borderRadius={10} />
          <SkeletonItem width="48%" height={38} borderRadius={10} />
        </View>

        {/* Section Card 1 Skeleton */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
            { gap: 16, padding: 18 },
          ]}
        >
          <SkeletonItem width={180} height={20} borderRadius={6} />
          <View style={{ gap: 12 }}>
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
          </View>
        </View>

        {/* Section Card 2 Skeleton */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
            { gap: 16, padding: 18, marginTop: 16 },
          ]}
        >
          <SkeletonItem width={160} height={20} borderRadius={6} />
          <View style={{ gap: 12 }}>
            <SkeletonItem height={54} borderRadius={12} />
            <SkeletonItem height={54} borderRadius={12} />
            <SkeletonItem height={54} borderRadius={12} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Privacy Policy Modal Styles ──────────────────────────────────────────────

const privacyStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#176B87",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIconRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 1,
  },
  headerCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  headerCloseBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  scrollReminderBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  scrollReminderIcon: {
    fontSize: 14,
    color: "#D97706",
  },
  scrollReminderText: {
    fontSize: 12,
    color: "#92400E",
    flex: 1,
  },
  scrollCompleteBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#BBF7D0",
  },
  scrollCompleteIcon: {
    fontSize: 14,
    color: "#16A34A",
    fontWeight: "700",
  },
  scrollCompleteText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
    flex: 1,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 20,
  },
  introCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    gap: 6,
  },
  introTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 19,
  },
  introSub: {
    fontSize: 12,
    color: "#176B87",
    lineHeight: 17,
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#176B87",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionSummary: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    fontStyle: "italic",
  },
  bulletRow: {
    flexDirection: "row",
    gap: 6,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
    lineHeight: 18,
  },
  acknowledgmentCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 14,
    gap: 8,
  },
  acknowledgmentIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  acknowledgmentIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  acknowledgmentCheckIcon: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  acknowledgmentTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803D",
  },
  acknowledgmentBody: {
    fontSize: 12,
    color: "#166534",
    lineHeight: 18,
  },
  acknowledgmentBold: {
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  footerCancelText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  footerAgreeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#176B87",
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  footerAgreeBtnDisabled: {
    backgroundColor: "#E2E8F0",
  },
  footerAgreeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

const languageStyles = StyleSheet.create({
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  optionCardSelected: {
    backgroundColor: "#F0FDF4",
    borderColor: "#176B87",
  },
  flagBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  flagText: {
    fontSize: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  sublabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#176B87",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#176B87",
  },
});

export function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    isGuest?: string;
    email?: string;
    phone?: string;
    citizenUserId?: string;
  }>();

  // Check active session or params
  const session = AuthService.getCurrentUser();
  const activeEmail = session.isGuest
    ? ""
    : params.email || session.email || "";
  const activePhone = session.isGuest
    ? ""
    : params.phone || session.phone || "";
  const activeUserId = session.isGuest
    ? undefined
    : params.citizenUserId
      ? parseInt(params.citizenUserId, 10)
      : session.citizen_user_id || undefined;

  // Is Guest if session isGuest OR explicitly passed isGuest=true OR if no active contact/id is found
  const isGuestMode =
    session.isGuest ||
    params.isGuest === "true" ||
    (!activeEmail && !activePhone && !activeUserId);

  // Active sub-tab state: 'overview' | 'settings'
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview",
  );

  // Loading & Refresh State
  const [isLoadingApi, setIsLoadingApi] = useState(!isGuestMode);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User Profile Data state initialized with real dynamic state (No hardcoded mock data)
  const [userProfile, setUserProfile] = useState<CitizenProfileData>({
    citizen_user_id: activeUserId || 0,
    first_name: isGuestMode ? "Guest" : "",
    middle_name: "",
    last_name: isGuestMode ? "Resident" : "",
    suffix: "",
    fullName: isGuestMode ? "Guest Resident" : "",
    initials: isGuestMode ? "GR" : "",
    email: activeEmail || (isGuestMode ? "guest@caloocan.gov.ph" : ""),
    phone: "",
    address: "",
    city: "Caloocan City",
    barangay: "",
    birthDate: "",
    civilStatus: "",
    citizenId: activeUserId
      ? `CIV-2026-${String(activeUserId).padStart(5, "0")}`
      : isGuestMode
        ? "CIV-GUEST-2026"
        : "",
    status: isGuestMode ? "Guest" : "Active",
    isVerified: true,
    registryCompleted: true,
    biometricEnabled: false,
    memberSince: "",
    lastLogin: isGuestMode ? "Current Session (Guest Mode)" : "",
  });

  // Settings State, Theme & Language
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { language, setLanguage, labels } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "tl">(language);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(
    userProfile.biometricEnabled,
  );
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(true);
  const [sosAlertsEnabled, setSosAlertsEnabled] = useState(true);

  // Modals & Loading
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPrivacyPolicyModalVisible, setIsPrivacyPolicyModalVisible] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [hasAgreedToPolicy, setHasAgreedToPolicy] = useState(false);

  // Temporary Edit Form State
  const [editFirstName, setEditFirstName] = useState(userProfile.first_name || "");
  const [editLastName, setEditLastName] = useState(userProfile.last_name || "");
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editAddress, setEditAddress] = useState(userProfile.address);
  const [editBarangay, setEditBarangay] = useState(userProfile.barangay || "");
  const [editBirthDate, setEditBirthDate] = useState(userProfile.birthDate || "");
  const [editCivilStatus, setEditCivilStatus] = useState(userProfile.civilStatus || "Single");
  const [isSaving, setIsSaving] = useState(false);

  // Family Members & Dependents State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(ProfileService.getInitialFamilyMembers());
  const [isAddFamilyModalVisible, setIsAddFamilyModalVisible] = useState(false);
  const [famFullName, setFamFullName] = useState("");
  const [famRelationship, setFamRelationship] = useState<'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Dependent'>('Child');
  const [famBirthDate, setFamBirthDate] = useState("");
  const [famGender, setFamGender] = useState<'Male' | 'Female'>('Female');
  const [famCitizenId, setFamCitizenId] = useState("");
  const [famContactNumber, setFamContactNumber] = useState("");

  // Health Records & History State
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(ProfileService.getInitialHealthRecords());
  const [selectedHealthRecord, setSelectedHealthRecord] = useState<HealthRecord | null>(null);

  // Accordion / Dropdown Expanded States
  const [isFamilyExpanded, setIsFamilyExpanded] = useState(false);
  const [isHealthExpanded, setIsHealthExpanded] = useState(false);

  // Change Password Form State
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState<
    string | null
  >(null);
  const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);

  // New Password Strength Evaluation
  const newHasMinLength = newPassword.length >= 8;
  const newHasUpper = /[A-Z]/.test(newPassword);
  const newHasLower = /[a-z]/.test(newPassword);
  const newHasNumber = /[0-9]/.test(newPassword);
  const newHasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const getNewStrengthLevel = (): "weak" | "medium" | "strong" | "" => {
    if (newPassword.length === 0) return "";
    let score = 0;
    if (newHasMinLength) score += 1;
    if (newHasUpper && newHasLower) score += 1;
    if (newHasNumber) score += 1;
    if (newHasSymbol) score += 1;

    if (
      score >= 4 &&
      newHasMinLength &&
      newHasUpper &&
      newHasLower &&
      newHasNumber &&
      newHasSymbol
    ) {
      return "strong";
    } else if (score >= 3 && newHasMinLength) {
      return "medium";
    } else {
      return "weak";
    }
  };

  const newStrengthLevel = getNewStrengthLevel();

  const handleChangePassword = async () => {
    setChangePasswordErrorMessage(null);

    if (!currentPassword) {
      setChangePasswordErrorMessage("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setChangePasswordErrorMessage("Please enter a new password.");
      return;
    }

    if (newStrengthLevel !== "strong") {
      setChangePasswordErrorMessage("New password must be STRONG to be saved.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordErrorMessage("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    const response = await AuthService.changePassword({
      citizenUserId: userProfile.citizen_user_id || 0,
      email: userProfile.email,
      currentPassword,
      newPassword,
    });
    setIsChangingPassword(false);

    if (response.status === "success") {
      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsChangePasswordModalVisible(false);

      setIsSuccessToastVisible(true);
      setTimeout(() => {
        setIsSuccessToastVisible(false);
      }, 2500);
    } else {
      setChangePasswordErrorMessage(
        response.message || "Failed to update password.",
      );
    }
  };

  // 1. Fetch Profile Data from PHP API (get-profile.php) - Skip if Guest Mode
  const fetchProfileFromApi = async () => {
    if (isGuestMode) return;

    const identifierToUse =
      activeEmail || activePhone || userProfile.email || userProfile.phone;
    const response = await ProfileService.getProfile(
      identifierToUse,
      activeUserId || userProfile.citizen_user_id,
      activePhone,
    );

    if (response.status === "success" && response.data) {
      const data = response.data;
      setUserProfile((prev) => ({
        ...prev,
        ...data,
        fullName:
          data.fullName ||
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          prev.fullName ||
          "Civentral Citizen",
        initials:
          data.initials ||
          (data.first_name
            ? data.first_name.charAt(0).toUpperCase()
            : prev.initials || "CC"),
        status: data.status || "Active",
        isVerified: true,
        registryCompleted: true,
      }));
      if (response.data.biometricEnabled !== undefined) {
        setBiometricsEnabled(response.data.biometricEnabled);
      }
    }
  };

  useEffect(() => {
    async function loadData() {
      if (isGuestMode) {
        setIsLoadingApi(false);
        return;
      }
      setIsLoadingApi(true);
      await fetchProfileFromApi();
      setIsLoadingApi(false);
    }
    loadData();
  }, [isGuestMode, activeEmail, activeUserId]);

  const handleRefresh = async () => {
    if (isGuestMode) return;
    setIsRefreshing(true);
    await fetchProfileFromApi();
    setIsRefreshing(false);
  };

  // 2. Open Edit Profile Modal with values synced
  const handleOpenEditModal = () => {
    setEditFirstName(userProfile.first_name || "");
    setEditLastName(userProfile.last_name || "");
    setEditPhone(userProfile.phone || "");
    setEditEmail(userProfile.email || "");
    setEditAddress(userProfile.address || "");
    setEditBarangay(userProfile.barangay || "");
    setEditBirthDate(userProfile.birthDate || "");
    setEditCivilStatus(userProfile.civilStatus || "Single");
    setIsEditProfileModalVisible(true);
  };

  // 3. Add Family Member Handler
  const handleAddFamilyMember = () => {
    if (!famFullName.trim()) {
      Alert.alert("Missing Information", "Please enter the family member's full name.");
      return;
    }
    const newMember: FamilyMember = {
      id: `FAM-${String(familyMembers.length + 1).padStart(3, "0")}`,
      fullName: famFullName.trim(),
      relationship: famRelationship,
      birthDate: famBirthDate.trim() || "2020-01-01",
      gender: famGender,
      citizenId: famCitizenId.trim() || undefined,
      contactNumber: famContactNumber.trim() || undefined,
    };
    setFamilyMembers((prev) => [newMember, ...prev]);
    setFamFullName("");
    setFamBirthDate("");
    setFamCitizenId("");
    setFamContactNumber("");
    setIsAddFamilyModalVisible(false);
    Alert.alert("Family Member Added", `${newMember.fullName} has been added as ${newMember.relationship}.`);
  };

  // 4. Update Profile to API & Local State
  const handleSaveProfile = async () => {
    const updatedFirstName = editFirstName.trim();
    const updatedLastName = editLastName.trim();
    const updatedPhone = editPhone.trim();
    const updatedEmail = editEmail.trim();
    const updatedAddress = editAddress.trim();
    const updatedBarangay = editBarangay.trim();
    const updatedBirthDate = editBirthDate.trim();
    const updatedCivilStatus = editCivilStatus.trim();

    if (!updatedFirstName || !updatedLastName) {
      Alert.alert(
        labels.missingInfoTitle || "Missing Information",
        labels.missingInfoMsg || "Please enter both your First Name and Last Name."
      );
      return;
    }

    setIsSaving(true);

    const updatedFullName = `${updatedFirstName} ${updatedLastName}`.trim() || userProfile.fullName;
    const updatedInitials = updatedFirstName ? updatedFirstName.charAt(0).toUpperCase() : (userProfile.initials || "GR");

    setUserProfile((prev) => ({
      ...prev,
      first_name: updatedFirstName || prev.first_name,
      last_name: updatedLastName || prev.last_name,
      fullName: updatedFullName,
      initials: updatedInitials,
      phone: updatedPhone,
      email: updatedEmail,
      address: updatedAddress,
      barangay: updatedBarangay,
      birthDate: updatedBirthDate,
      civilStatus: updatedCivilStatus,
    }));

    if (!isGuestMode) {
      await ProfileService.updateProfile({
        citizen_user_id: userProfile.citizen_user_id,
        first_name: updatedFirstName,
        last_name: updatedLastName,
        email: updatedEmail,
        phone: updatedPhone,
        address: updatedAddress,
        barangay: updatedBarangay,
        birthDate: updatedBirthDate,
        civilStatus: updatedCivilStatus,
      });
    }

    setIsSaving(false);
    setIsEditProfileModalVisible(false);

    Alert.alert(
      labels.profileUpdatedTitle || "Profile Updated",
      labels.profileUpdatedMsg || "Your personal details and profile information have been updated.",
    );
  };


  const handleSignOut = async () => {
    if (isGuestMode) {
      setIsLoggingOut(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      AuthService.clearCurrentUser();
      setIsLoggingOut(false);
      router.replace("/(auth)");
      return;
    }
    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    AuthService.clearCurrentUser();
    setIsLoggingOut(false);
    setIsLogoutModalVisible(false);
    router.replace("/(auth)");
  };

  if (isLoadingApi) {
    return <ProfileSkeletonLoading isDarkMode={isDarkMode} />;
  }

  return (
    <View
      style={[styles.container, isDarkMode && { backgroundColor: "#0B132B" }]}
    >
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
        {/* Top Citizen ID Header Card */}
        <View
          style={[
            styles.headerCard,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {userProfile.initials || (isGuestMode ? "GR" : "...")}
              </Text>
              <View
                style={[
                  styles.onlineBadgeDot,
                  isGuestMode && styles.guestBadgeDot,
                ]}
              />
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text
                  style={[
                    styles.userNameText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {userProfile.fullName || "Loading Profile..."}
                </Text>
              </View>
              {userProfile.citizenId ? (
                <Text
                  style={[
                    styles.citizenIdText,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  ID: {userProfile.citizenId}
                </Text>
              ) : null}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <IconSymbol
                  name="location.fill"
                  size={12}
                  color="#176B87"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.barangayText,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  {userProfile.barangay
                    ? `${userProfile.barangay}, Caloocan City`
                    : "Caloocan City Resident"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.qrHeaderBtn,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: "#3A506B",
                },
              ]}
              onPress={() => setIsQrModalVisible(true)}
              activeOpacity={0.8}
            >
              <IconSymbol name="qrcode" size={24} color="#176B87" />
              <Text style={styles.qrBtnLabel}>QR ID</Text>
            </TouchableOpacity>
          </View>

          {/* Status Badges */}
          <View style={styles.badgesRow}>
            <Badge
              label={
                isGuestMode
                  ? "GUEST USER"
                  : `${(userProfile.status || "Active").toUpperCase()} RESIDENT`
              }
              variant={isGuestMode ? "neutral" : "success"}
            />
            <View style={styles.badgeSpacer} />
            <Badge
              label={
                isGuestMode
                  ? "TEMPORARY SESSION"
                  : userProfile.memberSince
                    ? `MEMBER SINCE ${userProfile.memberSince.toUpperCase()}`
                    : "REGISTERED CITIZEN"
              }
              variant="neutral"
            />
          </View>
        </View>

        {/* Tab Navigation Controls (Overview and Settings only) */}
        <View
          style={[
            styles.tabBarContainer,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "overview" &&
                (isDarkMode
                  ? { backgroundColor: "#176B87" }
                  : styles.tabButtonActive),
            ]}
            onPress={() => setActiveTab("overview")}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconSymbol
                name="person.crop.circle.fill"
                size={16}
                color={
                  activeTab === "overview"
                    ? isDarkMode
                      ? "#FFFFFF"
                      : "#176B87"
                    : isDarkMode
                      ? "#94A3B8"
                      : "#64748B"
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "overview" && styles.tabButtonTextActive,
                  isDarkMode && {
                    color: activeTab === "overview" ? "#FFFFFF" : "#E2E8F0",
                    fontWeight: "700",
                  },
                ]}
              >
                {labels.overviewTab}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "settings" &&
                (isDarkMode
                  ? { backgroundColor: "#176B87" }
                  : styles.tabButtonActive),
            ]}
            onPress={() => setActiveTab("settings")}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconSymbol
                name="gearshape.fill"
                size={16}
                color={
                  activeTab === "settings"
                    ? isDarkMode
                      ? "#FFFFFF"
                      : "#176B87"
                    : isDarkMode
                      ? "#94A3B8"
                      : "#64748B"
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "settings" && styles.tabButtonTextActive,
                  isDarkMode && {
                    color: activeTab === "settings" ? "#FFFFFF" : "#E2E8F0",
                    fontWeight: "700",
                  },
                ]}
              >
                {labels.settingsTab}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {isLoadingApi && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#176B87" />
            <Text style={styles.loadingText}>
              Loading profile from get-profile.php...
            </Text>
          </View>
        ) : null}

        {/* TAB CONTENT: 1. OVERVIEW */}
        {activeTab === "overview" && (
          <View style={styles.sectionStack}>
            {/* Personal Details Card */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <IconSymbol name="person.fill" size={20} color="#176B87" />
                  <Text
                    style={[
                      styles.cardTitle,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {labels.personalInformation}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleOpenEditModal}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.editIconBadge,
                      isDarkMode && { backgroundColor: "#176B87" },
                    ]}
                  >
                    <IconSymbol name="pencil" size={14} color="#FFFFFF" />
                    <Text
                      style={[
                        styles.editText,
                        isDarkMode && { color: "#FFFFFF" },
                      ]}
                    >
                      {labels.editProfile}
                    </Text>
                  </View>
                </TouchableOpacity>

              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <IconSymbol
                    name="envelope.fill"
                    size={16}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      {labels.emailAddress}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.email || labels.notProvided}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoDivider,
                    isDarkMode && { backgroundColor: "#3A506B" },
                  ]}
                />

                <View style={styles.infoRow}>
                  <IconSymbol
                    name="phone.fill"
                    size={16}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      {labels.mobileNumber}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.phone || labels.notProvided}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoDivider,
                    isDarkMode && { backgroundColor: "#3A506B" },
                  ]}
                />

                <View style={styles.infoRow}>
                  <IconSymbol
                    name="location.fill"
                    size={16}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      {labels.registeredAddress}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.address
                        ? userProfile.address
                        : labels.notSetServices}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoDivider,
                    isDarkMode && { backgroundColor: "#3A506B" },
                  ]}
                />

                <View style={styles.twoColumnRow}>
                  <View style={styles.columnHalf}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      {labels.barangay || "Barangay"}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.barangay || "Barangay 171"}
                    </Text>
                  </View>
                  <View style={styles.columnHalf}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      {labels.civilStatus || "Civil Status"}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.civilStatus || "Single"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoDivider,
                    isDarkMode && { backgroundColor: "#3A506B" },
                  ]}
                />

                <View style={styles.twoColumnRow}>
                  <View style={styles.columnHalf}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      {labels.lastActiveLogin}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {isGuestMode ? labels.currentSessionGuest : (userProfile.lastLogin || "N/A")}
                    </Text>
                  </View>
                  <View style={styles.columnHalf}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      {labels.registryStatus}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {isGuestMode ? labels.guestSession : "Active (Verified)"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Family Members Card — Accordion */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              {/* Tappable header row acts as the toggle */}
              <TouchableOpacity
                onPress={() => setIsFamilyExpanded((prev) => !prev)}
                activeOpacity={0.75}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <IconSymbol name="person.2.fill" size={20} color="#176B87" />
                    <Text style={[styles.cardTitle, isDarkMode && { color: "#F8FAFC" }]}>
                      {labels.familyMembersTitle || "Family Members & Dependents"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={[
                        {
                          backgroundColor: isDarkMode ? "#0F2942" : "#E0F2FE",
                          borderRadius: 10,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#176B87" }}>
                        {familyMembers.length}
                      </Text>
                    </View>
                    <IconSymbol
                      name={isFamilyExpanded ? "chevron.up" : "chevron.down"}
                      size={16}
                      color={isDarkMode ? "#94A3B8" : "#64748B"}
                    />
                  </View>
                </View>
                <Text style={[{ fontSize: 12, color: "#64748B", marginTop: 2 }, isDarkMode && { color: "#94A3B8" }]}>
                  {isFamilyExpanded
                    ? (labels.familyMembersSubtitle || "Registered family members linked to your citizen account.")
                    : `${familyMembers.length} registered member${familyMembers.length !== 1 ? "s" : ""} — tap to expand`}
                </Text>
              </TouchableOpacity>

              {/* Expanded content */}
              {isFamilyExpanded && (
                <View style={{ marginTop: 14 }}>
                  <View style={[styles.infoDivider, isDarkMode && { backgroundColor: "#3A506B" }, { marginBottom: 14 }]} />

                  {familyMembers.length === 0 ? (
                    <Text style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", textAlign: "center", paddingVertical: 12 }}>
                      {labels.noFamilyMembers || "No Family Members Registered"}
                    </Text>
                  ) : (
                    familyMembers.map((member, index) => (
                      <View key={member.id}>
                        {index > 0 && (
                          <View style={[styles.infoDivider, isDarkMode && { backgroundColor: "#3A506B" }, { marginVertical: 10 }]} />
                        )}
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: isDarkMode ? "#0F2942" : "#E0F2FE",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 12,
                              }}
                            >
                              <IconSymbol
                                name={member.relationship === "Spouse" ? "heart.fill" : member.relationship === "Child" ? "person.crop.circle.fill" : "person.fill"}
                                size={18}
                                color="#176B87"
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[{ fontSize: 15, fontWeight: "700", color: "#0F172A" }, isDarkMode && { color: "#F8FAFC" }]}>
                                {member.fullName}
                              </Text>
                              <Text style={[{ fontSize: 12, color: "#64748B", marginTop: 2 }, isDarkMode && { color: "#94A3B8" }]}>
                                {member.birthDate} • {member.gender}{member.citizenId ? ` • ${member.citizenId}` : ""}
                              </Text>
                            </View>
                          </View>
                          <Badge
                            variant={member.relationship === "Spouse" ? "info" : member.relationship === "Child" ? "success" : "neutral"}
                            label={member.relationship}
                          />
                        </View>
                      </View>
                    ))
                  )}

                  {/* Add Member Button inside expanded content */}
                  <TouchableOpacity
                    onPress={() => setIsAddFamilyModalVisible(true)}
                    activeOpacity={0.7}
                    style={{
                      marginTop: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderStyle: "dashed",
                      borderColor: isDarkMode ? "#3A506B" : "#94C5D1",
                      backgroundColor: isDarkMode ? "#0B132B" : "#F0F9FF",
                    }}
                  >
                    <IconSymbol name="plus.circle.fill" size={15} color="#176B87" />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#176B87" }}>
                      {labels.addFamilyMember || "Add Family Member"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Health Records Card — Accordion */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              {/* Tappable header row acts as the toggle */}
              <TouchableOpacity
                onPress={() => setIsHealthExpanded((prev) => !prev)}
                activeOpacity={0.75}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <IconSymbol name="cross.case.fill" size={20} color="#176B87" />
                    <Text style={[styles.cardTitle, isDarkMode && { color: "#F8FAFC" }]}>
                      {labels.healthRecordsTitle || "My Health Records & Immunizations"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        backgroundColor: isDarkMode ? "#173B3A" : "#DCFCE7",
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#16A34A" }}>
                        {healthRecords.length}
                      </Text>
                    </View>
                    <IconSymbol
                      name={isHealthExpanded ? "chevron.up" : "chevron.down"}
                      size={16}
                      color={isDarkMode ? "#94A3B8" : "#64748B"}
                    />
                  </View>
                </View>
                <Text style={[{ fontSize: 12, color: "#64748B", marginTop: 2 }, isDarkMode && { color: "#94A3B8" }]}>
                  {isHealthExpanded
                    ? (labels.healthRecordsSubtitle || "Verified medical checkups, immunizations, and clinical clearances.")
                    : `${healthRecords.length} record${healthRecords.length !== 1 ? "s" : ""} on file — tap to expand`}
                </Text>
              </TouchableOpacity>

              {/* Expanded content */}
              {isHealthExpanded && (
                <View style={{ marginTop: 14 }}>
                  <View style={[styles.infoDivider, isDarkMode && { backgroundColor: "#3A506B" }, { marginBottom: 14 }]} />

                  {healthRecords.length === 0 ? (
                    <Text style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", textAlign: "center", paddingVertical: 12 }}>
                      {labels.noHealthRecords || "No Health Records Found"}
                    </Text>
                  ) : (
                    healthRecords.map((record, index) => (
                      <View key={record.id}>
                        {index > 0 && (
                          <View style={[styles.infoDivider, isDarkMode && { backgroundColor: "#3A506B" }, { marginVertical: 10 }]} />
                        )}
                        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                          <View style={{ flexDirection: "row", alignItems: "flex-start", flex: 1, marginRight: 8 }}>
                            <View
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                backgroundColor: isDarkMode ? "#173B3A" : "#DCFCE7",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                                marginTop: 2,
                              }}
                            >
                              <IconSymbol name="doc.text.fill" size={16} color="#16A34A" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[{ fontSize: 14, fontWeight: "700", color: "#0F172A" }, isDarkMode && { color: "#F8FAFC" }]}>
                                {record.title}
                              </Text>
                              <Text style={[{ fontSize: 12, color: "#64748B", marginTop: 2 }, isDarkMode && { color: "#94A3B8" }]}>
                                {record.facility} • {record.date}
                              </Text>
                              {record.doctor ? (
                                <Text style={[{ fontSize: 11, color: "#176B87", marginTop: 2, fontWeight: "600" }, isDarkMode && { color: "#38BDF8" }]}>
                                  👨‍⚕️ {record.doctor}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                          <View style={{ alignItems: "flex-end", gap: 6 }}>
                            <Badge
                              variant={record.status === "Verified" ? "success" : "info"}
                              label={record.status}
                            />
                            <TouchableOpacity
                              onPress={() => setSelectedHealthRecord(record)}
                              activeOpacity={0.7}
                              style={{
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderRadius: 6,
                                backgroundColor: isDarkMode ? "#0F2942" : "#F0F9FF",
                              }}
                            >
                              <Text style={{ fontSize: 11, fontWeight: "700", color: "#176B87" }}>
                                {labels.viewHealthDetails || "Details →"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>


            {/* Digital Citizen ID Card Preview (Located Bottom of Personal Info) */}
            <View
              style={[
                styles.citizenIdCard,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <View style={styles.citizenIdHeader}>
                <View style={styles.idHeaderRow}>
                  <Text style={styles.idRepublicText}>
                    {labels.republicOfPhilippines}
                  </Text>
                  <Text style={styles.idCityText}>
                    {labels.cityGovernmentOfCaloocan}
                  </Text>
                </View>
                <Text style={styles.idCardTitle}>
                  {labels.digitalCitizenResidentCard}
                </Text>
              </View>

              <View style={[styles.idBodyRow, isDarkMode && { backgroundColor: "#1C2541" }]}>
                <View style={styles.idPhotoBox}>
                  <Text style={styles.idPhotoText}>
                    {userProfile.initials || (isGuestMode ? "GR" : "...")}
                  </Text>
                  <View style={styles.idCheckBadge}>
                    <IconSymbol
                      name="checkmark.seal.fill"
                      size={14}
                      color="#16A34A"
                    />
                  </View>
                </View>

                <View style={styles.idInfoCol}>
                  <Text style={[styles.idLabel, isDarkMode && { color: "#94A3B8" }]}>{labels.fullNameCaps}</Text>
                  <Text style={[styles.idValueName, isDarkMode && { color: "#F8FAFC" }]}>
                    {userProfile.fullName || "Citizen Resident"}
                  </Text>

                  <Text style={[styles.idLabel, { marginTop: 4 }, isDarkMode && { color: "#94A3B8" }]}>
                    {labels.citizenIdNoCaps}
                  </Text>
                  <Text style={styles.idValueHighlight}>
                    {userProfile.citizenId || "Pending Generation"}
                  </Text>

                  <Text style={[styles.idLabel, { marginTop: 4 }, isDarkMode && { color: "#94A3B8" }]}>
                    {labels.barangayResidenceCaps}
                  </Text>
                  <Text style={[styles.idValueSub, isDarkMode && { color: "#CBD5E1" }]}>
                    {userProfile.barangay
                      ? `${userProfile.barangay}, Caloocan City`
                      : "Caloocan City Resident"}
                  </Text>
                </View>
              </View>

              {/* Complete ID Action CTA */}
              <View
                style={[
                  styles.idFooterBanner,
                  isDarkMode && {
                    backgroundColor: "#0F2942",
                    borderColor: "#176B87",
                  },
                ]}
              >
                <View style={styles.idFooterTextStack}>
                  <Text style={[styles.idFooterNoticeTitle, isDarkMode && { color: "#F8FAFC" }]}>
                    {labels.needCompleteVerificationTitle}
                  </Text>
                  <Text style={[styles.idFooterNoticeSub, isDarkMode && { color: "#CBD5E1" }]}>
                    {labels.needCompleteVerificationSub}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.finishIdBtn}
                  onPress={() => router.push("/(tabs)/services" as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.finishIdBtnText}>
                    {labels.completeCitizenIdBtn}
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* TAB CONTENT: 2. SETTINGS & SECURITY */}
        {activeTab === "settings" && (
          <View style={styles.sectionStack}>
            {/* App Appearance & Theme (Dark & Light Mode) */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {labels.appearanceAndTheme}
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingTextStack}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol
                      name={isDarkMode ? "moon.stars.fill" : "sun.max.fill"}
                      size={18}
                      color={isDarkMode ? "#A855F7" : "#F59E0B"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {isDarkMode ? labels.darkMode : labels.lightMode}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingSub,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    {isDarkMode ? labels.darkModeSub : labels.lightModeSub}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{
                    false: isDarkMode ? "#334155" : "#CBD5E1",
                    true: isDarkMode ? "#38BDF8" : "#176B87",
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Account & Security */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {labels.securityAndBiometrics}
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingTextStack}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol
                      name="fingerprint"
                      size={18}
                      color={isDarkMode ? "#38BDF8" : "#176B87"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {labels.biometricSignIn}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingSub,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    {labels.biometricSignInSub}
                  </Text>
                </View>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={setBiometricsEnabled}
                  trackColor={{
                    false: isDarkMode ? "#334155" : "#CBD5E1",
                    true: isDarkMode ? "#38BDF8" : "#176B87",
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <TouchableOpacity
                style={styles.settingActionRow}
                onPress={() => setIsChangePasswordModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeftIcon}>
                  <IconSymbol
                    name="lock.fill"
                    size={18}
                    color={isDarkMode ? "#38BDF8" : "#176B87"}
                  />
                  <Text
                    style={[
                      styles.settingActionText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {labels.changeAccountPassword}
                  </Text>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={18}
                  color={isDarkMode ? "#64748B" : "#94A3B8"}
                />
              </TouchableOpacity>
            </View>

            {/* Notifications */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {labels.notificationsAndAlerts}
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingTextStack}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol
                      name="bell.fill"
                      size={18}
                      color={isDarkMode ? "#38BDF8" : "#176B87"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {labels.cityPushNotifications}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingSub,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    {labels.cityPushNotificationsSub}
                  </Text>
                </View>
                <Switch
                  value={pushNotificationsEnabled}
                  onValueChange={setPushNotificationsEnabled}
                  trackColor={{
                    false: isDarkMode ? "#334155" : "#CBD5E1",
                    true: isDarkMode ? "#38BDF8" : "#176B87",
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <View style={styles.settingRow}>
                <View style={styles.settingTextStack}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol
                      name="exclamationmark.triangle.fill"
                      size={18}
                      color="#EF4444"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {labels.emergencySosBroadcasts}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingSub,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    {labels.emergencySosBroadcastsSub}
                  </Text>
                </View>
                <Switch
                  value={sosAlertsEnabled}
                  onValueChange={setSosAlertsEnabled}
                  trackColor={{
                    false: isDarkMode ? "#334155" : "#CBD5E1",
                    true: "#DC2626",
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* App Info & Legal */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {labels.supportAboutTitle}
              </Text>

              <TouchableOpacity
                style={styles.settingActionRow}
                onPress={() =>
                  Alert.alert(
                    "City Hall Support Hotline",
                    "Connecting to Caloocan City Citizen Desk: (02) 8888-CALOOCAN",
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.settingLeftIcon}>
                  <IconSymbol
                    name="help.circle.fill"
                    size={18}
                    color={isDarkMode ? "#38BDF8" : "#176B87"}
                  />
                  <Text
                    style={[
                      styles.settingActionText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    City Hall Citizen Help Desk
                  </Text>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={18}
                  color={isDarkMode ? "#64748B" : "#94A3B8"}
                />
              </TouchableOpacity>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <TouchableOpacity
                style={styles.settingActionRow}
                onPress={() => {
                  setHasScrolledToEnd(false);
                  setIsPrivacyPolicyModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeftIcon}>
                  <IconSymbol
                    name="shield.fill"
                    size={18}
                    color={isDarkMode ? "#38BDF8" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.settingActionText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {labels.privacyPolicy}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              {/* Language Preference Row */}
              <TouchableOpacity
                style={styles.settingActionRow}
                onPress={() => setIsLanguageModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeftIcon}>
                  <IconSymbol
                    name="globe"
                    size={18}
                    color={isDarkMode ? "#38BDF8" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.settingActionText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {labels.appLanguage}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 13, color: isDarkMode ? "#38BDF8" : "#176B87", fontWeight: "600" }}>
                    {language === "en" ? labels.englishLabel : labels.tagalogLabel}
                  </Text>
                  <IconSymbol name="chevron.right" size={18} color="#94A3B8" />
                </View>
              </TouchableOpacity>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <View style={styles.versionRow}>
                <Text
                  style={[
                    styles.versionLabel,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  Civentral Citizen App
                </Text>
                <Text
                  style={[
                    styles.versionValue,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  v2.4.1 (Build 2026)
                </Text>
              </View>
            </View>

            {/* Sign Out / Exit Guest Mode Button */}
            <TouchableOpacity
              style={[styles.signOutBtn, isDarkMode && { backgroundColor: "#451A1A", borderColor: "#7F1D1D" }]}
              onPress={handleSignOut}
              activeOpacity={0.85}
            >
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={20}
                color="#EF4444"
              />
              <Text style={styles.signOutBtnText}>
                {isGuestMode
                  ? "Exit Guest Mode / Sign In"
                  : "Log Out of Civentral"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: QR CODE FULLSCREEN */}
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
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.qrModalHeader}>
              <Text
                style={[
                  styles.qrModalTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Civentral Resident Pass
              </Text>
              <TouchableOpacity
                onPress={() => setIsQrModalVisible(false)}
                activeOpacity={0.7}
                style={[
                  styles.closeBtn,
                  isDarkMode && { backgroundColor: "#0B132B" },
                ]}
              >
                <Text
                  style={[
                    styles.closeBtnText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.qrCodeBox,
                isDarkMode && {
                  backgroundColor: "#FFFFFF",
                  padding: 12,
                  borderRadius: 16,
                },
              ]}
            >
              <IconSymbol name="qrcode" size={180} color="#0F172A" />
            </View>

            <Text
              style={[styles.qrCitizenName, isDarkMode && { color: "#F8FAFC" }]}
            >
              {userProfile.fullName || "Citizen Resident"}
            </Text>
            <Text
              style={[styles.qrCitizenId, isDarkMode && { color: "#38BDF8" }]}
            >
              {userProfile.citizenId || "CITIZEN-PASS"}
            </Text>
            <Badge
              label={
                isGuestMode
                  ? "GUEST PASS • CALOOCAN CITY"
                  : "ACTIVE RESIDENT • CALOOCAN CITY"
              }
              variant={isGuestMode ? "neutral" : "success"}
            />

            <Text
              style={[styles.qrInstruction, isDarkMode && { color: "#CBD5E1" }]}
            >
              Scan this QR code at City Hall entry points, Barangay Health
              Centers, or Civic Service counters.
            </Text>

            <TouchableOpacity
              style={styles.qrCloseActionBtn}
              onPress={() => setIsQrModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.qrCloseActionText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: LOGOUT CONFIRMATION */}
      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.logoutOverlay}>
          <View
            style={[
              styles.logoutCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            {/* Warning Icon Ring */}
            <View
              style={[
                styles.logoutIconRing,
                isDarkMode && { backgroundColor: "#451A03" },
              ]}
            >
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={32}
                color="#EF4444"
              />
            </View>

            {/* Header Text */}
            <Text
              style={[styles.logoutTitle, isDarkMode && { color: "#F8FAFC" }]}
            >
              Sign Out of Civentral?
            </Text>
            <Text
              style={[
                styles.logoutSubtitle,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              You are about to leave your secure citizen session. You will need
              to sign in again to access your government services.
            </Text>

            {/* Citizen Info Preview Strip */}
            <View
              style={[
                styles.logoutCitizenStrip,
                isDarkMode && {
                  backgroundColor: "#0B132B",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <View style={styles.logoutCitizenAvatar}>
                <Text style={styles.logoutCitizenAvatarText}>
                  {userProfile.initials || "CR"}
                </Text>
              </View>
              <View style={styles.logoutCitizenInfo}>
                <Text
                  style={[
                    styles.logoutCitizenName,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {userProfile.fullName || "Citizen Resident"}
                </Text>
                <Text
                  style={[
                    styles.logoutCitizenId,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  {userProfile.citizenId || "CALOOCAN CITY RESIDENT"}
                </Text>
              </View>
              <View style={styles.logoutActiveBadge}>
                <View style={styles.logoutActiveDot} />
                <Text style={styles.logoutActiveLabel}>ACTIVE</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.logoutActionsCol}>
              <TouchableOpacity
                style={[
                  styles.logoutConfirmBtn,
                  isLoggingOut && { opacity: 0.8 },
                ]}
                onPress={handleConfirmLogout}
                disabled={isLoggingOut}
                activeOpacity={0.88}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <IconSymbol
                      name="rectangle.portrait.and.arrow.right"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.logoutConfirmText}>
                      Yes, Sign Me Out
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.logoutCancelBtn,
                  isDarkMode && {
                    backgroundColor: "#334155",
                    borderColor: "#475569",
                  },
                ]}
                onPress={() => setIsLogoutModalVisible(false)}
                disabled={isLoggingOut}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.logoutCancelText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Keep Me Signed In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer Security Notice */}
            <View style={styles.logoutFooterNote}>
              <IconSymbol name="shield.fill" size={12} color="#94A3B8" />
              <Text
                style={[
                  styles.logoutFooterText,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                {" "}
                Secured by Caloocan City E-Governance Portal
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: EDIT PROFILE */}
      <Modal
        visible={isEditProfileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditProfileModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidOverlay}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.editModalContainer,
                { maxHeight: "90%" },
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                  borderWidth: 1,
                },
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  style={[
                    styles.modalHeaderTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {labels.editProfileTitle || "Edit Profile Details"}
                </Text>
                <Text
                  style={[
                    styles.modalHeaderSub,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  {labels.editProfileSub || "Ensure your personal information and contact details are up to date."}
                </Text>

                {/* First Name & Last Name */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
                      {labels.firstName || "First Name"}
                    </Text>
                    <TextInput
                      style={[
                        styles.modalInput,
                        isDarkMode && {
                          backgroundColor: "#0F172A",
                          borderColor: "#3A506B",
                          color: "#F8FAFC",
                        },
                      ]}
                      placeholder="First Name"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                      value={editFirstName}
                      onChangeText={setEditFirstName}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
                      {labels.lastName || "Last Name"}
                    </Text>
                    <TextInput
                      style={[
                        styles.modalInput,
                        isDarkMode && {
                          backgroundColor: "#0F172A",
                          borderColor: "#3A506B",
                          color: "#F8FAFC",
                        },
                      ]}
                      placeholder="Last Name"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                      value={editLastName}
                      onChangeText={setEditLastName}
                    />
                  </View>
                </View>

                {/* Mobile & Email */}
                <Text style={[styles.inputLabel, { marginTop: 12 }, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.mobileNumber || "Mobile Number"}
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                      color: "#F8FAFC",
                    },
                  ]}
                  placeholder="e.g. 0917-123-4567"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                />

                <Text style={[styles.inputLabel, { marginTop: 12 }, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.emailAddress || "Email Address"}
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                      color: "#F8FAFC",
                    },
                  ]}
                  placeholder="Enter email"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Barangay & Birth Date */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
                      {labels.barangay || "Barangay"}
                    </Text>
                    <TextInput
                      style={[
                        styles.modalInput,
                        isDarkMode && {
                          backgroundColor: "#0F172A",
                          borderColor: "#3A506B",
                          color: "#F8FAFC",
                        },
                      ]}
                      placeholder="e.g. Barangay 171"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                      value={editBarangay}
                      onChangeText={setEditBarangay}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
                      {labels.birthDate || "Birth Date"}
                    </Text>
                    <TextInput
                      style={[
                        styles.modalInput,
                        isDarkMode && {
                          backgroundColor: "#0F172A",
                          borderColor: "#3A506B",
                          color: "#F8FAFC",
                        },
                      ]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                      value={editBirthDate}
                      onChangeText={setEditBirthDate}
                    />
                  </View>
                </View>

                {/* Civil Status Selection */}
                <Text style={[styles.inputLabel, { marginTop: 12 }, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.civilStatus || "Civil Status"}
                </Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                  {(["Single", "Married", "Widowed"] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setEditCivilStatus(status)}
                      style={[
                        {
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 8,
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: editCivilStatus === status ? "#176B87" : isDarkMode ? "#3A506B" : "#CBD5E1",
                          backgroundColor: editCivilStatus === status ? (isDarkMode ? "#0F2942" : "#E0F2FE") : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: editCivilStatus === status ? "#176B87" : isDarkMode ? "#CBD5E1" : "#64748B",
                        }}
                      >
                        {status === "Single" ? labels.single || "Single" : status === "Married" ? labels.married || "Married" : labels.widowed || "Widowed"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Registered Address */}
                <Text style={[styles.inputLabel, { marginTop: 12 }, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.registeredAddress || "Registered Address"}
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { height: 60 },
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                      color: "#F8FAFC",
                    },
                  ]}
                  placeholder="Enter complete residential address"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  multiline
                />
              </ScrollView>

              <View style={[styles.modalActionsRow, { marginTop: 16 }]}>
                <TouchableOpacity
                  style={[
                    styles.modalCancelBtn,
                    isDarkMode && { backgroundColor: "#334155" },
                  ]}
                  onPress={() => setIsEditProfileModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalCancelText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {labels.cancelText || "Cancel"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>{labels.saveLanguage || "Save Changes"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 2B: ADD FAMILY MEMBER */}
      <Modal
        visible={isAddFamilyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddFamilyModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidOverlay}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.editModalContainer,
                { maxHeight: "90%" },
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                  borderWidth: 1,
                },
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  style={[
                    styles.modalHeaderTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {labels.addMemberTitle || "Register Family Member"}
                </Text>
                <Text
                  style={[
                    styles.modalHeaderSub,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  {labels.addMemberSub || "Enter details to link a family member to your profile."}
                </Text>

                {/* Full Name */}
                <Text style={[styles.inputLabel, { marginTop: 12 }, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.fullNameCaps || "Full Name"} *
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                      color: "#F8FAFC",
                    },
                  ]}
                  placeholder="e.g. Maria Clara Santos"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={famFullName}
                  onChangeText={setFamFullName}
                />

                {/* Relationship Picker */}
                <Text style={[styles.inputLabel, { marginTop: 12 }, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.relationship || "Relationship"}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {(["Spouse", "Child", "Parent", "Sibling", "Dependent"] as const).map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      onPress={() => setFamRelationship(rel)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: famRelationship === rel ? "#176B87" : isDarkMode ? "#3A506B" : "#CBD5E1",
                        backgroundColor: famRelationship === rel ? (isDarkMode ? "#0F2942" : "#E0F2FE") : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: famRelationship === rel ? "#176B87" : isDarkMode ? "#CBD5E1" : "#64748B",
                        }}
                      >
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Birth Date & Gender */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
                      {labels.birthDate || "Birth Date"}
                    </Text>
                    <TextInput
                      style={[
                        styles.modalInput,
                        isDarkMode && {
                          backgroundColor: "#0F172A",
                          borderColor: "#3A506B",
                          color: "#F8FAFC",
                        },
                      ]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                      value={famBirthDate}
                      onChangeText={setFamBirthDate}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
                      {labels.gender || "Gender"}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                      {(["Female", "Male"] as const).map((g) => (
                        <TouchableOpacity
                          key={g}
                          onPress={() => setFamGender(g)}
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            borderRadius: 8,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: famGender === g ? "#176B87" : isDarkMode ? "#3A506B" : "#CBD5E1",
                            backgroundColor: famGender === g ? (isDarkMode ? "#0F2942" : "#E0F2FE") : "transparent",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: famGender === g ? "#176B87" : isDarkMode ? "#CBD5E1" : "#64748B",
                            }}
                          >
                            {g === "Female" ? labels.female || "Female" : labels.male || "Male"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Citizen ID & Phone (Optional) */}
                <Text style={[styles.inputLabel, { marginTop: 12 }, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.citizenIdNoCaps || "Citizen ID Number (Optional)"}
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                      color: "#F8FAFC",
                    },
                  ]}
                  placeholder="e.g. CIV-2026-00412"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={famCitizenId}
                  onChangeText={setFamCitizenId}
                />

                <Text style={[styles.inputLabel, { marginTop: 12 }, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.mobileNumber || "Contact Number (Optional)"}
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                      color: "#F8FAFC",
                    },
                  ]}
                  placeholder="e.g. 0917-889-2104"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={famContactNumber}
                  onChangeText={setFamContactNumber}
                  keyboardType="phone-pad"
                />
              </ScrollView>

              <View style={[styles.modalActionsRow, { marginTop: 16 }]}>
                <TouchableOpacity
                  style={[
                    styles.modalCancelBtn,
                    isDarkMode && { backgroundColor: "#334155" },
                  ]}
                  onPress={() => setIsAddFamilyModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalCancelText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {labels.cancelText || "Cancel"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleAddFamilyMember}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSaveText}>{labels.saveFamilyMember || "Save Member"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 2C: HEALTH RECORD DETAILS */}
      <Modal
        visible={Boolean(selectedHealthRecord)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedHealthRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.editModalContainer,
              { maxHeight: "85%" },
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            {selectedHealthRecord && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <Badge
                    variant={selectedHealthRecord.status === "Verified" ? "success" : "info"}
                    label={selectedHealthRecord.status}
                  />
                  <Badge variant="neutral" label={selectedHealthRecord.type} />
                </View>

                <Text
                  style={[
                    styles.modalHeaderTitle,
                    { fontSize: 18, marginTop: 4 },
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {selectedHealthRecord.title}
                </Text>

                <View style={[styles.infoDivider, { marginVertical: 12 }, isDarkMode && { backgroundColor: "#3A506B" }]} />

                {/* Facility & Doctor */}
                <View style={{ gap: 10 }}>
                  <View>
                    <Text style={[{ fontSize: 11, fontWeight: "700", color: "#64748B" }, isDarkMode && { color: "#94A3B8" }]}>
                      {labels.facility || "Facility / Health Center"}
                    </Text>
                    <Text style={[{ fontSize: 13, fontWeight: "600", color: "#0F172A", marginTop: 2 }, isDarkMode && { color: "#F8FAFC" }]}>
                      🏥 {selectedHealthRecord.facility}
                    </Text>
                  </View>

                  <View>
                    <Text style={[{ fontSize: 11, fontWeight: "700", color: "#64748B" }, isDarkMode && { color: "#94A3B8" }]}>
                      {labels.attendingDoctor || "Attending Physician"}
                    </Text>
                    <Text style={[{ fontSize: 13, fontWeight: "600", color: "#0F172A", marginTop: 2 }, isDarkMode && { color: "#F8FAFC" }]}>
                      👨‍⚕️ {selectedHealthRecord.doctor}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[{ fontSize: 11, fontWeight: "700", color: "#64748B" }, isDarkMode && { color: "#94A3B8" }]}>
                        {labels.birthDate || "Date Administered"}
                      </Text>
                      <Text style={[{ fontSize: 13, fontWeight: "600", color: "#0F172A", marginTop: 2 }, isDarkMode && { color: "#F8FAFC" }]}>
                        📅 {selectedHealthRecord.date}
                      </Text>
                    </View>
                    {selectedHealthRecord.dosageOrResult ? (
                      <View style={{ flex: 1 }}>
                        <Text style={[{ fontSize: 11, fontWeight: "700", color: "#64748B" }, isDarkMode && { color: "#94A3B8" }]}>
                          Dosage / Clearance
                        </Text>
                        <Text style={[{ fontSize: 13, fontWeight: "600", color: "#176B87", marginTop: 2 }, isDarkMode && { color: "#38BDF8" }]}>
                          💉 {selectedHealthRecord.dosageOrResult}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View>
                    <Text style={[{ fontSize: 11, fontWeight: "700", color: "#64748B" }, isDarkMode && { color: "#94A3B8" }]}>
                      {labels.clinicalNotes || "Clinical Details & Result"}
                    </Text>
                    <Text
                      style={[
                        {
                          fontSize: 13,
                          color: "#334155",
                          marginTop: 4,
                          lineHeight: 20,
                          backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                          padding: 12,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isDarkMode ? "#3A506B" : "#E2E8F0",
                        },
                        isDarkMode && { color: "#CBD5E1" },
                      ]}
                    >
                      {selectedHealthRecord.details}
                    </Text>
                  </View>
                </View>

                {/* Verification Seal */}
                <View
                  style={{
                    marginTop: 16,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: isDarkMode ? "#0F2942" : "#F0F9FF",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <IconSymbol name="checkmark.seal.fill" size={16} color="#16A34A" />
                  <Text style={{ fontSize: 11, color: "#176B87", fontWeight: "600", flex: 1 }}>
                    Official record from Caloocan City Health Department Registry
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={{ marginTop: 16 }}>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { width: "100%" },
                ]}
                onPress={() => setSelectedHealthRecord(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: CHANGE PASSWORD */}
      <Modal
        visible={isChangePasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsChangePasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidOverlay}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.changePasswordModalContainer,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                  borderWidth: 1,
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.changePasswordScrollContent}
              >
                <Text
                  style={[
                    styles.modalHeaderTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Change Account Password
                </Text>
                <Text
                  style={[
                    styles.modalHeaderSub,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Protect your citizen account by setting a new strong password.
                </Text>

                {/* Current Password Field */}
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Current Password
                </Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.passwordInput,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                    placeholder="Enter current password"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      if (changePasswordErrorMessage)
                        setChangePasswordErrorMessage(null);
                    }}
                    secureTextEntry={!isCurrentPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIconBtn}
                    onPress={() => setIsCurrentPasswordVisible((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name={
                        isCurrentPasswordVisible ? "eye.slash.fill" : "eye.fill"
                      }
                      size={18}
                      color={isDarkMode ? "#94A3B8" : "#64748B"}
                    />
                  </TouchableOpacity>
                </View>

                {/* New Password Field */}
                <Text
                  style={[
                    styles.inputLabel,
                    { marginTop: 12 },
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  New Password
                </Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.passwordInput,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                    placeholder="Enter new password"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (changePasswordErrorMessage)
                        setChangePasswordErrorMessage(null);
                    }}
                    secureTextEntry={!isNewPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIconBtn}
                    onPress={() => setIsNewPasswordVisible((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name={
                        isNewPasswordVisible ? "eye.slash.fill" : "eye.fill"
                      }
                      size={18}
                      color={isDarkMode ? "#94A3B8" : "#64748B"}
                    />
                  </TouchableOpacity>
                </View>

                {/* REAL-TIME PASSWORD STRENGTH METER */}
                {newPassword.length > 0 && (
                  <View
                    style={[
                      styles.strengthMeterContainer,
                      isDarkMode && {
                        backgroundColor: "#0F172A",
                        borderColor: "#3A506B",
                      },
                    ]}
                  >
                    {/* 3 Color Bars */}
                    <View style={styles.strengthBarRow}>
                      <View
                        style={[
                          styles.strengthBar,
                          newStrengthLevel === "weak" && styles.barWeak,
                          newStrengthLevel === "medium" && styles.barMedium,
                          newStrengthLevel === "strong" && styles.barStrong,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          newStrengthLevel === "medium" && styles.barMedium,
                          newStrengthLevel === "strong" && styles.barStrong,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          newStrengthLevel === "strong" && styles.barStrong,
                        ]}
                      />
                    </View>

                    {/* Strength Label & Status */}
                    <View style={styles.strengthLabelRow}>
                      <Text
                        style={[
                          styles.strengthPromptText,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Password Strength:
                      </Text>
                      <Text
                        style={[
                          styles.strengthText,
                          newStrengthLevel === "weak" && styles.textWeak,
                          newStrengthLevel === "medium" && styles.textMedium,
                          newStrengthLevel === "strong" && styles.textStrong,
                        ]}
                      >
                        {newStrengthLevel.toUpperCase()}
                      </Text>
                    </View>

                    {/* Password Criteria Checklist */}
                    <View style={styles.checklistContainer}>
                      <View style={styles.checkItem}>
                        <IconSymbol
                          name={
                            newHasMinLength
                              ? "checkmark.seal.fill"
                              : "chevron.right"
                          }
                          size={14}
                          color={newHasMinLength ? "#10B981" : "#94A3B8"}
                        />
                        <Text
                          style={[
                            styles.checkText,
                            isDarkMode && { color: "#94A3B8" },
                            newHasMinLength && styles.checkTextActive,
                          ]}
                        >
                          At least 8 characters
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <IconSymbol
                          name={
                            newHasUpper && newHasLower
                              ? "checkmark.seal.fill"
                              : "chevron.right"
                          }
                          size={14}
                          color={
                            newHasUpper && newHasLower ? "#10B981" : "#94A3B8"
                          }
                        />
                        <Text
                          style={[
                            styles.checkText,
                            isDarkMode && { color: "#94A3B8" },
                            newHasUpper &&
                              newHasLower &&
                              styles.checkTextActive,
                          ]}
                        >
                          Uppercase & lowercase letters
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <IconSymbol
                          name={
                            newHasNumber
                              ? "checkmark.seal.fill"
                              : "chevron.right"
                          }
                          size={14}
                          color={newHasNumber ? "#10B981" : "#94A3B8"}
                        />
                        <Text
                          style={[
                            styles.checkText,
                            isDarkMode && { color: "#94A3B8" },
                            newHasNumber && styles.checkTextActive,
                          ]}
                        >
                          At least 1 number (0-9)
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <IconSymbol
                          name={
                            newHasSymbol
                              ? "checkmark.seal.fill"
                              : "chevron.right"
                          }
                          size={14}
                          color={newHasSymbol ? "#10B981" : "#94A3B8"}
                        />
                        <Text
                          style={[
                            styles.checkText,
                            isDarkMode && { color: "#94A3B8" },
                            newHasSymbol && styles.checkTextActive,
                          ]}
                        >
                          At least 1 special symbol (!@#$%^&*)
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Confirm New Password Field */}
                <Text
                  style={[
                    styles.inputLabel,
                    { marginTop: 12 },
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Confirm New Password
                </Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.passwordInput,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                    placeholder="Confirm new password"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    value={confirmNewPassword}
                    onChangeText={(text) => {
                      setConfirmNewPassword(text);
                      if (changePasswordErrorMessage)
                        setChangePasswordErrorMessage(null);
                    }}
                    secureTextEntry={!isConfirmNewPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIconBtn}
                    onPress={() =>
                      setIsConfirmNewPasswordVisible((prev) => !prev)
                    }
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name={
                        isConfirmNewPasswordVisible
                          ? "eye.slash.fill"
                          : "eye.fill"
                      }
                      size={18}
                      color={isDarkMode ? "#94A3B8" : "#64748B"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {changePasswordErrorMessage ? (
                  <Text style={styles.changePasswordErrorText}>
                    {changePasswordErrorMessage}
                  </Text>
                ) : null}

                {/* Modal Actions */}
                <View style={[styles.modalActionsRow, { marginTop: 16 }]}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelBtn,
                      isDarkMode && { backgroundColor: "#334155" },
                    ]}
                    onPress={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                      setChangePasswordErrorMessage(null);
                      setIsChangePasswordModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalCancelText,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalSaveBtn,
                      (isChangingPassword ||
                        newStrengthLevel !== "strong" ||
                        newPassword !== confirmNewPassword) &&
                        styles.modalSaveBtnDisabled,
                    ]}
                    onPress={handleChangePassword}
                    disabled={
                      isChangingPassword ||
                      newStrengthLevel !== "strong" ||
                      newPassword !== confirmNewPassword
                    }
                    activeOpacity={0.85}
                  >
                    {isChangingPassword ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalSaveText}>Update Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 4: SUCCESS TOAST POPUP */}
      <Modal
        visible={isSuccessToastVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSuccessToastVisible(false)}
      >
        <View style={styles.successToastOverlay}>
          <View style={[styles.successToastCard, isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B", borderWidth: 1 }]}>
            <View style={styles.successToastCheckCircle}>
              <IconSymbol
                name="checkmark.seal.fill"
                size={38}
                color="#FFFFFF"
              />
            </View>
            <Text style={[styles.successToastTitle, isDarkMode && { color: "#F8FAFC" }]}>Password Updated</Text>
            <Text style={[styles.successToastSub, isDarkMode && { color: "#CBD5E1" }]}>
              Your account password has been changed successfully.
            </Text>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: LOGOUT LOADING OVERLAY */}
      <Modal visible={isLoggingOut} transparent animationType="fade">
        <View style={styles.logoutLoadingOverlay}>
          <View
            style={[
              styles.logoutLoadingCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            <ActivityIndicator size="large" color="#176B87" />
            <Text
              style={[
                styles.logoutLoadingText,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Signing out safely...
            </Text>
            <Text
              style={[
                styles.logoutLoadingSub,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              Clearing your active session
            </Text>
          </View>
        </View>
      </Modal>

      {/* MODAL 6: PRIVACY & DATA PROTECTION POLICY */}
      <Modal
        visible={isPrivacyPolicyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPrivacyPolicyModalVisible(false)}
      >
        <View style={privacyStyles.overlay}>
          <View
            style={[
              privacyStyles.container,
              isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B", borderWidth: 1 },
            ]}
          >
            {/* ── Header ── */}
            <View style={privacyStyles.header}>
              <View style={privacyStyles.headerLeft}>
                <View style={privacyStyles.headerIconRing}>
                  <IconSymbol name="shield.fill" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={privacyStyles.headerTitle}>{labels.privacyPolicyTitle}</Text>
                  <Text style={privacyStyles.headerSub}>{labels.privacyPolicyLaw}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsPrivacyPolicyModalVisible(false)}
                activeOpacity={0.7}
                style={privacyStyles.headerCloseBtn}
              >
                <Text style={privacyStyles.headerCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* ── Scroll Reminder Banner ── */}
            {!hasScrolledToEnd ? (
              <View style={privacyStyles.scrollReminderBanner}>
                <Text style={privacyStyles.scrollReminderIcon}>⬇</Text>
                <Text style={privacyStyles.scrollReminderText}>
                  {labels.scrollBannerText}
                </Text>
              </View>
            ) : (
              <View style={privacyStyles.scrollCompleteBanner}>
                <Text style={privacyStyles.scrollCompleteIcon}>✓</Text>
                <Text style={privacyStyles.scrollCompleteText}>{labels.scrollCompleteText}</Text>
              </View>
            )}

            {/* ── Scrollable Policy Body ── */}
            <ScrollView
              style={privacyStyles.scrollBody}
              contentContainerStyle={privacyStyles.scrollContent}
              showsVerticalScrollIndicator={true}
              onScroll={(e) => {
                const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
                const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 30;
                if (isEnd && !hasScrolledToEnd) setHasScrolledToEnd(true);
              }}
              scrollEventThrottle={16}
            >
              {/* ── Intro Card ── */}
              <View
                style={[
                  privacyStyles.introCard,
                  isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" },
                ]}
              >
                <Text style={[privacyStyles.introTitle, isDarkMode && { color: "#F8FAFC" }]}>
                  {labels.introTitle}
                </Text>
                <Text style={[privacyStyles.introSub, isDarkMode && { color: "#94A3B8" }]}>
                  {labels.introSub}
                </Text>
              </View>

              {/* ── Section 1: Personal Data Protection ── */}
              <View
                style={[
                  privacyStyles.sectionCard,
                  isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" },
                ]}
              >
                <View style={privacyStyles.sectionHeader}>
                  <View style={privacyStyles.sectionNumberBadge}>
                    <Text style={privacyStyles.sectionNumber}>1</Text>
                  </View>
                  <Text style={[privacyStyles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>
                    {labels.sec1Title}
                  </Text>
                </View>
                <Text style={[privacyStyles.sectionSummary, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.sec1Summary}
                </Text>
                {[
                  labels.sec1Bullet1,
                  labels.sec1Bullet2,
                  labels.sec1Bullet3,
                ].map((item, i) => (
                  <View key={i} style={privacyStyles.bulletRow}>
                    <Text style={[privacyStyles.bullet, isDarkMode && { color: "#94A3B8" }]}>•</Text>
                    <Text style={[privacyStyles.bulletText, isDarkMode && { color: "#94A3B8" }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* ── Section 2: Consent Management ── */}
              <View
                style={[
                  privacyStyles.sectionCard,
                  isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" },
                ]}
              >
                <View style={privacyStyles.sectionHeader}>
                  <View style={privacyStyles.sectionNumberBadge}>
                    <Text style={privacyStyles.sectionNumber}>2</Text>
                  </View>
                  <Text style={[privacyStyles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>
                    {labels.sec2Title}
                  </Text>
                </View>
                <Text style={[privacyStyles.sectionSummary, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.sec2Summary}
                </Text>
                {[
                  labels.sec2Bullet1,
                  labels.sec2Bullet2,
                  labels.sec2Bullet3,
                ].map((item, i) => (
                  <View key={i} style={privacyStyles.bulletRow}>
                    <Text style={[privacyStyles.bullet, isDarkMode && { color: "#94A3B8" }]}>•</Text>
                    <Text style={[privacyStyles.bulletText, isDarkMode && { color: "#94A3B8" }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* ── Section 3: Right to Delete Data ── */}
              <View
                style={[
                  privacyStyles.sectionCard,
                  isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" },
                ]}
              >
                <View style={privacyStyles.sectionHeader}>
                  <View style={privacyStyles.sectionNumberBadge}>
                    <Text style={privacyStyles.sectionNumber}>3</Text>
                  </View>
                  <Text style={[privacyStyles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>
                    {labels.sec3Title}
                  </Text>
                </View>
                <Text style={[privacyStyles.sectionSummary, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.sec3Summary}
                </Text>
                {[
                  labels.sec3Bullet1,
                  labels.sec3Bullet2,
                  labels.sec3Bullet3,
                ].map((item, i) => (
                  <View key={i} style={privacyStyles.bulletRow}>
                    <Text style={[privacyStyles.bullet, isDarkMode && { color: "#94A3B8" }]}>•</Text>
                    <Text style={[privacyStyles.bulletText, isDarkMode && { color: "#94A3B8" }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* ── Section 4: Data Breach Reporting ── */}
              <View
                style={[
                  privacyStyles.sectionCard,
                  isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" },
                ]}
              >
                <View style={privacyStyles.sectionHeader}>
                  <View style={privacyStyles.sectionNumberBadge}>
                    <Text style={privacyStyles.sectionNumber}>4</Text>
                  </View>
                  <Text style={[privacyStyles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>
                    {labels.sec4Title}
                  </Text>
                </View>
                <Text style={[privacyStyles.sectionSummary, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.sec4Summary}
                </Text>
                {[
                  labels.sec4Bullet1,
                  labels.sec4Bullet2,
                  labels.sec4Bullet3,
                ].map((item, i) => (
                  <View key={i} style={privacyStyles.bulletRow}>
                    <Text style={[privacyStyles.bullet, isDarkMode && { color: "#94A3B8" }]}>•</Text>
                    <Text style={[privacyStyles.bulletText, isDarkMode && { color: "#94A3B8" }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* ── Section 5: System Access & Accountability ── */}
              <View
                style={[
                  privacyStyles.sectionCard,
                  isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" },
                ]}
              >
                <View style={privacyStyles.sectionHeader}>
                  <View style={privacyStyles.sectionNumberBadge}>
                    <Text style={privacyStyles.sectionNumber}>5</Text>
                  </View>
                  <Text style={[privacyStyles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>
                    {labels.sec5Title}
                  </Text>
                </View>
                <Text style={[privacyStyles.sectionSummary, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.sec5Summary}
                </Text>
                {[
                  labels.sec5Bullet1,
                  labels.sec5Bullet2,
                  labels.sec5Bullet3,
                ].map((item, i) => (
                  <View key={i} style={privacyStyles.bulletRow}>
                    <Text style={[privacyStyles.bullet, isDarkMode && { color: "#94A3B8" }]}>•</Text>
                    <Text style={[privacyStyles.bulletText, isDarkMode && { color: "#94A3B8" }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* ── Section 6: Cookies & Local Storage Policy ── */}
              <View
                style={[
                  privacyStyles.sectionCard,
                  isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" },
                ]}
              >
                <View style={privacyStyles.sectionHeader}>
                  <View style={privacyStyles.sectionNumberBadge}>
                    <Text style={privacyStyles.sectionNumber}>6</Text>
                  </View>
                  <Text style={[privacyStyles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>
                    {labels.sec6Title}
                  </Text>
                </View>
                <Text style={[privacyStyles.sectionSummary, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.sec6Summary}
                </Text>
                {[
                  labels.sec6Bullet1,
                  labels.sec6Bullet2,
                  labels.sec6Bullet3,
                ].map((item, i) => (
                  <View key={i} style={privacyStyles.bulletRow}>
                    <Text style={[privacyStyles.bullet, isDarkMode && { color: "#94A3B8" }]}>•</Text>
                    <Text style={[privacyStyles.bulletText, isDarkMode && { color: "#94A3B8" }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* ── Section 7: Third-Party Service Providers & Notices ── */}
              <View
                style={[
                  privacyStyles.sectionCard,
                  isDarkMode && { backgroundColor: "#0F172A", borderColor: "#3A506B" },
                ]}
              >
                <View style={privacyStyles.sectionHeader}>
                  <View style={privacyStyles.sectionNumberBadge}>
                    <Text style={privacyStyles.sectionNumber}>7</Text>
                  </View>
                  <Text style={[privacyStyles.sectionTitle, isDarkMode && { color: "#F8FAFC" }]}>
                    {labels.sec7Title}
                  </Text>
                </View>
                <Text style={[privacyStyles.sectionSummary, isDarkMode && { color: "#CBD5E1" }]}>
                  {labels.sec7Summary}
                </Text>
                {[
                  labels.sec7Bullet1,
                  labels.sec7Bullet2,
                  labels.sec7Bullet3,
                ].map((item, i) => (
                  <View key={i} style={privacyStyles.bulletRow}>
                    <Text style={[privacyStyles.bullet, isDarkMode && { color: "#94A3B8" }]}>•</Text>
                    <Text style={[privacyStyles.bulletText, isDarkMode && { color: "#94A3B8" }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* ── Employee Acknowledgment Card (shown after scrolling) ── */}
              {hasScrolledToEnd && (
                <View style={privacyStyles.acknowledgmentCard}>
                  <View style={privacyStyles.acknowledgmentIconRow}>
                    <View style={privacyStyles.acknowledgmentIconCircle}>
                      <Text style={privacyStyles.acknowledgmentCheckIcon}>✓</Text>
                    </View>
                    <Text style={privacyStyles.acknowledgmentTitle}>{labels.acknowledgmentTitle}</Text>
                  </View>
                  <Text style={privacyStyles.acknowledgmentBody}>
                    {labels.acknowledgmentBody}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* ── Footer Actions ── */}
            <View
              style={[
                privacyStyles.footer,
                isDarkMode && { borderTopColor: "#3A506B" },
              ]}
            >
              <TouchableOpacity
                onPress={() => setIsPrivacyPolicyModalVisible(false)}
                activeOpacity={0.7}
                style={privacyStyles.footerCancelBtn}
              >
                <Text style={[privacyStyles.footerCancelText, isDarkMode && { color: "#94A3B8" }]}>{labels.cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  privacyStyles.footerAgreeBtn,
                  !hasScrolledToEnd && privacyStyles.footerAgreeBtnDisabled,
                ]}
                disabled={!hasScrolledToEnd}
                onPress={() => {
                  setHasAgreedToPolicy(true);
                  setIsPrivacyPolicyModalVisible(false);
                  Alert.alert(
                    labels.agreedAlertTitle,
                    labels.agreedAlertBody,
                  );
                }}
                activeOpacity={0.88}
              >
                <IconSymbol
                  name="checkmark.seal.fill"
                  size={16}
                  color={hasScrolledToEnd ? "#FFFFFF" : "#94A3B8"}
                />
                <Text
                  style={[
                    privacyStyles.footerAgreeBtnText,
                    !hasScrolledToEnd && { color: "#94A3B8" },
                  ]}
                >
                  {hasScrolledToEnd ? labels.agreeBtnText : labels.scrollReminderBtnText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 7: LANGUAGE PREFERENCE / WIKA */}
      <Modal
        visible={isLanguageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View style={privacyStyles.overlay}>
          <View
            style={[
              privacyStyles.container,
              { maxHeight: "65%" },
              isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B", borderWidth: 1 },
            ]}
          >
            {/* Header */}
            <View style={privacyStyles.header}>
              <View style={privacyStyles.headerLeft}>
                <View style={privacyStyles.headerIconRing}>
                  <IconSymbol name="globe" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={privacyStyles.headerTitle}>App Language / Wika</Text>
                  <Text style={privacyStyles.headerSub}>Select your preferred display language</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsLanguageModalVisible(false)}
                activeOpacity={0.7}
                style={privacyStyles.headerCloseBtn}
              >
                <Text style={privacyStyles.headerCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <View style={{ padding: 20, gap: 14 }}>
              {/* Option 1: English */}
              <TouchableOpacity
                style={[
                  languageStyles.optionCard,
                  selectedLanguage === "en" && languageStyles.optionCardSelected,
                  isDarkMode && {
                    backgroundColor: selectedLanguage === "en" ? "#1E293B" : "#0F172A",
                    borderColor: selectedLanguage === "en" ? "#38BDF8" : "#3A506B",
                  },
                ]}
                onPress={() => setSelectedLanguage("en")}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View style={languageStyles.flagBadge}>
                    <Text style={languageStyles.flagText}>🇺🇸</Text>
                  </View>
                  <View>
                    <Text style={[languageStyles.label, isDarkMode && { color: "#F8FAFC" }]}>English</Text>
                    <Text style={[languageStyles.sublabel, isDarkMode && { color: "#94A3B8" }]}>Standard English interface</Text>
                  </View>
                </View>
                <View
                  style={[
                    languageStyles.radioOuter,
                    selectedLanguage === "en" && languageStyles.radioOuterSelected,
                    isDarkMode && selectedLanguage === "en" && { borderColor: "#38BDF8" },
                  ]}
                >
                  {selectedLanguage === "en" && (
                    <View style={[languageStyles.radioInner, isDarkMode && { backgroundColor: "#38BDF8" }]} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Option 2: Tagalog */}
              <TouchableOpacity
                style={[
                  languageStyles.optionCard,
                  selectedLanguage === "tl" && languageStyles.optionCardSelected,
                  isDarkMode && {
                    backgroundColor: selectedLanguage === "tl" ? "#1E293B" : "#0F172A",
                    borderColor: selectedLanguage === "tl" ? "#38BDF8" : "#3A506B",
                  },
                ]}
                onPress={() => setSelectedLanguage("tl")}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View style={languageStyles.flagBadge}>
                    <Text style={languageStyles.flagText}>🇵🇭</Text>
                  </View>
                  <View>
                    <Text style={[languageStyles.label, isDarkMode && { color: "#F8FAFC" }]}>Tagalog (Filipino)</Text>
                    <Text style={[languageStyles.sublabel, isDarkMode && { color: "#94A3B8" }]}>Wikang Filipino sa UI</Text>
                  </View>
                </View>
                <View
                  style={[
                    languageStyles.radioOuter,
                    selectedLanguage === "tl" && languageStyles.radioOuterSelected,
                    isDarkMode && selectedLanguage === "tl" && { borderColor: "#38BDF8" },
                  ]}
                >
                  {selectedLanguage === "tl" && (
                    <View style={[languageStyles.radioInner, isDarkMode && { backgroundColor: "#38BDF8" }]} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View
              style={[
                privacyStyles.footer,
                isDarkMode && { borderTopColor: "#3A506B" },
              ]}
            >
              <TouchableOpacity
                onPress={() => setIsLanguageModalVisible(false)}
                activeOpacity={0.7}
                style={privacyStyles.footerCancelBtn}
              >
                <Text style={[privacyStyles.footerCancelText, isDarkMode && { color: "#94A3B8" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={privacyStyles.footerAgreeBtn}
                onPress={() => {
                  setLanguage(selectedLanguage);
                  setIsLanguageModalVisible(false);
                  Alert.alert(
                    selectedLanguage === "en" ? "Language Updated" : "Na-update ang Wika",
                    selectedLanguage === "en"
                      ? "App language changed to English."
                      : "Naipalit na sa Tagalog ang wika ng app."
                  );
                }}
                activeOpacity={0.88}
              >
                <IconSymbol name="checkmark.seal.fill" size={16} color="#FFFFFF" />
                <Text style={privacyStyles.footerAgreeBtnText}>
                  {selectedLanguage === "en" ? "Save Preference" : "I-save ang Wika"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


