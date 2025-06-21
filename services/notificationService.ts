import { api } from './api';
import { Notification } from '../types/medical';

interface NotificationQuery {
  type?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

class NotificationService {
  // Get user notifications
  async getNotifications(query: NotificationQuery = {}): Promise<{
    notifications: Notification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryString = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, value.toString());
      }
    });

    const endpoint = queryString.toString() 
      ? `/notifications?${queryString.toString()}`
      : '/notifications';

    const response = await api.get<{
      notifications: Notification[];
      unreadCount: number;
      pagination: any;
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get notifications');
    }

    return response.data;
  }

  // Create notification (for healthcare providers)
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    scheduledFor?: string;
  }): Promise<Notification> {
    const response = await api.post<Notification>('/notifications', data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create notification');
    }

    return response.data;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const response = await api.put(`/notifications/${notificationId}/read`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const response = await api.put('/notifications/read-all');

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark all notifications as read');
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const response = await api.delete(`/notifications/${notificationId}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete notification');
    }
  }

  // Delete all read notifications
  async deleteAllRead(): Promise<void> {
    const response = await api.delete('/notifications/read/all');

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete read notifications');
    }
  }

  // Get notification preferences
  async getPreferences(): Promise<{
    appointmentReminders: boolean;
    prescriptionReady: boolean;
    labResults: boolean;
    paymentDue: boolean;
    insuranceUpdates: boolean;
    systemAlerts: boolean;
    chatMessages: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  }> {
    const response = await api.get<any>('/notifications/preferences');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get notification preferences');
    }

    return response.data;
  }

  // Update notification preferences
  async updatePreferences(preferences: any): Promise<void> {
    const response = await api.put('/notifications/preferences', preferences);

    if (!response.success) {
      throw new Error(response.message || 'Failed to update notification preferences');
    }
  }

  // Send bulk notification (admin only)
  async sendBulkNotification(data: {
    userIds: string[];
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<{ count: number }> {
    const response = await api.post<{ count: number }>('/notifications/bulk', data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to send bulk notification');
    }

    return response.data;
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const response = await this.getNotifications({ isRead: false, limit: 1 });
    return response.unreadCount;
  }

  // Get recent notifications
  async getRecentNotifications(limit: number = 5): Promise<Notification[]> {
    const response = await this.getNotifications({ limit });
    return response.notifications;
  }

  // Get notifications by type
  async getNotificationsByType(type: string, limit: number = 10): Promise<Notification[]> {
    const response = await this.getNotifications({ type, limit });
    return response.notifications;
  }
}

export const notificationService = new NotificationService();
export default notificationService;