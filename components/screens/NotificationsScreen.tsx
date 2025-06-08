import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Check } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';
import { useNotificationStore, Notification } from '@/store/notificationStore';
import { NotificationItem } from '@/components/ui/NotificationItem';

interface NotificationsScreenProps {
  safeAreaEdges?: Array<'top' | 'right' | 'bottom' | 'left'>;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ 
  safeAreaEdges = ['top'] 
}) => {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  
  const handleNotificationPress = (item: Notification) => {
    // Add comprehensive null check for item
    if (!item || typeof item !== 'object' || !item.id) return;
    
    markAsRead(item.id);
    // Navigate based on notification type
    if (item.type === 'appointment') {
      router.push('/(patient)/(tabs)/myAppointment');
    } else if (item.type === 'prescription') {
      router.push('/(patient)/records/prescriptions');
    } else if (item.type === 'lab') {
      router.push('/(patient)/records/lab-reports');
    } else if (item.type === 'insurance') {
      router.push('/(patient)/profile/insurance');
    }
  };

  // Filter out any null/undefined notifications and ensure they have required properties
  const validNotifications = notifications.filter(notification => 
    notification != null && 
    typeof notification === 'object' && 
    notification.id && 
    notification.title
  );

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable style={styles.markAllButton} onPress={markAllAsRead}>
          <Check size={18} color={COLORS.primary} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </Pressable>
      </View>
      
      {validNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={60} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={validNotifications}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              onPress={() => handleNotificationPress(item)} 
            />
          )}
          keyExtractor={item => item?.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  markAllText: {
    marginLeft: 4,
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: SIZES.md,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});