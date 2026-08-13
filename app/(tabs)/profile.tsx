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

import { LANGUAGE_OPTIONS, Language } from '../../constants/translations';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const {
    userProfile,
    familyMembers,
    updateUserProfile,
    addFamilyMember,
    vaccines,
    appointments,
    permits,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t,
  } = useApp();

  // Active Modal State
  const [activeModal, setActiveModal] = useState<
    'personal' | 'family' | 'settings' | 'language' | 'support' | 'docs' | null
  >(null);
  const [activeDocChapter, setActiveDocChapter] = useState<number>(1);

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

  const activeLangOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

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
    { icon: 'language-outline', label: 'Language Preference', sub: `${activeLangOption.flag} ${activeLangOption.label}`, action: () => setActiveModal('language') },
    { icon: 'help-circle-outline', label: 'Help & Emergency Support', sub: 'Hotlines & App User Manual', action: () => setActiveModal('support') },
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

        <Text style={[styles.version, { color: colors.subtext }]}>Health & Sanitation CiventralApp v1.0.0 Active</Text>
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
              <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#0d4f64" />
              </TouchableOpacity>
            </View>

            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <TouchableOpacity
                  key={opt.code}
                  style={[styles.langOption, isSelected && styles.langSelected]}
                  onPress={() => {
                    setLanguage(opt.code);
                    Alert.alert(t('languageUpdated'), `Language set to ${opt.label} (${opt.nativeName})`);
                    setActiveModal(null);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 20 }}>{opt.flag}</Text>
                    <View>
                      <Text style={[styles.langText, isSelected && styles.langSelectedText]}>
                        {opt.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.subtext }}>
                        {opt.nativeName}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 5: Help Center & App Documentation ─────────────────────────────── */}
      <Modal visible={activeModal === 'support'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '88%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="help-circle" size={24} color={colors.primary} />
                <View>
                  <Text style={styles.modalTitle}>Help Center & App Guide</Text>
                  <Text style={{ ...Typography.caption, color: colors.subtext }}>Official Caloocan Citizen Documentation</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: Spacing.sm }}>
              {/* Section 1: User Manual Documentation Entry Card */}
              <Text style={styles.sectionHeading}>📖 App User Guide & Documentation</Text>

              <TouchableOpacity
                style={[styles.manualEntryCard, { backgroundColor: colors.card, borderColor: colors.primary }]}
                onPress={() => setActiveModal('docs')}
              >
                <View style={[styles.manualEntryIconBox, { backgroundColor: colors.primary }]}>
                  <Ionicons name="book" size={22} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.manualEntryTitle, { color: colors.text }]}>App Manual & User Documentation</Text>
                  <Text style={[styles.manualEntrySub, { color: colors.subtext }]}>
                    Tap to open full interactive 6-chapter guide for maps, reporting, permits & offline sync
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>

              {/* Section 2: Caloocan Emergency Hotlines */}
              <Text style={[styles.sectionHeading, { marginTop: Spacing.md }]}>📞 Caloocan Direct Hotlines</Text>

              <TouchableOpacity
                style={styles.hotlineCard}
                onPress={() => Alert.alert('Calling Caloocan Emergency Desk', 'Dialing 911...')}
              >
                <Ionicons name="call" size={24} color="#e74c3c" />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.hotlineTitle}>Caloocan Disaster Emergency (CDEO)</Text>
                  <Text style={styles.hotlineNum}>Dial: 911 / (02) 8888-2256</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.hotlineCard}
                onPress={() => Alert.alert('Calling Caloocan Health Office', 'Dialing (02) 8555-1234...')}
              >
                <Ionicons name="medkit" size={24} color="#176B87" />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.hotlineTitle}>Caloocan City Health Office (Grace Park)</Text>
                  <Text style={styles.hotlineNum}>(02) 8555-1234</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.hotlineCard}
                onPress={() => Alert.alert('Calling Sanitation Desk', 'Dialing (02) 8777-9876...')}
              >
                <Ionicons name="water" size={24} color="#9b59b6" />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.hotlineTitle}>Caloocan Sanitation & Wastewater Desk</Text>
                  <Text style={styles.hotlineNum}>(02) 8777-9876</Text>
                </View>
              </TouchableOpacity>

              <View style={{ height: 16 }} />
            </ScrollView>


            <TouchableOpacity style={[styles.primaryModalBtn, { backgroundColor: colors.subtext }]} onPress={() => setActiveModal(null)}>
              <Text style={styles.primaryModalBtnText}>CLOSE HELP CENTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 6: Interactive Full App User Manual & Documentation Reader ─── */}
      <Modal visible={activeModal === 'docs'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '92%', height: '92%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="book" size={24} color={colors.primary} />
                <View>
                  <Text style={styles.modalTitle}>App User Manual & Docs</Text>
                  <Text style={{ ...Typography.caption, color: colors.subtext }}>Caloocan Citizen System Guide</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Chapter Horizontal Selector ScrollBar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: Spacing.xs, maxHeight: 42 }}>
              {[
                { id: 1, title: '1. Map Radars', icon: 'map' },
                { id: 2, title: '2. Incident Reports', icon: 'warning' },
                { id: 3, title: '3. Wastewater Services', icon: 'water' },
                { id: 4, title: '4. Health Permits', icon: 'document-text' },
                { id: 5, title: '5. Vaccine Portal', icon: 'medkit' },
                { id: 6, title: '6. Offline & Sync', icon: 'cloud-offline' },
              ].map((chap) => {
                const isSelected = activeDocChapter === chap.id;
                return (
                  <TouchableOpacity
                    key={chap.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                      marginRight: 8,
                    }}
                    onPress={() => setActiveDocChapter(chap.id)}
                  >
                    <Ionicons name={chap.icon as any} size={14} color={isSelected ? '#ffffff' : colors.text} />
                    <Text style={{ ...Typography.caption, fontWeight: '700', color: isSelected ? '#ffffff' : colors.text }}>
                      {chap.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginVertical: Spacing.xs }}>
              {activeDocChapter === 1 && (
                <View>
                  <Text style={styles.sectionHeading}>🗺️ Chapter 1: Health Cases Map & Spatial Radars</Text>
                  <Text style={[styles.guideCardBody, { color: colors.text, marginBottom: 8 }]}>
                    The <Text style={{ fontWeight: '700' }}>Health Cases Alerts</Text> tab features an interactive spatial surveillance map locked to Caloocan City.
                  </Text>
                  <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.guideCardTitle, { color: colors.primary }]}>Target Disease Radar Circles</Text>
                    <Text style={[styles.guideCardBody, { color: colors.subtext }]}>
                      • <Text style={{ color: '#EF4444', fontWeight: '700' }}>Red Circle (Dengue)</Text>: Outbreak warning heat zone in Barangay 12 Grace Park (14 listed cases).{'\n'}
                      • <Text style={{ color: '#F97316', fontWeight: '700' }}>Orange Circle (Leptospirosis)</Text>: Floodwater contamination risk in Barangay 8 (6 listed cases).{'\n'}
                      • <Text style={{ color: '#EAB308', fontWeight: '700' }}>Yellow Circle (Rabies)</Text>: Stray animal bite risk center in Barangay 20 (4 listed cases).{'\n'}
                      • <Text style={{ color: '#A855F7', fontWeight: '700' }}>Purple Circle (Malaria)</Text>: Vector mosquito control station in Barangay 5 (2 listed cases).
                    </Text>
                  </View>

                  <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.guideCardTitle, { color: colors.primary }]}>📍 Location Dot & Proximity Analysis</Text>
                    <Text style={[styles.guideCardBody, { color: colors.subtext }]}>
                      Tap the <Text style={{ fontWeight: '700' }}>Snipe Target / Location Dot 📍</Text> button in the bottom right. The map smoothly zooms to your home barangay (Barangay 12, Grace Park) and displays a 2.5-second proximity alert box showing your exact distance to hazard zones.
                    </Text>
                  </View>
                </View>
              )}

              {activeDocChapter === 2 && (
                <View>
                  <Text style={styles.sectionHeading}>🚨 Chapter 2: Incident Reporting & Complaints</Text>
                  <Text style={[styles.guideCardBody, { color: colors.text, marginBottom: 8 }]}>
                    Citizens can file official environmental complaints directly to the Caloocan City Health Office.
                  </Text>
                  <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.guideCardTitle, { color: colors.primary }]}>Filing a Report Step-by-Step</Text>
                    <Text style={[styles.guideCardBody, { color: colors.subtext }]}>
                      1. Open <Text style={{ fontWeight: '700' }}>Services → Report Issue</Text>.{'\n'}
                      2. Choose issue category (Stagnant Water / Mosquito Site, Waste Accumulation, Unsanitary Sewer).{'\n'}
                      3. Select urgency level (Normal, Urgent, Emergency).{'\n'}
                      4. Attach photo evidence and enter street location details.{'\n'}
                      5. Submit report to generate a tracking ticket (e.g. <Text style={{ fontWeight: '700' }}>CS-001</Text>).
                    </Text>
                  </View>
                </View>
              )}

              {activeDocChapter === 3 && (
                <View>
                  <Text style={styles.sectionHeading}>💧 Chapter 3: Wastewater & Septic Tank Services</Text>
                  <Text style={[styles.guideCardBody, { color: colors.text, marginBottom: 8 }]}>
                    Homeowners and business owners in Caloocan can request municipal wastewater management services.
                  </Text>
                  <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.guideCardTitle, { color: colors.primary }]}>Available Wastewater Operations</Text>
                    <Text style={[styles.guideCardBody, { color: colors.subtext }]}>
                      • <Text style={{ fontWeight: '700' }}>Septic Tank Desludging</Text>: 50% subsidized residential cleaning for Caloocan homeowners.{'\n'}
                      • <Text style={{ fontWeight: '700' }}>Grease Trap Cleaning</Text>: Commercial food establishment grease trap maintenance.{'\n'}
                      • Track fleet truck assignment & scheduled pickup time in <Text style={{ fontWeight: '700' }}>Records</Text>.
                    </Text>
                  </View>
                </View>
              )}

              {activeDocChapter === 4 && (
                <View>
                  <Text style={styles.sectionHeading}>📑 Chapter 4: Business Sanitation Permits</Text>
                  <Text style={[styles.guideCardBody, { color: colors.text, marginBottom: 8 }]}>
                    Food eateries, water refilling stations, and commercial shops must maintain active sanitary permits.
                  </Text>
                  <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.guideCardTitle, { color: colors.primary }]}>Sanitation Clearance Workflow</Text>
                    <Text style={[styles.guideCardBody, { color: colors.subtext }]}>
                      1. Apply online under <Text style={{ fontWeight: '700' }}>Services → Sanitation Permits</Text>.{'\n'}
                      2. Upload business permit & water bacteriological test certificates.{'\n'}
                      3. Pay inspection fee via GCash or Municipal Treasury counter.{'\n'}
                      4. Download official digital Sanitation Permit PDF ticket (e.g. <Text style={{ fontWeight: '700' }}>SP-1042</Text>).
                    </Text>
                  </View>
                </View>
              )}

              {activeDocChapter === 5 && (
                <View>
                  <Text style={styles.sectionHeading}>💉 Chapter 5: Immunization & Family Portal</Text>
                  <Text style={[styles.guideCardBody, { color: colors.text, marginBottom: 8 }]}>
                    Manage immunizations for yourself and family dependents.
                  </Text>
                  <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.guideCardTitle, { color: colors.primary }]}>Digital Vaccine Passports</Text>
                    <Text style={[styles.guideCardBody, { color: colors.subtext }]}>
                      • View Covid-19, Quadrivalent Flu, and MMR immunization logs.{'\n'}
                      • Add family dependents (spouses, children) under <Text style={{ fontWeight: '700' }}>Profile → Family Members</Text>.{'\n'}
                      • Generate & print official digital vaccine QR certificates.
                    </Text>
                  </View>
                </View>
              )}

              {activeDocChapter === 6 && (
                <View>
                  <Text style={styles.sectionHeading}>📡 Chapter 6: Offline Mode & Supabase Sync</Text>
                  <Text style={[styles.guideCardBody, { color: colors.text, marginBottom: 8 }]}>
                    Built for typhoon signal resilience in Caloocan City.
                  </Text>
                  <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.guideCardTitle, { color: colors.primary }]}>Offline Outbox Operations</Text>
                    <Text style={[styles.guideCardBody, { color: colors.subtext }]}>
                      • When cell data is lost, all filed reports and booked appointments are saved to local device cache.{'\n'}
                      • Top status bar displays <Text style={{ color: '#FDBA74', fontWeight: '700' }}>OFFLINE MODE</Text> with pending queue counter.{'\n'}
                      • Upon internet reconnection, outbox queue automatically pushes to Supabase cloud tables.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={[styles.primaryModalBtn, { backgroundColor: colors.primary }]} onPress={() => setActiveModal(null)}>
              <Text style={styles.primaryModalBtnText}>DONE READING</Text>
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
  guideCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  guideCardTitle: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 13.5,
  },
  guideCardBody: {
    ...Typography.small,
    lineHeight: 18,
  },
  manualEntryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  manualEntryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualEntryTitle: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: 14,
  },
  manualEntrySub: {
    ...Typography.small,
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
});