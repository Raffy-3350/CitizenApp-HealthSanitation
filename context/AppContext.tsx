import React, { createContext, useContext, useState } from 'react';

// Types
export interface Appointment {
  id: string;
  service: string;
  center: string;
  date: string;
  time: string;
  doctor: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Completed' | 'Cancelled';
  statusType: 'approved' | 'pending' | 'completed' | 'rejected';
}

export interface Permit {
  id: string;
  businessName: string;
  businessType: string;
  address: string;
  paymentMethod: string;
  fee: string;
  status: 'Under Review' | 'Inspection Scheduled' | 'Approved' | 'Expired';
  statusType: 'pending' | 'approved' | 'completed' | 'rejected';
  date: string;
}

export interface WastewaterService {
  id: string;
  serviceType: string;
  address: string;
  tankSize: string;
  scheduleDate: string;
  scheduleTime: string;
  cost: string;
  status: 'Pending Assignment' | 'Confirmed' | 'Completed';
  statusType: 'pending' | 'approved' | 'completed';
}

export interface HealthReport {
  id: string;
  issueType: string;
  location: string;
  description: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  photoAttached: boolean;
  status: 'Under Investigation' | 'Inspector Assigned' | 'Resolved';
  statusType: 'pending' | 'approved' | 'completed';
  date: string;
}

export interface Vaccine {
  id: string;
  name: string;
  recipient: 'Pedro' | 'Sofia' | 'Maria';
  status: 'Completed' | 'Due' | 'Scheduled';
  date: string;
  color: string;
  certId?: string;
}

export interface AlertItem {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  icon: string;
  color: string;
  read: boolean;
  priority?: 'high' | 'normal';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  philhealth: string;
  bloodType: string;
  allergies: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: string;
  vaccines: string;
  status: string;
}

export interface Announcement {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: 'Health Alert' | 'Community Drive' | 'Sanitation Notice' | 'Public Service';
  date: string;
  priority: 'urgent' | 'normal';
  targetRole: 'citizen' | 'employee' | 'all';
  icon: string;
  color: string;
  badgeText?: string;
  actionRoute?: string;
  actionLabel?: string;
  location?: string;
}

import { Language, TRANSLATIONS } from '../constants/translations';

interface AppContextType {
  appointments: Appointment[];
  permits: Permit[];
  services: WastewaterService[];
  reports: HealthReport[];
  vaccines: Vaccine[];
  alerts: AlertItem[];
  announcements: Announcement[];
  userProfile: UserProfile;
  familyMembers: FamilyMember[];
  themeMode: 'light' | 'dark' | 'system';
  language: Language;
  isOffline: boolean;
  offlineSyncQueueCount: number;

  // Actions & Translation
  setLanguage: (lang: Language) => void;
  toggleOfflineMode: () => void;
  syncOfflineQueueWithSupabase: () => void;
  t: (key: keyof typeof TRANSLATIONS) => string;
  addAppointment: (appt: Omit<Appointment, 'id' | 'status' | 'statusType'>) => void;
  addPermit: (permit: Omit<Permit, 'id' | 'status' | 'statusType' | 'date' | 'fee'>) => void;
  addService: (service: Omit<WastewaterService, 'id' | 'status' | 'statusType' | 'cost'>) => void;
  addReport: (report: Omit<HealthReport, 'id' | 'status' | 'statusType' | 'date'>) => void;
  markAlertRead: (id: number) => void;
  markAllAlertsRead: () => void;
  toggleVaccineStatus: (id: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

// Initial Decoy Data
const initialAppointments: Appointment[] = [
  {
    id: 'APT-1042',
    service: 'General Health Checkup',
    center: 'Health Center 1 - Brgy. 7',
    date: 'July 28, 2026',
    time: '9:00 AM',
    doctor: 'Dr. Santos (General)',
    reason: 'Annual routine health assessment',
    status: 'Approved',
    statusType: 'approved',
  },
  {
    id: 'APT-1088',
    service: 'Dental Cleaning & Care',
    center: 'Health Center 2 - Main Plaza',
    date: 'August 5, 2026',
    time: '10:30 AM',
    doctor: 'Dr. Cruz (Dentistry)',
    reason: 'Bi-annual dental prophylaxis',
    status: 'Pending',
    statusType: 'pending',
  },
];

const initialPermits: Permit[] = [
  {
    id: 'SP-1042',
    businessName: 'Pedro’s Fresh Eatery',
    businessType: 'Food Establishment (Eatery)',
    address: '123 Sampaguita St, Brgy. 7',
    paymentMethod: 'GCash e-Wallet',
    fee: '₱500.00',
    status: 'Under Review',
    statusType: 'pending',
    date: 'July 15, 2026',
  },
  {
    id: 'SP-1038',
    businessName: 'Pedro Water Refilling Station',
    businessType: 'Water Refilling Station',
    address: '125 Sampaguita St, Brgy. 7',
    paymentMethod: 'Over-the-Counter',
    fee: '₱750.00',
    status: 'Expired',
    statusType: 'rejected',
    date: 'June 10, 2025',
  },
];

const initialServices: WastewaterService[] = [
  {
    id: 'WW-201',
    serviceType: 'Septic Tank Desludging & Cleaning',
    address: '123 Sampaguita St, Brgy. 7',
    tankSize: 'Medium (2,500 Liters)',
    scheduleDate: 'July 25, 2026',
    scheduleTime: '10:00 AM - 12:00 PM',
    cost: '₱1,200.00',
    status: 'Pending Assignment',
    statusType: 'pending',
  },
  {
    id: 'WW-203',
    serviceType: 'Grease Trap Cleaning',
    address: '123 Sampaguita St, Brgy. 7',
    tankSize: 'Small (1,000 Liters)',
    scheduleDate: 'July 12, 2026',
    scheduleTime: '1:00 PM - 3:00 PM',
    cost: '₱850.00',
    status: 'Completed',
    statusType: 'completed',
  },
];

const initialReports: HealthReport[] = [
  {
    id: 'CS-001',
    issueType: 'Stagnant Water / Mosquito Breeding Site',
    location: 'Open Canal, Cor. Sampaguita St & 5th Ave',
    description: 'Deep standing water accumulation after rain, potential Dengue risk.',
    urgency: 'urgent',
    photoAttached: true,
    status: 'Under Investigation',
    statusType: 'pending',
    date: 'July 18, 2026',
  },
  {
    id: 'CS-002',
    issueType: 'Improper Waste Disposal',
    location: 'Vacant Lot beside Brgy. Hall',
    description: 'Uncollected unsegregated garbage causing foul odor and flies.',
    urgency: 'normal',
    photoAttached: false,
    status: 'Resolved',
    statusType: 'completed',
    date: 'July 10, 2026',
  },
];

const initialVaccines: Vaccine[] = [
  { id: 'VAC-01', name: 'COVID-19 Booster (Bivalent)', recipient: 'Pedro', status: 'Completed', date: 'Nov 14, 2025', color: '#2ecc71', certId: 'CERT-COV-8821' },
  { id: 'VAC-02', name: 'Influenza (Quadrivalent)', recipient: 'Pedro', status: 'Completed', date: 'Sep 02, 2025', color: '#2ecc71', certId: 'CERT-FLU-3312' },
  { id: 'VAC-03', name: 'Tetanus Toxoid', recipient: 'Pedro', status: 'Completed', date: 'Jun 19, 2024', color: '#2ecc71', certId: 'CERT-TET-9011' },
  { id: 'VAC-04', name: 'Hepatitis B Vaccine', recipient: 'Pedro', status: 'Due', date: 'Pending Schedule', color: '#f39c12' },
  { id: 'VAC-05', name: 'BCG (Tuberculosis)', recipient: 'Sofia', status: 'Completed', date: 'Aug 10, 2024', color: '#2ecc71', certId: 'CERT-BCG-0019' },
  { id: 'VAC-06', name: 'DPT 1st & 2nd Dose', recipient: 'Sofia', status: 'Completed', date: 'Jan 15, 2025', color: '#2ecc71', certId: 'CERT-DPT-1102' },
  { id: 'VAC-07', name: 'MMR Booster (Measles, Mumps)', recipient: 'Sofia', status: 'Due', date: 'July 28, 2026', color: '#f39c12' },
];

const initialAlerts: AlertItem[] = [
  { id: 1, type: 'Health Alert', title: 'Dengue Outbreak Caution', message: 'Several cases reported in Brgy 7. City Health has scheduled fogging on July 24.', time: '2 hours ago', icon: 'alert-circle', color: '#e74c3c', read: false, priority: 'high' },
  { id: 2, type: 'Appointment Reminder', title: 'Upcoming Clinic Visit Tomorrow', message: 'General Checkup at Health Center 1 tomorrow 9:00 AM.', time: '5 hours ago', icon: 'time', color: '#f39c12', read: false },
  { id: 3, type: 'Permit Status', title: 'SP-1042 Under Inspection Review', message: 'Sanitation Officer assigned for site verification.', time: '1 day ago', icon: 'document-text', color: '#3498db', read: false },
  { id: 4, type: 'Service Completed', title: 'Wastewater Service Completed', message: 'Septic tank cleaning on July 12 was completed successfully.', time: '2 days ago', icon: 'water', color: '#2ecc71', read: true },
  { id: 5, type: 'Vaccine Reminder', title: 'Sofia’s MMR Booster Due Soon', message: 'MMR booster due on July 28, 2026 at Health Center 1.', time: '3 days ago', icon: 'medkit', color: '#9b59b6', read: true },
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'ANN-101',
    title: 'Free Anti-Rabies & Flu Shot Community Drive',
    subtitle: 'Brgy. 7 Main Health Center',
    category: 'Community Drive',
    date: 'Aug 15 - 17, 2026',
    content: 'The City Health Office is conducting a 3-day free vaccination drive. Anti-rabies shots for pets and Quadrivalent Flu vaccines for senior citizens and kids below 5 are available free of charge.',
    priority: 'urgent',
    targetRole: 'citizen',
    icon: 'medkit',
    color: '#10B981',
    badgeText: 'Free Service',
    actionRoute: '/(tabs)/view-vaccines',
    actionLabel: 'Check Vaccine Portal',
    location: 'Brgy. 7 Health Center Quadrangle',
  },
  {
    id: 'ANN-102',
    title: 'Barangay Misting & Dengue Prevention Campaign',
    subtitle: 'District-wide Sanitation Operation',
    category: 'Health Alert',
    date: 'Aug 12, 2026 | 6:00 AM',
    content: 'City Sanitation officers will perform chemical misting and canal declogging in Brgy. 7 & 8. Residents are advised to cover open food containers and store drinking water safely.',
    priority: 'urgent',
    targetRole: 'citizen',
    icon: 'shield-checkmark',
    color: '#EF4444',
    badgeText: 'Urgent Advisory',
    actionRoute: '/(tabs)/report-issue',
    actionLabel: 'Report Breeding Site',
    location: 'Barangay 7 & 8 Residential Zones',
  },
  {
    id: 'ANN-103',
    title: 'Subsidized Septic Tank Desludging Program',
    subtitle: 'Wastewater Management Unit',
    category: 'Public Service',
    date: 'August 2026 Slots Open',
    content: 'Registered homeowners in Brgy. 7 can request priority septic tank cleaning at a 50% subsidized rate for the month of August. Slots are limited.',
    priority: 'normal',
    targetRole: 'citizen',
    icon: 'water',
    color: '#0284C7',
    badgeText: '50% Subsidy',
    actionRoute: '/(tabs)/request-service',
    actionLabel: 'Book Desludging',
    location: 'City-wide Residential District',
  },
];

const initialUserProfile: UserProfile = {
  name: 'Pedro García',
  email: 'pedro.garcia@email.com',
  phone: '0917-555-0192',
  address: '123 Sampaguita St, Brgy. 7, City',
  philhealth: '12-345678901-2',
  bloodType: 'O+',
  allergies: 'Penicillin (Mild)',
};

const initialFamilyMembers: FamilyMember[] = [
  { id: 'FAM-1', name: 'Maria García', relation: 'Spouse', age: '34 yrs', vaccines: '3 Recorded', status: 'Active' },
  { id: 'FAM-2', name: 'Sofia García', relation: 'Daughter', age: '2 yrs', vaccines: '3 Recorded (1 Due)', status: 'Active' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [permits, setPermits] = useState<Permit[]>(initialPermits);
  const [services, setServices] = useState<WastewaterService[]>(initialServices);
  const [reports, setReports] = useState<HealthReport[]>(initialReports);
  const [vaccines, setVaccines] = useState<Vaccine[]>(initialVaccines);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<Language>('en');

  // Offline Mode & Outbox Sync Queue State
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<any[]>([]);

  const toggleOfflineMode = () => {
    setIsOffline((prev) => !prev);
  };

  const syncOfflineQueueWithSupabase = () => {
    if (offlineSyncQueue.length === 0) return;
    setOfflineSyncQueue([]);
    const syncAlert: AlertItem = {
      id: Date.now(),
      type: 'Supabase Sync',
      title: 'Cloud Auto-Sync Complete',
      message: 'Successfully synchronized offline reports to Caloocan Supabase Database.',
      time: 'Just now',
      icon: 'cloud-done',
      color: '#10B981',
      read: false,
    };
    setAlerts((prev) => [syncAlert, ...prev]);
  };

  const t = (key: keyof typeof TRANSLATIONS): string => {
    const translationItem = TRANSLATIONS[key];
    if (!translationItem) return key;
    return translationItem[language] || translationItem['en'] || key;
  };

  const addAppointment = (appt: Omit<Appointment, 'id' | 'status' | 'statusType'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      statusType: 'pending',
    };
    setAppointments([newAppt, ...appointments]);

    // Also trigger automatic notification alert!
    const newAlert: AlertItem = {
      id: Date.now(),
      type: 'Appointment Booked',
      title: `${appt.service} Scheduled`,
      message: `${appt.service} booked for ${appt.date} at ${appt.time}.`,
      time: 'Just now',
      icon: 'calendar',
      color: '#176B87',
      read: false,
    };
    setAlerts([newAlert, ...alerts]);
  };

  const addPermit = (permit: Omit<Permit, 'id' | 'status' | 'statusType' | 'date' | 'fee'>) => {
    const newPermit: Permit = {
      ...permit,
      id: `SP-${Math.floor(1000 + Math.random() * 9000)}`,
      fee: '₱500.00',
      status: 'Under Review',
      statusType: 'pending',
      date: 'Today',
    };
    setPermits([newPermit, ...permits]);

    const newAlert: AlertItem = {
      id: Date.now(),
      type: 'Permit Application',
      title: `${newPermit.id} Application Submitted`,
      message: `Sanitation permit for ${permit.businessName} submitted for review.`,
      time: 'Just now',
      icon: 'document-text',
      color: '#3498db',
      read: false,
    };
    setAlerts([newAlert, ...alerts]);
  };

  const addService = (service: Omit<WastewaterService, 'id' | 'status' | 'statusType' | 'cost'>) => {
    const newService: WastewaterService = {
      ...service,
      id: `W-${Math.floor(200 + Math.random() * 800)}`,
      cost: '₱1,200.00',
      status: 'Pending Assignment',
      statusType: 'pending',
    };
    setServices([newService, ...services]);

    const newAlert: AlertItem = {
      id: Date.now(),
      type: 'Service Requested',
      title: `${service.serviceType} Requested`,
      message: `Scheduled for ${service.scheduleDate} (${service.scheduleTime}).`,
      time: 'Just now',
      icon: 'water',
      color: '#9b59b6',
      read: false,
    };
    setAlerts([newAlert, ...alerts]);
  };

  const addReport = (report: Omit<HealthReport, 'id' | 'status' | 'statusType' | 'date'>) => {
    const newReport: HealthReport = {
      ...report,
      id: `CS-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Under Investigation',
      statusType: 'pending',
      date: 'Today',
    };
    setReports([newReport, ...reports]);

    const newAlert: AlertItem = {
      id: Date.now(),
      type: 'Health Report Filed',
      title: `Report ${newReport.id} Filed`,
      message: `Your health issue report has been received by health officers.`,
      time: 'Just now',
      icon: 'warning',
      color: '#e74c3c',
      read: false,
    };
    setAlerts([newAlert, ...alerts]);
  };

  const markAlertRead = (id: number) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const markAllAlertsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

  const toggleVaccineStatus = (id: string) => {
    setVaccines(
      vaccines.map((v) => {
        if (v.id === id) {
          const isCompleted = v.status === 'Completed';
          return {
            ...v,
            status: isCompleted ? 'Due' : 'Completed',
            color: isCompleted ? '#f39c12' : '#2ecc71',
            date: isCompleted ? 'Pending Schedule' : 'Today',
            certId: isCompleted ? undefined : `CERT-VAL-${Math.floor(1000 + Math.random() * 9000)}`,
          };
        }
        return v;
      })
    );
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: `FAM-${familyMembers.length + 1}`,
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile({ ...userProfile, ...profile });
  };

  return (
    <AppContext.Provider
      value={{
        appointments,
        permits,
        services,
        reports,
        vaccines,
        alerts,
        announcements,
        userProfile,
        familyMembers,
        themeMode,
        language,
        isOffline,
        offlineSyncQueueCount: offlineSyncQueue.length,
        toggleOfflineMode,
        syncOfflineQueueWithSupabase,
        setLanguage,
        t,
        addAppointment,
        addPermit,
        addService,
        addReport,
        markAlertRead,
        markAllAlertsRead,
        toggleVaccineStatus,
        addFamilyMember,
        updateUserProfile,
        setThemeMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
