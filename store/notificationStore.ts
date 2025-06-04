import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType = 'appointment' | 'prescription' | 'lab' | 'insurance' | 'medication';

export interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    time: string;
    type: NotificationType;
    read: boolean;
    timestamp: number | string;
}

interface NotificationState {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [
                {
                    id: '1',
                    title: 'Appointment Reminder',
                    message: 'Your appointment with Dr. Sarah Johnson is tomorrow at 10:00 AM',
                    date: '2023-11-14',
                    time: '08:00 AM',
                    type: 'appointment',
                    read: false,
                    timestamp: Date.now()
                },
                {
                    id: '2',
                    title: 'Prescription Ready',
                    message: 'Your prescription for Lisinopril is ready for pickup at MediCare Pharmacy',
                    date: '2023-11-12',
                    time: '02:30 PM',
                    type: 'prescription',
                    read: true,
                    timestamp: Date.now()
                },
                {
                    id: '3',
                    title: 'Lab Results Available',
                    message: 'Your recent blood test results are now available. Please check your lab reports.',
                    date: '2023-11-10',
                    time: '11:15 AM',
                    type: 'lab',
                    read: false,
                    timestamp: Date.now()
                },
                {
                    id: '4',
                    title: 'Insurance Claim Update',
                    message: 'Your insurance claim CLM-2023-11-001 has been approved',
                    date: '2023-11-09',
                    time: '09:45 AM',
                    type: 'insurance',
                    read: false,
                    timestamp: Date.now()
                },
                {
                    id: '5',
                    title: 'Medication Reminder',
                    message: "Don't forget to take your Atorvastatin medication tonight",
                    date: '2023-11-13',
                    time: '08:00 PM',
                    type: 'medication',
                    read: true,
                    timestamp: Date.now()
                }
            ],
            addNotification: (notification) => set((state) => ({
                notifications: [notification, ...state.notifications]
            })),
            markAsRead: (id) => set((state) => ({
                notifications: state.notifications.map((notification) =>
                    notification.id === id ? { ...notification, read: true } : notification
                )
            })),
            markAllAsRead: () => set((state) => ({
                notifications: state.notifications.map((notification) => ({ ...notification, read: true }))
            })),
            deleteNotification: (id) => set((state) => ({
                notifications: state.notifications.filter((notification) => notification.id !== id)
            })),
            clearAllNotifications: () => set({ notifications: [] })
        }),
        {
            name: 'notification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);