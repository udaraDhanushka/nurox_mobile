import { useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../store/authStore';
import { useMedicalStore } from '../store/medicalStore';

export const useSocket = () => {
  const { user } = useAuthStore();
  const { addNotification } = useMedicalStore();
  const isConnected = useRef(false);

  useEffect(() => {
    if (user?.id && !isConnected.current) {
      // Connect socket
      socketService.connect(user.id);
      isConnected.current = true;

      // Set up notification listener
      socketService.onNewNotification((notification) => {
        console.log('New notification received:', notification);
        addNotification({
          id: notification.id || `notification_${Date.now()}`,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: notification.createdAt || new Date().toISOString(),
          read: false,
          priority: 'medium',
          category: getCategoryFromType(notification.type),
          ...notification.data
        });
      });

      // Set up message listener
      socketService.onNewMessage((message) => {
        console.log('New message received:', message);
        // You can handle new messages here, perhaps by updating a chat store
        // or showing a notification
        addNotification({
          id: `message_${Date.now()}`,
          type: 'chat_message',
          title: 'New Message',
          message: `New message from ${message.senderName}`,
          timestamp: message.createdAt || new Date().toISOString(),
          read: false,
          priority: 'medium',
          category: 'general',
          relatedId: message.id
        });
      });

      // Set up prescription update listener
      socketService.onPrescriptionUpdate((data) => {
        console.log('Prescription update received:', data);
        addNotification({
          id: `prescription_${Date.now()}`,
          type: 'prescription_ready',
          title: 'Prescription Updated',
          message: data.message || 'Your prescription has been updated',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          category: 'prescription',
          relatedId: data.prescriptionId
        });
      });
    }

    return () => {
      if (isConnected.current) {
        socketService.removeAllListeners();
        socketService.disconnect();
        isConnected.current = false;
      }
    };
  }, [user?.id, addNotification]);

  // Cleanup on logout
  useEffect(() => {
    if (!user && isConnected.current) {
      socketService.removeAllListeners();
      socketService.disconnect();
      isConnected.current = false;
    }
  }, [user]);

  return {
    isConnected: socketService.isConnected(),
    sendMessage: socketService.sendMessage.bind(socketService),
    sendNotification: socketService.sendNotification.bind(socketService),
    sendPrescriptionUpdate: socketService.sendPrescriptionUpdate.bind(socketService),
  };
};

// Helper function to determine category from notification type
function getCategoryFromType(type: string): 'prescription' | 'lab' | 'appointment' | 'general' {
  if (type.includes('prescription') || type.includes('medicine')) {
    return 'prescription';
  }
  if (type.includes('lab') || type.includes('result')) {
    return 'lab';
  }
  if (type.includes('appointment')) {
    return 'appointment';
  }
  return 'general';
}