export type Language = 'en' | 'tl' | 'ceb' | 'ilo';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'tl', label: 'Filipino (Tagalog)', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: 'ceb', label: 'Cebuano (Bisaya)', nativeName: 'Sinugboanon', flag: '🇵🇭' },
  { code: 'ilo', label: 'Ilocano', nativeName: 'Ilokano', flag: '🇵🇭' },
];

export const TRANSLATIONS = {
  // Navigation & General
  citizenPortal: {
    en: 'CITIZEN PORTAL',
    tl: 'PORTAL NG MAMAMAYAN',
    ceb: 'PORTAL SA LUMULUPYO',
    ilo: 'PORTAL TI MEMBRO',
  },
  healthSanitationOffice: {
    en: 'City Health & Sanitation Office',
    tl: 'Tanggapan ng Kalusugan at Sanitasyon',
    ceb: 'Tanggapan sa Panglawas ug Sanitasyon',
    ilo: 'Opisina ti Salun-at ken Sanitasyon',
  },
  goodDay: {
    en: 'Good Day',
    tl: 'Magandang Araw',
    ceb: 'Maayong Adlaw',
    ilo: 'Naimbag nga Aldaw',
  },
  // Home Screen Sections
  publicAnnouncements: {
    en: 'Public Announcements',
    tl: 'Mga Anunsyo Pampubliko',
    ceb: 'Pampublikong Mga Pahibalo',
    ilo: 'Pampubliko nga Pakaammo',
  },
  swipeForDetails: {
    en: 'Swipe for details',
    tl: 'I-swipe para sa detalye',
    ceb: 'I-swipe para sa detalye',
    ilo: 'I-swipe para iti detalye',
  },
  readFullAdvisory: {
    en: 'Read Full Advisory',
    tl: 'Basahin ang Buong Anunsyo',
    ceb: 'Basaha ang Tibuok Pahibalo',
    ilo: 'Basaen ti Nadumaduma nga Pakaammo',
  },
  personalNotifications: {
    en: 'Personal Notifications',
    tl: 'Mga Personal na Abiso',
    ceb: 'Personal nga Pahibalo',
    ilo: 'Personal nga Pakaammo',
  },
  viewAll: {
    en: 'View All',
    tl: 'Tingnan Lahat',
    ceb: 'Tan-awon Tanan',
    ilo: 'Kitaen Amin',
  },
  quickActions: {
    en: 'Quick Actions',
    tl: 'Mabilis na Aksyon',
    ceb: 'Dali nga Aksyon',
    ilo: 'Daras nga Aksyon',
  },
  // Quick Actions Labels
  bookAppt: {
    en: 'Book Appt',
    tl: 'Mag-book ng Appt',
    ceb: 'Mag-book og Appt',
    ilo: 'Ag-book ti Appt',
  },
  applyPermit: {
    en: 'Apply Permit',
    tl: 'Kumuha ng Permit',
    ceb: 'Kuha og Permit',
    ilo: 'Ag-apply ti Permit',
  },
  viewVaccines: {
    en: 'View Vaccines',
    tl: 'Mga Bakuna',
    ceb: 'Tan-awon Bakuna',
    ilo: 'Kitaen Bakuna',
  },
  requestService: {
    en: 'Request Service',
    tl: 'Humingi ng Serbisyu',
    ceb: 'Hangyo og Serbisyu',
    ilo: 'Kiddawen ti Sersibyo',
  },
  trackRequests: {
    en: 'Track Requests',
    tl: 'Sundan ang Rebound',
    ceb: 'Sundan ang Hangyo',
    ilo: 'Subaybayan ti Kiddaw',
  },
  reportIssue: {
    en: 'Report Issue',
    tl: 'Mag-ulat ng Isyu',
    ceb: 'I-report ang Isyu',
    ilo: 'Ag-report ti Problema',
  },
  // Stats
  appts: {
    en: 'Appts',
    tl: 'Appointments',
    ceb: 'Appointments',
    ilo: 'Appointments',
  },
  permits: {
    en: 'Permits',
    tl: 'Permit',
    ceb: 'Permit',
    ilo: 'Permit',
  },
  services: {
    en: 'Services',
    tl: 'Mga Serbisyo',
    ceb: 'Mga Serbisyo',
    ilo: 'Dagiti Sersibyo',
  },
  pending: {
    en: 'Pending',
    tl: 'Nakabinbin',
    ceb: 'Giproseso',
    ilo: 'Agestur',
  },
  // Settings & Profile
  selectLanguage: {
    en: 'Select App Language',
    tl: 'Pumili ng Wika',
    ceb: 'Pagpili og Pinulongan',
    ilo: 'Piliin ti Pagsasao',
  },
  languageUpdated: {
    en: 'Language Updated',
    tl: 'Na-update na ang Wika',
    ceb: 'Na-update na ang Pinulongan',
    ilo: 'Na-update ti Pagsasao',
  },
  closeLanguage: {
    en: 'CLOSE LANGUAGE',
    tl: 'ISARA ANG WIKA',
    ceb: 'ISARA ANG PINULONGAN',
    ilo: 'ISARA TI PAGSASAO',
  },
};
