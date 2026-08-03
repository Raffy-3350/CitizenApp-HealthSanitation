import { Ionicons } from '@expo/vector-icons';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../hooks/useColors';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { userProfile, familyMembers, updateUserProfile, addFamilyMember, vaccines, appointments, permits, themeMode, setThemeMode } = useApp();

  // Active Modal State
  const [activeModal, setActiveModal] = useState<
    'personal' | 'family' | 'settings' | 'language' | 'support' | null
  >(null);

  // Editable Form State
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editedInfo, setEditedInfo] = useState(userProfile);

  // New Family Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    pushNotifications: true,
    appointmentReminders: true,
    smsAlerts: true,
    biometrics: false,
  });

  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    try {
      if (mode === 'system') {
        setBackgroundColorAsync(null as any);
      } else {
        setBackgroundColorAsync(mode === 'dark' ? '#0d1b2a' : '#EEF5FF');
      }
    } catch (e) {
      // Ignore system-ui errors on non-supported platforms
    }
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Personal Information', sub: 'PhilHealth ID, Address, Contact', action: () => { setEditedInfo(userProfile); setActiveModal('personal'); } },
    { icon: 'people-outline', label: 'Family Members', sub: 'Household Dependents & Cards', action: () => setActiveModal('family') },
    { icon: 'folder-outline', label: 'Health Records', sub: 'Immunizations & Appointments', action: () => router.push('/(tabs)/records' as any) },
    { icon: 'settings-outline', label: 'App Settings & Theme', sub: `Mode: ${themeMode.toUpperCase()}`, action: () => setActiveModal('settings') },
    { icon: 'language-outline', label: 'Language Preference', sub: selectedLanguage, action: () => setActiveModal('language') },
    { icon: 'help-circle-outline', label: 'Help & Emergency Support', sub: 'Hotlines & FAQs', action: () => setActiveModal('support') },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to log out of CitizenApp?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => Alert.alert('Logged Out', 'You have been logged out successfully.'),
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    if (isEditingPersonal) {
      updateUserProfile(editedInfo);
      setIsEditingPersonal(false);
      Alert.alert('Saved', 'Personal profile updated successfully.');
    } else {
      setIsEditingPersonal(true);
    }
  };

  const handleAddFamily = () => {
    if (!newMemberName || !newMemberRelation) {
      Alert.alert('Missing Details', 'Please provide family member name and relationship.');
      return;
    }
    addFamilyMember({
      name: newMemberName,
      relation: newMemberRelation,
      age: '1 yr',
      vaccines: 'Up to date',
      status: 'Active',
    });
    setNewMemberName('');
    setNewMemberRelation('');
    Alert.alert('Family Member Added', `${newMemberName} added to your household profile.`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {userProfile.name.split(' ').map((n) => n[0]).join('')}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{userProfile.name}</Text>
          <Text style={[styles.profileSub, { color: colors.subtext }]}>{userProfile.email}</Text>
          <Text style={[styles.profilePhone, { color: colors.primary }]}>{userProfile.phone}</Text>

          <View style={[styles.profileStats, { borderTopColor: colors.border }]}>
            <TouchableOpacity style={styles.profileStat} onPress={() => router.push('/(tabs)/view-vaccines' as any)}>
              <Text style={[styles.profileStatNumber, { color: colors.primary }]}>{vaccines.length}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.subtext }]}>Vaccines</Text>
            </TouchableOpacity>
            <View style={[styles.profileStatDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.profileStat} onPress={() => router.push('/(tabs)/track-requests' as any)}>
              <Text style={[styles.profileStatNumber, { color: colors.primary }]}>{appointments.length}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.subtext }]}>Appts</Text>
            </TouchableOpacity>
            <View style={[styles.profileStatDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.profileStat} onPress={() => router.push('/(tabs)/track-requests' as any)}>
              <Text style={[styles.profileStatNumber, { color: colors.primary }]}>{permits.length}</Text>
              <Text style={[styles.profileStatLabel, { color: colors.subtext }]}>Permits</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Section */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: colors.background }]}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.menuSub, { color: colors.subtext }]}>{item.sub}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.error + '40' }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out Session</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.subtext }]}>Health & Sanitation CitizenApp v17.0.0 • Active</Text>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ─── MODAL 1: Personal Information ─────────────────────────────────── */}
      <Modal visible={activeModal === 'personal'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Personal Information</Text>
              <TouchableOpacity onPress={() => { setIsEditingPersonal(false); setActiveModal(null); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <TextInput
                  style={styles.infoInput}
                  value={editedInfo.name}
                  editable={isEditingPersonal}
                  onChangeText={(val) => setEditedInfo({ ...editedInfo, name: val })}
                />
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>PhilHealth ID</Text>
                <TextInput
                  style={styles.infoInput}
                  value={editedInfo.philhealth}
                  editable={isEditingPersonal}
                  onChangeText={(val) => setEditedInfo({ ...editedInfo, philhealth: val })}
                />
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Mobile Contact</Text>
                <TextInput
                  style={styles.infoInput}
                  value={editedInfo.phone}
                  editable={isEditingPersonal}
                  onChangeText={(val) => setEditedInfo({ ...editedInfo, phone: val })}
                />
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Home Address</Text>
                <TextInput
                  style={styles.infoInput}
                  value={editedInfo.address}
                  editable={isEditingPersonal}
                  onChangeText={(val) => setEditedInfo({ ...editedInfo, address: val })}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.infoGroup, { flex: 1, marginRight: Spacing.xs }]}>
                  <Text style={styles.infoLabel}>Blood Type</Text>
                  <TextInput
                    style={styles.infoInput}
                    value={editedInfo.bloodType}
                    editable={isEditingPersonal}
                    onChangeText={(val) => setEditedInfo({ ...editedInfo, bloodType: val })}
                  />
                </View>
                <View style={[styles.infoGroup, { flex: 2, marginLeft: Spacing.xs }]}>
                  <Text style={styles.infoLabel}>Known Allergies</Text>
                  <TextInput
                    style={styles.infoInput}
                    value={editedInfo.allergies}
                    editable={isEditingPersonal}
                    onChangeText={(val) => setEditedInfo({ ...editedInfo, allergies: val })}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.primaryModalBtn} onPress={handleSaveProfile}>
                <Text style={styles.primaryModalBtnText}>
                  {isEditingPersonal ? 'SAVE CHANGES' : 'EDIT INFORMATION'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 2: Family Members ───────────────────────────────────────── */}
      <Modal visible={activeModal === 'family'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registered Family Members</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#0d4f64" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {familyMembers.map((member) => (
                <View key={member.id} style={styles.familyCard}>
                  <View style={styles.familyAvatar}>
                    <Ionicons name="person" size={20} color="#176B87" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.familyName}>{member.name}</Text>
                    <Text style={styles.familySub}>
                      {member.relation} • {member.age}
                    </Text>
                    <Text style={styles.familyVaccines}>✓ {member.vaccines}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{member.status}</Text>
                  </View>
                </View>
              ))}

              <Text style={styles.sectionHeading}>Add Dependent / Family Member</Text>
              <TextInput
                style={styles.infoInput}
                placeholder="Full Name (e.g. Juan Garcia)"
                placeholderTextColor="#86B6F6"
                value={newMemberName}
                onChangeText={setNewMemberName}
              />
              <TextInput
                style={[styles.infoInput, { marginTop: Spacing.xs }]}
                placeholder="Relationship (e.g. Son, Daughter, Mother)"
                placeholderTextColor="#86B6F6"
                value={newMemberRelation}
                onChangeText={setNewMemberRelation}
              />

              <TouchableOpacity style={styles.primaryModalBtn} onPress={handleAddFamily}>
                <Text style={styles.primaryModalBtnText}>+ ADD FAMILY MEMBER</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 3: App Settings ─────────────────────────────────────────── */}
      <Modal visible={activeModal === 'settings'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>App Settings & Preferences</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Theme Mode Selector */}
            <View style={[styles.settingRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>App Theme Appearance</Text>
              <Text style={[styles.settingSub, { color: colors.subtext }]}>Choose light, dark or follow system theme</Text>
              <View style={{ flexDirection: 'row', width: '100%', marginTop: Spacing.sm, gap: Spacing.xs }}>
                {[
                  { key: 'system', label: 'System' },
                  { key: 'light', label: 'Light ☀️' },
                  { key: 'dark', label: 'Dark 🌙' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={{
                      flex: 1,
                      paddingVertical: Spacing.sm,
                      borderRadius: BorderRadius.md,
                      backgroundColor: themeMode === item.key ? colors.primary : colors.background,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: themeMode === item.key ? colors.primary : colors.border,
                    }}
                    onPress={() => handleThemeChange(item.key as any)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: themeMode === item.key ? '#ffffff' : colors.text }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.settingSub, { color: colors.subtext }]}>Health alerts, Dengue updates & announcements</Text>
              </View>
              <Switch
                value={settings.pushNotifications}
                onValueChange={(val) => setSettings({ ...settings, pushNotifications: val })}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Appointment Reminders</Text>
                <Text style={[styles.settingSub, { color: colors.subtext }]}>SMS reminder 24 hours prior to clinic visit</Text>
              </View>
              <Switch
                value={settings.appointmentReminders}
                onValueChange={(val) => setSettings({ ...settings, appointmentReminders: val })}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>SMS Inspection Alerts</Text>
                <Text style={[styles.settingSub, { color: colors.subtext }]}>Status updates for Sanitation Permits</Text>
              </View>
              <Switch
                value={settings.smsAlerts}
                onValueChange={(val) => setSettings({ ...settings, smsAlerts: val })}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Biometric Lock (FaceID / Fingerprint)</Text>
                <Text style={[styles.settingSub, { color: colors.subtext }]}>Require biometric verification to open app</Text>
              </View>
              <Switch
                value={settings.biometrics}
                onValueChange={(val) => setSettings({ ...settings, biometrics: val })}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <TouchableOpacity style={[styles.primaryModalBtn, { backgroundColor: colors.primary }]} onPress={() => setActiveModal(null)}>
              <Text style={styles.primaryModalBtnText}>CLOSE SETTINGS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 4: Language ─────────────────────────────────────────────── */}
      <Modal visible={activeModal === 'language'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select App Language</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#0d4f64" />
              </TouchableOpacity>
            </View>

            {['English', 'Filipino (Tagalog)', 'Cebuano (Bisaya)', 'Ilocano'].map((lang, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.langOption, selectedLanguage === lang && styles.langSelected]}
                onPress={() => {
                  setSelectedLanguage(lang);
                  Alert.alert('Language Updated', `App language set to ${lang}`);
                  setActiveModal(null);
                }}
              >
                <Text style={[styles.langText, selectedLanguage === lang && styles.langSelectedText]}>
                  {lang}
                </Text>
                {selectedLanguage === lang && (
                  <Ionicons name="checkmark-circle" size={20} color="#176B87" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 5: Emergency & Help Support ─────────────────────────────── */}
      <Modal visible={activeModal === 'support'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency & Health Support</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#0d4f64" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>Emergency Direct Hotlines</Text>

            <TouchableOpacity
              style={styles.hotlineCard}
              onPress={() => Alert.alert('Calling Hotline', 'Dialing Emergency 911...')}
            >
              <Ionicons name="call" size={24} color="#e74c3c" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.hotlineTitle}>National Medical Emergency</Text>
                <Text style={styles.hotlineNum}>Dial: 911</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hotlineCard}
              onPress={() => Alert.alert('Calling Health Center', 'Dialing (02) 8555-1234...')}
            >
              <Ionicons name="medkit" size={24} color="#176B87" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.hotlineTitle}>Brgy. 7 City Health Officer</Text>
                <Text style={styles.hotlineNum}>(02) 8555-1234</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hotlineCard}
              onPress={() => Alert.alert('Calling Sanitation Office', 'Dialing (02) 8777-9876...')}
            >
              <Ionicons name="water" size={24} color="#9b59b6" />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.hotlineTitle}>Sanitation & Wastewater Desk</Text>
                <Text style={styles.hotlineNum}>(02) 8777-9876</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryModalBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.primaryModalBtnText}>CLOSE SUPPORT</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: '#ffffff',
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#176B87',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileName: {
    ...Typography.heading,
    color: '#0d4f64',
  },
  profileSub: {
    ...Typography.body,
    color: '#86B6F6',
    marginTop: 2,
  },
  profilePhone: {
    ...Typography.small,
    color: '#176B87',
    fontWeight: '600',
    marginTop: 2,
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EEF5FF',
    width: '85%',
    justifyContent: 'space-around',
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatNumber: {
    ...Typography.heading,
    color: '#176B87',
    fontSize: 20,
  },
  profileStatLabel: {
    ...Typography.small,
    color: '#86B6F6',
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: '#EEF5FF',
  },
  menuSection: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    shadowColor: '#176B87',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  menuSub: {
    ...Typography.small,
    color: '#86B6F6',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#e74c3c40',
  },
  logoutText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#e74c3c',
  },
  version: {
    ...Typography.small,
    color: '#86B6F6',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },

  // Modal Styles
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
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.subheading,
    color: '#0d4f64',
  },
  infoGroup: {
    marginBottom: Spacing.md,
  },
  infoLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: '#0d4f64',
    marginBottom: 4,
  },
  infoInput: {
    backgroundColor: '#EEF5FF50',
    borderWidth: 1,
    borderColor: '#B4D4FF',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: '#0d4f64',
  },
  row: {
    flexDirection: 'row',
  },
  primaryModalBtn: {
    backgroundColor: '#176B87',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  primaryModalBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Family modal
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF50',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  familyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B4D4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  familyName: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  familySub: {
    ...Typography.small,
    color: '#86B6F6',
  },
  familyVaccines: {
    ...Typography.small,
    color: '#2ecc71',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#2ecc7120',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    ...Typography.small,
    color: '#2ecc71',
    fontWeight: '600',
  },
  sectionHeading: {
    ...Typography.subheading,
    color: '#0d4f64',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
  },
  settingLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  settingSub: {
    ...Typography.small,
    color: '#86B6F6',
    marginTop: 2,
  },

  // Lang options
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    backgroundColor: '#EEF5FF50',
  },
  langSelected: {
    backgroundColor: '#B4D4FF40',
    borderWidth: 1,
    borderColor: '#176B87',
  },
  langText: {
    ...Typography.body,
    color: '#0d4f64',
  },
  langSelectedText: {
    fontWeight: '600',
    color: '#176B87',
  },

  // Support hotlines
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF50',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#B4D4FF',
  },
  hotlineTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: '#0d4f64',
  },
  hotlineNum: {
    ...Typography.small,
    color: '#176B87',
    fontWeight: '600',
    marginTop: 1,
  },
});