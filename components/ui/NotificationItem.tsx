import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, FileText, Activity, Shield, MessageCircle, Bell } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Notification } from '../../store/notificationStore';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const router = useRouter();

  // Add comprehensive null checks for notification
  if (!notification || typeof notification !== 'object' || !notification.id) {
    return null;
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'appointment':
        return <Calendar size={20} color={COLORS.primary} />;
      case 'prescription':
        return <FileText size={20} color={COLORS.secondary} />;
      case 'lab':
        return <Activity size={20} color={COLORS.success} />;
      case 'insurance':
        return <Shield size={20} color={COLORS.warning} />;
      case 'chat':
        return <MessageCircle size={20} color={COLORS.primary} />;
      default:
        return <Bell size={20} color={COLORS.textSecondary} />;
    }
  };

  const getPriorityColor = () => {
    if (!notification.priority) return COLORS.success;
    
    switch (notification.priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      default:
        return COLORS.success;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return 'Now';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Now';
      
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch (error) {
      return 'Now';
    }
  };

  const handlePress = () => {
    // Handle chat notifications specially
    if (notification.type === 'chat' && notification.chatData) {
      router.push(`/(patient)/chat?doctorId=${notification.chatData.doctorId}&doctorName=${notification.chatData.doctorName}`);
    } else {
      onPress(notification);
    }
  };

  // Add null check for read property with default value
  const isRead = notification.read === true;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isRead && styles.unreadContainer
      ]}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            !isRead && styles.unreadTitle
          ]}>
            {notification.title || 'Notification'}
          </Text>
          <View style={styles.rightSection}>
            <View style={[
              styles.priorityIndicator,
              { backgroundColor: getPriorityColor() }
            ]} />
            <Text style={styles.timestamp}>
              {formatTimestamp(notification.timestamp)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.message} numberOfLines={2}>
          {notification.message || 'No message'}
        </Text>
      </View>
      
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...SHADOWS.small,
  },
  unreadContainer: {
    backgroundColor: COLORS.transparentPrimary,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timestamp: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  message: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 4,
  },
});