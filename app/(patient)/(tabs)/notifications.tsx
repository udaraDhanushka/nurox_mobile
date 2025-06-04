import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationStore, Notification } from '@/store/notificationStore';
import { formatDistanceToNow, parse, isValid } from 'date-fns';
import { Bell, Check, AlertCircle } from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';

const NotificationsScreen = () => {
    const router = useRouter();
    const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const getIconByType = (type: string) => {
            switch (type) {
                case 'appointment':
                    return <Bell size={24} color={COLORS.primary} />;
                case 'prescription':
                    return <AlertCircle size={24} color={COLORS.success} />;
                case 'lab':
                    return <AlertCircle size={24} color={COLORS.warning} />;
                case 'insurance':
                    return <AlertCircle size={24} color={COLORS.info} />;
                case 'medication':
                    return <AlertCircle size={24} color={COLORS.secondary} />;
                default:
                    return <Bell size={24} color={COLORS.primary} />;
            }
        };

        const handleNotificationPress = () => {
            markAsRead(item.id);
            if (item.type === 'appointment') {
                router.push('/appointments');
            } else if (item.type === 'prescription') {
                router.push('/records/prescriptions');
            } else if (item.type === 'lab') {
                router.push('/records/lab-reports');
            } else if (item.type === 'insurance') {
                router.push('/profile/insurance');
            }
        };

        // Safely parse date and time
        const dateTimeString = `${item.date} ${item.time}`;
        const parsedDate = parse(dateTimeString, 'yyyy-MM-dd HH:mm:ss', new Date());
        const displayTime = isValid(parsedDate)
            ? formatDistanceToNow(parsedDate, { addSuffix: true })
            : 'Invalid date';

        return (
            <TouchableOpacity
                style={[styles.notificationItem, item.read ? styles.read : styles.unread]}
                onPress={handleNotificationPress}
            >
                <View style={styles.iconContainer}>
                    {getIconByType(item.type)}
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.time}>{displayTime}</Text>
                </View>
                {!item.read && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Pressable style={styles.markAllButton} onPress={markAllAsRead}>
                    <Check size={18} color={COLORS.primary} />
                    <Text style={styles.markAllText}>Mark all as read</Text>
                </Pressable>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Bell size={60} color={COLORS.lightGray} />
                    <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={item => item.id}
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
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unread: {
        backgroundColor: COLORS.white,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    read: {
        backgroundColor: COLORS.veryLightGray,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    message: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    time: {
        fontSize: SIZES.xs,
        color: COLORS.textTertiary,
    },
    unreadIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginLeft: 8,
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

export default NotificationsScreen; 