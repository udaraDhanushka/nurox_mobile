import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'lab' | 'insurance' | 'general' | 'chat';
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  chatData?: {
    doctorId: string;
    doctorName: string;
  };
}

interface NotificationStore {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  getUnreadCount: () => number;
}

// Mock notifications with proper date format
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Appointment Reminder',
    message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 2:00 PM',
    type: 'appointment',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    priority: 'high',
  },
  {
    id: '2',
    title: 'New Message from Doctor',
    message: 'Dr. Smith: Please take your medication as prescribed and let me know if you have any side effects.',
    type: 'chat',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    read: false,
    priority: 'high',
    chatData: {
      doctorId: '1',
      doctorName: 'Dr. Smith'
    }
  },
  {
    id: '3',
    title: 'Prescription Ready',
    message: 'Your prescription for Lisinopril is ready for pickup at MedPlus Pharmacy',
    type: 'prescription',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: false,
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Document Shared',
    message: 'Dr. Johnson shared a lab report with you',
    type: 'chat',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    read: false,
    priority: 'medium',
    chatData: {
      doctorId: '2',
      doctorName: 'Dr. Johnson'
    }
  },
  {
    id: '5',
    title: 'Lab Results Available',
    message: 'Your blood test results from Central Diagnostics are now available',
    type: 'lab',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    priority: 'medium',
  },
  {
    id: '6',
    title: 'Insurance Claim Update',
    message: 'Your insurance claim #12345 has been processed and approved',
    type: 'insurance',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
    priority: 'low',
  },
  {
    id: '7',
    title: 'Health Tip',
    message: 'Remember to stay hydrated! Aim for 8 glasses of water daily.',
    type: 'general',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    read: true,
    priority: 'low',
  },
];

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: mockNotifications,
  
  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification && notification.id === id ? { ...notification, read: true } : notification
      ).filter(Boolean), // Filter out any null/undefined notifications
    }));
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => 
        notification ? { ...notification, read: true } : notification
      ).filter(Boolean), // Filter out any null/undefined notifications
    }));
  },
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications.filter(Boolean)], // Filter out nulls
    }));
  },
  
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification && notification.id !== id),
    }));
  },
  
  getUnreadCount: () => {
    return get().notifications.filter((notification) => notification && !notification.read).length;
  },
}));