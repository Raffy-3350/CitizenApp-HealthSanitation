import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "tl";

export const translations = {
  en: {
    // Navigation & Tabs
    tabHome: "Home",
    tabServices: "Services",
    tabRecords: "Records",
    tabMaps: "Maps",
    tabProfile: "Profile",

    profileTitle: "Citizen Profile",
    guestBadge: "GUEST USER",
    temporarySessionBadge: "TEMPORARY SESSION",
    verifiedResident: "VERIFIED RESIDENT",
    overviewTab: "Overview",
    settingsTab: "Settings",

    // Action Buttons
    editProfile: "Edit Profile",
    shareQr: "Share My QR",
    changePassword: "Change Password",
    logOut: "Log Out",

    // Overview Sections & Labels
    personalInformation: "Personal Information",
    emailAddress: "Email Address",
    mobileNumber: "Mobile Number",
    registeredAddress: "Registered Address",
    lastActiveLogin: "Last Active Login",
    registryStatus: "Registry Status",
    notProvided: "Not provided",
    notSetServices: "Not set (Complete in Citizen Services)",
    guestSession: "Guest Session",
    currentSessionGuest: "Current Session (Guest Mode)",

    // Family Members Section
    familyMembersTitle: "Family Members & Dependents",
    familyMembersSubtitle: "Registered family members linked to your citizen account.",
    addFamilyMember: "Add Family Member",
    noFamilyMembers: "No Family Members Registered",
    relationship: "Relationship",
    gender: "Gender",
    male: "Male",
    female: "Female",
    addMemberTitle: "Register Family Member",
    addMemberSub: "Enter details to link a family member to your profile.",
    saveFamilyMember: "Save Family Member",

    // Health Records Section
    healthRecordsTitle: "My Health Records & Immunizations",
    healthRecordsSubtitle: "Verified medical checkups, immunizations, and clinical clearances.",
    viewHealthDetails: "View Record Details",
    noHealthRecords: "No Health Records Found",
    facility: "Facility / Health Center",
    attendingDoctor: "Attending Physician",
    recordDetailsTitle: "Health Record Details",
    clinicalNotes: "Clinical Details & Result",

    // Profile Editing Modal
    editProfileTitle: "Edit Citizen Profile",
    editProfileSub: "Update your official contact details & personal information.",
    firstName: "First Name",
    lastName: "Last Name",
    barangay: "Barangay",
    birthDate: "Birth Date",
    civilStatus: "Civil Status",
    single: "Single",
    married: "Married",
    widowed: "Widowed",
    missingInfoTitle: "Missing Information",
    missingInfoMsg: "Please enter both your First Name and Last Name.",
    profileUpdatedTitle: "Profile Updated",
    profileUpdatedMsg: "Your personal details and profile information have been updated.",

    // Digital Citizen Card
    republicOfPhilippines: "REPUBLIC OF THE PHILIPPINES",
    cityGovernmentOfCaloocan: "CITY GOVERNMENT OF CALOOCAN",
    digitalCitizenResidentCard: "DIGITAL CITIZEN RESIDENT CARD",
    fullNameCaps: "FULL NAME",
    citizenIdNoCaps: "CITIZEN ID NO.",
    barangayResidenceCaps: "BARANGAY RESIDENCE",
    needCompleteVerificationTitle: "Need Complete Citizen ID Verification?",
    needCompleteVerificationSub: "To finish full details, submit documents & get your official ID, visit Citizen Services.",
    completeCitizenIdBtn: "Complete Citizen ID in Services",

    // Settings Cards & Rows
    appearanceAndTheme: "Appearance & Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    lightModeSub: "Bright modern light theme active for Civentral",
    darkModeSub: "Sleek dark theme active for Civentral",

    securityAndBiometrics: "Security & Biometrics",
    biometricSignIn: "Biometric Sign-In",
    biometricSignInSub: "Use Fingerprint or Face ID for fast login",
    changeAccountPassword: "Change Account Password",

    notificationsAndAlerts: "Notifications & Alerts",
    cityPushNotifications: "City Push Notifications",
    cityPushNotificationsSub: "Receive updates on civic services & announcements",
    emergencySosBroadcasts: "Emergency SOS Broadcasts",
    emergencySosBroadcastsSub: "Receive real-time disaster & emergency warnings",

    supportAboutTitle: "Support & About",
    cityHallHelpDesk: "City Hall Citizen Help Desk",
    privacyPolicy: "Privacy & Data Protection Policy (RA 10173)",
    appLanguage: "App Language / Wika",

    // Language Modal
    selectLanguageTitle: "App Language / Wika",
    selectLanguageSub: "Select your preferred display language",
    englishLabel: "English",
    englishSub: "Standard English interface",
    tagalogLabel: "Tagalog (Filipino)",
    tagalogSub: "Wikang Filipino sa UI",
    saveLanguage: "Save Preference",

    // Privacy Policy Modal
    privacyPolicyTitle: "Policy & Terms of Access",
    privacyPolicyLaw: "Republic Act No. 10173 (Philippine Data Privacy Act of 2012)",
    scrollBannerText: "Please read and scroll to the end of the policy to enable the Agree button.",
    scrollCompleteText: "Review complete. You may now click Agree.",
    introTitle: "CIVENTRAL PORTAL — DATA PRIVACY & TERMS OF ACCESS",
    introSub: "Guidelines for handling citizen, patient, and permit information under Republic Act No. 10173.",
    sec1Title: "Personal Data Protection",
    sec1Summary: "Personal information complies with the Data Privacy Act.",
    sec1Bullet1: "All citizen names, contact numbers, residential addresses, and medical records are strictly confidential.",
    sec1Bullet2: "Do not share, screenshot, copy, or distribute citizen information outside official duties.",
    sec1Bullet3: "Keep confidential data masked on screen when assisting in public areas or shared workspaces.",
    sec2Title: "Consent Management",
    sec2Summary: "User consent is properly collected and managed.",
    sec2Bullet1: "Citizens must willingly agree to data processing before registration or medical intake.",
    sec2Bullet2: "Never check privacy consent boxes on behalf of a citizen without their explicit permission.",
    sec2Bullet3: "Citizens have the right to withdraw their consent at any time through official request channels.",
    sec3Title: "Right to Delete Data",
    sec3Summary: "Users can request deletion of personal information.",
    sec3Bullet1: "Citizens have the right to request erasure or anonymization of their personal information.",
    sec3Bullet2: "Staff must route all citizen deletion requests to authorized administrators for compliance review.",
    sec3Bullet3: "Clinical history will be handled in accordance with Department of Health retention policies.",
    sec4Title: "Data Breach Reporting",
    sec4Summary: "Incidents involving citizen data must be promptly reported.",
    sec4Bullet1: "Any accidental or unauthorized disclosure of citizen data must be reported to the Data Privacy Officer within 72 hours.",
    sec4Bullet2: "Do not attempt to conceal, delete, or alter records related to a suspected data breach.",
    sec4Bullet3: "Failure to report a known breach is a violation of RA 10173 and is subject to administrative sanctions.",
    sec5Title: "System Access & Accountability",
    sec5Summary: "Access to the Civentral portal is logged and audited.",
    sec5Bullet1: "Never share your login credentials, PIN, or OTP with any other staff member or citizen.",
    sec5Bullet2: "All actions within the system are recorded under your account and are subject to audit.",
    sec5Bullet3: "Unauthorized access or access beyond your assigned role level is a disciplinary offense.",
    sec6Title: "Cookies & Local Storage Policy",
    sec6Summary: "Civentral utilizes browser cookies and local secure storage to manage sessions and preferences.",
    sec6Bullet1: "Essential cookies and local storage tokens maintain your secure login session and language settings.",
    sec6Bullet2: "Embedded web services and third-party portals accessed via the app may place operational cookies for transaction processing.",
    sec6Bullet3: "No tracking or advertising cookies are used to sell or commercialize citizen data.",
    sec7Title: "Third-Party Service Providers & Notices",
    sec7Summary: "Third-party APIs and open-source libraries are integrated to deliver municipal services.",
    sec7Bullet1: "Mapping & Geolocation: Interactive maps utilize OpenStreetMap, Leaflet, and device location APIs to display local facilities and alert zones.",
    sec7Bullet2: "Payment & Telephony: External payment portals (GCash, Maya, Bank Services) and SMS gateway providers process transactions securely under strict data processing agreements.",
    sec7Bullet3: "Open Source Attribution: Framework components (React Native, Expo) are licensed under standard open-source licenses (MIT/Apache 2.0).",
    acknowledgmentTitle: "Employee Acknowledgment",
    acknowledgmentBody: "By clicking \"I Have Read & Agree\", you confirm your responsibility to protect citizen data and follow these privacy policies.",
    agreeBtnText: "I Have Read & Agree to Terms",
    scrollReminderBtnText: "Scroll to End to Agree",
    cancelText: "Cancel",
    agreedAlertTitle: "Privacy Policy Agreed",
    agreedAlertBody: "You have agreed to the Civentral Privacy & Data Protection Policy (RA 10173).",

    // Common Modals & Alerts
    notificationsTitle: "Notifications & Alerts",
    notificationsSubtitle: "Real-time municipal announcements, emergency warnings & status updates.",
    filterAll: "All",
    filterUnread: "Unread",
    filterEmergency: "Emergency",
    filterServices: "Services",
    markAllRead: "Mark All as Read",
    noNotifications: "No Notifications",
    noNotificationsSub: "You're all caught up with city announcements.",
    notificationDetail: "Notification Details",
    saveChanges: "Save Changes",
    updatePassword: "Update Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    digitalPassTitle: "Citizen Digital Pass",
    scanVerification: "Scan for Verification",
    closeBtn: "Close",
    logoutModalTitle: "Confirm Sign Out",
    logoutModalBody: "Are you sure you want to log out of your session?",
    confirmLogout: "Yes, Sign Out",
  },
  tl: {
    // Navigation & Tabs
    tabHome: "Tahanan",
    tabServices: "Serbisyo",
    tabRecords: "Rekord",
    tabMaps: "Mapa",
    tabProfile: "Profile",

    profileTitle: "Profile ng Mamamayan",
    guestBadge: "GUMAGAMIT NA BISITA",
    temporarySessionBadge: "PANSAMANTALANG SESYON",
    verifiedResident: "KUMPIRMADONG RESIDENTE",
    overviewTab: "Pangkalahatan",
    settingsTab: "Mga Setting",

    // Action Buttons
    editProfile: "Baguhin ang Profile",
    shareQr: "Ibahagi ang Aking QR",
    changePassword: "Palitan ang Password",
    logOut: "Mag-log Out",

    // Overview Sections & Labels
    personalInformation: "Personal na Impormasyon",
    emailAddress: "Email Address",
    mobileNumber: "Numero ng Telepono",
    registeredAddress: "Nakatatalang Tirahan",
    lastActiveLogin: "Huling Pag-login",
    registryStatus: "Katayuan sa Rehistro",
    notProvided: "Hindi naibigay",
    notSetServices: "Hindi pa nakaset (Kumpletuhin sa Mga Serbisyo)",
    guestSession: "Sesyon ng Bisita",
    currentSessionGuest: "Kasalukuyang Sesyon (Mode ng Bisita)",

    // Family Members Section
    familyMembersTitle: "Mga Miyembro ng Pamilya at Dependents",
    familyMembersSubtitle: "Nakatatalang miyembro ng pamilya sa iyong citizen account.",
    addFamilyMember: "Magdagdag ng Miyembro ng Pamilya",
    noFamilyMembers: "Walang Nakatatalang Miyembro ng Pamilya",
    relationship: "Relasyon",
    gender: "Kasarian",
    male: "Lalaki",
    female: "Babae",
    addMemberTitle: "Mag-rehistro ng Miyembro ng Pamilya",
    addMemberSub: "Ilagay ang mga detalye upang i-link ang miyembro ng pamilya.",
    saveFamilyMember: "I-save ang Miyembro",

    // Health Records Section
    healthRecordsTitle: "Aking Mga Rekord sa Kalusugan at Bakuna",
    healthRecordsSubtitle: "Mga berypikal na reseta, bakuna, at rekord ng kalusugan.",
    viewHealthDetails: "Tingnan ang Detalye ng Rekord",
    noHealthRecords: "Walang Nahanap na Rekord sa Kalusugan",
    facility: "Pasilidad / Health Center",
    attendingDoctor: "Doktor / Manggagamot",
    recordDetailsTitle: "Mga Detalye ng Rekord sa Kalusugan",
    clinicalNotes: "Klinikal na Detalye at Resulta",

    // Profile Editing Modal
    editProfileTitle: "Baguhin ang Profile ng Mamamayan",
    editProfileSub: "Baguhin ang iyong opisyal na detalye ng pagkontak at impormasyon.",
    firstName: "Unang Pangalan",
    lastName: "Apelyido",
    barangay: "Barangay",
    birthDate: "Kaarawan",
    civilStatus: "Sibil na Katayuan",
    single: "Binata / Dalaga",
    married: "May Asawa",
    widowed: "Biyudo / Biyuda",
    missingInfoTitle: "Kulang na Impormasyon",
    missingInfoMsg: "Mangyaring ilagay ang iyong Unang Pangalan at Apelyido.",
    profileUpdatedTitle: "Na-update ang Profile",
    profileUpdatedMsg: "Matagumpay na na-update ang iyong mga personal na detalye.",

    // Digital Citizen Card
    republicOfPhilippines: "REPUBLIKA NG PILIPINAS",
    cityGovernmentOfCaloocan: "PAMAHALAANG LUNGSOD NG CALOOCAN",
    digitalCitizenResidentCard: "DIGITAL ID NG RESIDENTENG MAMAMAYAN",
    fullNameCaps: "BUONG PANGALAN",
    citizenIdNoCaps: "NUMERO NG CITIZEN ID",
    barangayResidenceCaps: "BARANGAY NA TIRAHAN",
    needCompleteVerificationTitle: "Kailangan ng Kumpletong Berypikasyon ng Citizen ID?",
    needCompleteVerificationSub: "Upang makumpleto ang mga detalye, magpasa ng dokumento at makuha ang iyong opisyal na ID, pumunta sa Mga Serbisyo.",
    completeCitizenIdBtn: "Kumpletuhin ang Citizen ID sa Serbisyo",

    // Settings Cards & Rows
    appearanceAndTheme: "Anyo at Tema",
    lightMode: "Maliwanag na Tema (Light Mode)",
    darkMode: "Madilim na Tema (Dark Mode)",
    lightModeSub: "Aktibong maliwanag at makabagong tema para sa Civentral",
    darkModeSub: "Aktibong madilim na tema para sa Civentral",

    securityAndBiometrics: "Seguridad at Biometrics",
    biometricSignIn: "Biometric Sign-In",
    biometricSignInSub: "Gamitin ang Fingerprint o Face ID sa mabilis na pag-login",
    changeAccountPassword: "Palitan ang Password ng Account",

    notificationsAndAlerts: "Mga Notipikasyon at Babala",
    cityPushNotifications: "Notipikasyon ng Lungsod",
    cityPushNotificationsSub: "Makatanggap ng balita sa mga serbisyo sibil at anunsyo",
    emergencySosBroadcasts: "Emergency SOS Broadcasts",
    emergencySosBroadcastsSub: "Makatanggap ng babala sa sakuna at emergency",

    supportAboutTitle: "Suporta at Impormasyon",
    cityHallHelpDesk: "Desk ng Tulong para sa Mamamayan sa City Hall",
    privacyPolicy: "Patakaran sa Data Privacy (RA 10173)",
    appLanguage: "Wika ng App / Language",

    // Language Modal
    selectLanguageTitle: "Wika ng App / Language",
    selectLanguageSub: "Pumili ng nais mong wika sa app",
    englishLabel: "English",
    englishSub: "Standard na wikang Ingles sa interface",
    tagalogLabel: "Tagalog (Filipino)",
    tagalogSub: "Wikang Filipino sa UI",
    saveLanguage: "I-save ang Wika",

    // Privacy Policy Modal
    privacyPolicyTitle: "Patakaran at Mga Tuntunin ng Access",
    privacyPolicyLaw: "Batas Republika Blg. 10173 (Data Privacy Act of 2012)",
    scrollBannerText: "Paki-basa at i-scroll hanggang dulo para ma-enable ang button na Sumasang-ayon.",
    scrollCompleteText: "Tapos na ang pagsusuri. Maaari mo nang i-click ang Sumasang-ayon.",
    introTitle: "CIVENTRAL PORTAL — PRIVACY NG DATOS AT TERMS NG ACCESS",
    introSub: "Mga alituntunin sa paghawak ng impormasyon ng mamamayan, pasyente, at permit ayon sa RA 10173.",
    sec1Title: "Proteksyon sa Personal na Datos",
    sec1Summary: "Ang personal na impormasyon ay alinsunod sa Data Privacy Act.",
    sec1Bullet1: "Lahat ng pangalan, numero ng telepono, tirahan, at rekord ng kalusugan ng mamamayan ay lubos na kumpidensyal.",
    sec1Bullet2: "Huwag ibahagi, i-screenshot, kopyahin, o ipamahagi ang datos ng mamamayan sa labas ng opisyal na tungkulin.",
    sec1Bullet3: "Panatilihing nakatago ang kumpidensyal na datos kapag tumutulong sa pampublikong lugar.",
    sec2Title: "Pamamahala ng Pahintulot (Consent)",
    sec2Summary: "Maayos na kinokolekta at pinamamahalaan ang pahintulot ng gumagamit.",
    sec2Bullet1: "Dapat kusang sumang-ayon ang mamamayan bago iproseso ang kanilang datos.",
    sec2Bullet2: "Huwag kailanman i-check ang privacy consent para sa mamamayan nang walang pahintulot nila.",
    sec2Bullet3: "May karapatan ang mamamayan na bawiin ang kanilang consent sa pamamagitan ng opisyal na kahilingan.",
    sec3Title: "Karapatang Magpabura ng Datos",
    sec3Summary: "Maaaring humiling ang gumagamit na burahin ang kanilang personal na datos.",
    sec3Bullet1: "May karapatan ang mamamayan na humiling ng pagbura o pag-anonymize ng kanilang impormasyon.",
    sec3Bullet2: "Dapat i-refer ng staff ang lahat ng kahilingan sa pagbura sa awtorisadong tagapamahala.",
    sec3Bullet3: "Ang rekord sa kalusugan ay hahawakan alinsunod sa patakaran ng Department of Health.",
    sec4Title: "Pag-uulat ng Data Breach",
    sec4Summary: "Ang anumang insidente ng datos ay dapat agad na iulat.",
    sec4Bullet1: "Anumang hindi sinasadyang pagkabunyag ng datos ay dapat iulat sa Data Privacy Officer sa loob ng 72 oras.",
    sec4Bullet2: "Huwag subukang itago, burahin, o baguhin ang mga rekord tungkol sa pinaghihinalaang data breach.",
    sec4Bullet3: "Ang hindi pag-uulat ng alam na breach ay paglabag sa RA 10173 at may kaukulang parusa.",
    sec5Title: "Access sa Sistema at Pananagutan",
    sec5Summary: "Ang access sa Civentral portal ay nakatala at sinusuri.",
    sec5Bullet1: "Huwag kailanman ibahagi ang iyong login credentials, PIN, o OTP sa ibang tao.",
    sec5Bullet2: "Lahat ng aksyon sa sistema ay nakatala sa ilalim ng iyong account at pwedeng i-audit.",
    sec5Bullet3: "Ang walang awtorisasyong access ay itinuturing na paglabag sa disiplina.",
    sec6Title: "Patakaran sa Cookies at Lokal na Storage",
    sec6Summary: "Gumagamit ang Civentral ng mga cookies at lokal na secure storage para pamahalaan ang iyong session at preferences.",
    sec6Bullet1: "Ginagamit ang mga kinakailangang cookies at storage tokens upang mapanatili ang iyong ligtas na pag-login at setting ng wika.",
    sec6Bullet2: "Ang mga nakapaloob na serbisyo sa web at portal ay maaaring gumamit ng cookies para sa pagproseso ng mga transaksyon.",
    sec6Bullet3: "Walang ginagamit na tracking o advertising cookies para magbenta ng datos ng mamamayan.",
    sec7Title: "Mga Pahayag sa Ikatlong Partido at Serbisyong API",
    sec7Summary: "May mga nakatalagang ikatlong partidong API at open-source libraries upang maghatid ng serbisyo.",
    sec7Bullet1: "Mapa at Geolocation: Gumagamit ang mga interactive map ng OpenStreetMap, Leaflet, at location API upang maipakita ang mga pasilidad.",
    sec7Bullet2: "Pagbabayad at Teleponya: Ang mga external na payment gateway at SMS provider ay nagpoproseso ng transaksyon ayon sa kasunduan sa data privacy.",
    sec7Bullet3: "Open Source Attribution: Ang mga bahagi ng framework (React Native, Expo) ay nakalisenya sa ilalim ng standard open-source licenses.",
    acknowledgmentTitle: "Pagkilala ng Kawani",
    acknowledgmentBody: "Sa pag-click ng \"Nabasa at Sumasang-ayon Ako\", kinukumpirma mo ang iyong tungkulin na protektahan ang datos ng mamamayan.",
    agreeBtnText: "Nabasa at Sumasang-ayon Ako sa Mga Patakaran",
    scrollReminderBtnText: "I-scroll Hanggang Dulo Para Sumang-ayon",
    cancelText: "Kanselahin",
    agreedAlertTitle: "Naitala ang Pagsang-ayon",
    agreedAlertBody: "Sumasang-ayon ka na sa Civentral Privacy & Data Protection Policy (RA 10173).",

    // Common Modals & Alerts
    notificationsTitle: "Mga Notipikasyon at Babala",
    notificationsSubtitle: "Mga real-time na anunsyo ng lungsod, babala sa emergency at update sa katayuan.",
    filterAll: "Lahat",
    filterUnread: "Hindi Pa Nababasa",
    filterEmergency: "Emergency",
    filterServices: "Mga Serbisyo",
    markAllRead: "Markahan Lahat bilang Nabasa",
    noNotifications: "Walang Mga Notipikasyon",
    noNotificationsSub: "Huli ka na sa lahat ng anunsyo sa lungsod.",
    notificationDetail: "Mga Detalye ng Notipikasyon",
    saveChanges: "I-save ang Pagbabago",
    updatePassword: "I-update ang Password",
    currentPassword: "Kasalukuyang Password",
    newPassword: "Bagong Password",
    confirmPassword: "Kumpirmahin ang Bagong Password",
    digitalPassTitle: "Digital Pass ng Mamamayan",
    scanVerification: "I-scan para sa Pagpapatunay",
    closeBtn: "Isara",
    logoutModalTitle: "Kumpirmahin ang Pag-log Out",
    logoutModalBody: "Sigurado ka bang gusto mong mag-log out sa iyong session?",
    confirmLogout: "Oo, Mag-log Out",
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  labels: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations.en[key] || key,
  labels: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const labels = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, labels }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
