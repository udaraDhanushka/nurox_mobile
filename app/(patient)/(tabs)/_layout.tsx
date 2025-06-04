import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, FileText, Bell, Plus } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { FloatingChatButton } from '@/components/FloatingChatButton';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

function CustomTabBarButton({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity
            style={{
                top: -40,
                justifyContent: 'center',
                alignItems: 'center',
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: COLORS.primary,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
            onPress={onPress}
        >
            <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
    );
}

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function PatientTabLayout() {
    const router = useRouter();
    const { t } = useTranslation();
    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.gray,
                    tabBarStyle: {
                        borderTopWidth: 1,
                        borderTopColor: COLORS.border,
                        elevation: 0,
                        shadowOpacity: 0,
                        height: 80,
                        paddingBottom: 20,
                        paddingTop: 10,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '500',
                        marginBottom: 5,
                    },

                    headerShown: false,
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: COLORS.textPrimary,
                    },
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push('/(patient)/profile')}
                            style={{ marginRight: 20 }}
                        />
                    ),
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: t('home'),
                        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="myAppointments"
                    options={{
                        title: t('appointments'),
                        tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="newClaim"
                    options={{
                        title: t('newClaim'),
                        tabBarButton: () => (
                            <CustomTabBarButton
                                onPress={() => router.push('/(patient)/profile/insurance/claim')}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="mediRecords"
                    options={{
                        title: t('records'),
                        tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="notifications"
                    options={{
                        title: t('notifications'),
                        tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
                    }}
                />
            </Tabs>
            <FloatingChatButton />
        </View>
    );
}