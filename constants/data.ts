// constants/data.ts

export interface Vaccine {
  id: string;
  name: string;
  status: 'Completed' | 'Due' | 'Pending';
  date?: string; // when completed or due date
  patientName: string; // "Me" or child's name
  childAge?: string;
}

export interface Appointment {
  id: string;
  center: string;
  service: string;
  date: string;
  time: string;
  doctor: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  reminderSent: boolean;
}

export interface Permit {
  id: string;
  businessName: string;
  businessType: string;
  status: 'Under Review' | 'Approved' | 'Rejected' | 'Expired';
  submittedDate: string;
  fee: number;
  trackingNumber: string;
}

export interface ServiceRequest {
  id: string;
  type: 'Wastewater' | 'Sanitation' | 'Other';
  address: string;
  status: 'Pending Assignment' | 'Assigned' | 'Completed';
  scheduledDate?: string;
  technician?: string;
  estimatedCost: number;
  requestNumber: string;
}

export interface HealthAlert {
  id: string;
  title: string;
  message: string;
  type: 'Health Alert' | 'Appointment Reminder' | 'Permit Update' | 'Service Update' | 'Vaccine Reminder';
  time: string; // relative time
  read: boolean;
  icon: string;
  color: string;
}

export interface User {
  name: string;
  email: string;
  bloodType: string;
  allergies: string;
  lastCheckup: string;
  familyMembers: { name: string; relation: string; age: number }[];
}

// Mock User
export const mockUser: User = {
  name: 'Pedro García',
  email: 'pedro.garcia@email.com',
  bloodType: 'O+',
  allergies: 'None',
  lastCheckup: 'June 15, 2026',
  familyMembers: [
    { name: 'Sofia García', relation: 'Daughter', age: 2 },
    { name: 'Maria García', relation: 'Wife', age: 30 },
  ],
};

// Mock Vaccines
export const mockVaccines: Vaccine[] = [
  { id: 'v1', name: 'COVID-19 Booster', status: 'Completed', date: 'Nov 2025', patientName: 'Me' },
  { id: 'v2', name: 'Influenza', status: 'Completed', date: 'Sep 2025', patientName: 'Me' },
  { id: 'v3', name: 'Tetanus', status: 'Completed', date: 'Jun 2024', patientName: 'Me' },
  { id: 'v4', name: 'Hepatitis B', status: 'Due', date: 'Pending', patientName: 'Me' },
  { id: 'v5', name: 'BCG', status: 'Completed', date: '2025', patientName: 'Sofia García (2 yrs)', childAge: '2 yrs' },
  { id: 'v6', name: 'DPT 1st Dose', status: 'Completed', date: '2025', patientName: 'Sofia García (2 yrs)', childAge: '2 yrs' },
  { id: 'v7', name: 'MMR Booster', status: 'Due', date: 'July 28, 2026', patientName: 'Sofia García (2 yrs)', childAge: '2 yrs' },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    center: 'Health Center 1',
    service: 'General Checkup',
    date: 'July 28, 2026',
    time: '9:00 AM',
    doctor: 'Dr. Santos',
    status: 'Confirmed',
    reminderSent: true,
  },
  {
    id: 'apt2',
    center: 'Health Center 2',
    service: 'Vaccination',
    date: 'Aug 5, 2026',
    time: '2:00 PM',
    doctor: 'Dr. Reyes',
    status: 'Pending',
    reminderSent: false,
  },
];

// Mock Permits
export const mockPermits: Permit[] = [
  {
    id: 'p1',
    businessName: 'Pedro’s Eatery',
    businessType: 'Food Stall',
    status: 'Under Review',
    submittedDate: 'July 15, 2026',
    fee: 500,
    trackingNumber: 'SP-1042',
  },
  {
    id: 'p2',
    businessName: 'Pedro’s Eatery',
    businessType: 'Food Stall',
    status: 'Expired',
    submittedDate: 'Jan 10, 2025',
    fee: 500,
    trackingNumber: 'SP-1038',
  },
];

// Mock Service Requests
export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'sr1',
    type: 'Wastewater',
    address: '123 Main St, Barangay 7',
    status: 'Pending Assignment',
    estimatedCost: 1200,
    requestNumber: 'W-201',
  },
  {
    id: 'sr2',
    type: 'Wastewater',
    address: '123 Main St, Barangay 7',
    status: 'Completed',
    scheduledDate: 'July 12, 2026',
    technician: 'Juan Dela Cruz',
    estimatedCost: 1200,
    requestNumber: 'WW-203',
  },
];

// Mock Health Alerts / Notifications
export const mockAlerts: HealthAlert[] = [
  {
    id: 'a1',
    title: 'Dengue in your area',
    message: 'Several cases have been reported in Barangay 7. Take precautions.',
    type: 'Health Alert',
    time: '2 hours ago',
    read: false,
    icon: 'alert-circle',
    color: '#e74c3c',
  },
  {
    id: 'a2',
    title: 'Tomorrow 9:00 AM',
    message: 'You have a scheduled appointment at Health Center 1.',
    type: 'Appointment Reminder',
    time: '5 hours ago',
    read: false,
    icon: 'time',
    color: '#f39c12',
  },
  {
    id: 'a3',
    title: 'SP-1042: Under Review',
    message: 'Your sanitation permit application is now under review.',
    type: 'Permit Update',
    time: '1 day ago',
    read: false,
    icon: 'document-text',
    color: '#3498db',
  },
  {
    id: 'a4',
    title: 'Wastewater Service Done',
    message: 'Your septic tank was cleaned on July 12, 2026.',
    type: 'Service Update',
    time: '2 days ago',
    read: true,
    icon: 'water',
    color: '#2ecc71',
  },
  {
    id: 'a5',
    title: 'MMR Booster Due',
    message: "Sofia's MMR booster is due on July 28, 2026.",
    type: 'Vaccine Reminder',
    time: '3 days ago',
    read: true,
    icon: 'medkit',
    color: '#9b59b6',
  },
];

// For quick stats on home dashboard
export const getStats = () => ({
  appointments: mockAppointments.length,
  permits: mockPermits.length,
  services: mockServiceRequests.length,
  pending: mockAppointments.filter(a => a.status === 'Pending').length +
           mockPermits.filter(p => p.status === 'Under Review').length +
           mockServiceRequests.filter(s => s.status === 'Pending Assignment').length,
});