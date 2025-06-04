import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Package, AlertTriangle, FileText, Clock, CheckCircle, Filter } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// Mock notification data for pharmacists
const mockNotifications = [
  {
    id: '1',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Metformin 500mg is running low (8 units remaining)',
    timestamp: '2023-11-15T10:30:00Z',
    isRead: false,
    priority: 'high',
    actionRequired: true
  },
  {
    id: '2',
    type: 'prescription',
    title: 'New Prescription',
    message: 'Urgent prescription received for Emily Johnson - Amoxicillin 500mg',
    timestamp: '2023-11-15T09:15:00Z',
    isRead: false,
    priority: 'urgent',
    actionRequired: true
  },
  {
    id: '3',
    type: 'expiry',
    title: 'Expiry Warning',
    message: 'Amoxicillin 500mg (Batch: AM2024004) expires in 30 days',
    timestamp: '2023-11-15T08:00:00Z',
    isRead: true,
    priority: 'medium',
    actionRequired: false
  },
  {
    id: '4',
    type: 'prescription_ready',
    title: 'Prescription Ready',
    message: 'Prescription for John Doe is ready for pickup',
    timestamp: '2023-11-14T16:45:00Z',
    isRead: true,
    priority: 'normal',
    actionRequired: false
  },
  {
    id: '5',
    type: 'system',
    title: 'System Update',
    message: 'Pharmacy management system will be updated tonight at 2 AM',
    timestamp: '2023-11-14T14:20:00Z',
    isRead: true,
    priority: 'low',
    actionRequired: false
  },
  {
    id: '6',
    type: 'reorder',
    title: 'Reorder Confirmation',
    message: 'Order #12345 for Lisinopril 10mg has been confirmed',
    timestamp: '2023-11-14T11:30:00Z',
    isRead: true,
    priority: 'normal',
    actionRequired: false
  }
];

export default function PharmacistNotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Package size={24} color={COLORS.warning} />;
      case 'prescription':
        return <FileText size={24} color={COLORS.primary} />;
      case 'expiry':
        return <AlertTriangle size={24} color={COLORS.warning} />;
      case 'prescription_ready':
        return <CheckCircle size={24} color={COLORS.success} />;
      case 'reorder':
        return <Package size={24} color={COLORS.success} />;
      case 'system':
        return <Bell size={24} color={COLORS.textSecondary} />;
      default:
        return <Bell size={24} color={COLORS.textSecondary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return COLORS.error;
      case 'high':
        return COLORS.warning;
      case 'medium':
        return COLORS.primary;
      case 'normal':
        return COLORS.success;
      case 'low':
        return COLORS.textSecondary;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'urgent') return notification.priority === 'urgent' || notification.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {['all', 'unread', 'urgent'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterTab,
              filter === filterType && styles.activeFilterTab
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterTabText,
              filter === filterType && styles.activeFilterTabText
            ]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {filteredNotifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.isRead && styles.unreadNotification
            ]}
            onPress={() => {
              markAsRead(notification.id);
              // Handle navigation based on notification type
              if (notification.type === 'low_stock') {
                router.push('/(pharmacist)/inventory');
              } else if (notification.type === 'prescription') {
                router.push('/(pharmacist)/prescriptions');
              }
            }}
          >
            <View style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={[
                  styles.notificationTitle,
                  !notification.isRead && styles.unreadTitle
                ]}>
                  {notification.title}
                </Text>
                <View style={styles.notificationMeta}>
                  <View style={[
                    styles.priorityDot,
                    { backgroundColor: getPriorityColor(notification.priority) }
                  ]} />
                  <Text style={styles.timestamp}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
              </View>

              <Text style={[
                styles.notificationMessage,
                !notification.isRead && styles.unreadMessage
              ]}>
                {notification.message}
              </Text>

              {notification.actionRequired && (
                <View style={styles.actionRequired}>
                  <Clock size={14} color={COLORS.warning} />
                  <Text style={styles.actionRequiredText}>Action Required</Text>
                </View>
              )}
            </View>

            {!notification.isRead && (
              <View style={styles.unreadIndicator} />
            )}
          </TouchableOpacity>
        ))}

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Bell size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDescription}>
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "No notifications to show"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  unreadCount: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  markAllText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: COLORS.white,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.transparentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  notificationMessage: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  unreadMessage: {
    color: COLORS.textPrimary,
  },
  actionRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionRequiredText: {
    fontSize: SIZES.xs,
    color: COLORS.warning,
    fontWeight: '500',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});