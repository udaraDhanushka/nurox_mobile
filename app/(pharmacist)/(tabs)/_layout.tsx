import React from 'react';
import { Tabs } from 'expo-router';
import { Home, FileText, Package, User, Bell } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { useTranslation } from '@/hooks/useTranslation';

export default function PharmacistTabLayout() {
    const { t } = useTranslation();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.gray,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerShown: false,
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
                name="prescriptions"
                options={{
                    title: t('prescriptions'),
                    tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    title: t('inventory'),
                    tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
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
    );
}