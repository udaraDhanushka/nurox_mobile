import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, FileText, LogOut, Lock, Camera, Sun, Moon, Award, Briefcase, Globe } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';

export default function DoctorProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Hide header for this screen
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const menuItems = [
    {
      title: t('personalInformation'),
      icon: <User size={24} color={isDarkMode ? COLORS.white : COLORS.primary} />,
      onPress: () => router.push('/(doctor)/profile/personal'),
    },
    {
      title: t('language'),
      icon: <Globe size={24} color={isDarkMode ? COLORS.white : COLORS.primary} />,
      onPress: () => setShowLanguageModal(true),
    },
    {
      title: t('medicalLicense'),
      icon: <Shield size={24} color={isDarkMode ? COLORS.white : COLORS.primary} />,
      onPress: () => router.push('/(doctor)/profile/license'),
    },
    {
      title: t('specializations'),
      icon: <Award size={24} color={isDarkMode ? COLORS.white : COLORS.primary} />,
      onPress: () => router.push('/(doctor)/profile/specializations'),
    },
    {
      title: t('hospitalAffiliations'),
      icon: <Briefcase size={24} color={isDarkMode ? COLORS.white : COLORS.primary} />,
      onPress: () => router.push('/(doctor)/profile/affiliations'),
    },
    {
      title: t('professionalSettings'),
      icon: <Shield size={24} color={isDarkMode ? COLORS.white : COLORS.primary} />,
      onPress: () => router.push('/(doctor)/profile/settings'),
    },
    {
      title: t('privacyPolicy'),
      icon: <Lock size={24} color={isDarkMode ? COLORS.white : COLORS.primary} />,
      onPress: () => router.push('/(doctor)/profile/privacy'),
    },
    {
      title: t('helpSupport'),
      icon: <FileText size={24} color={isDarkMode ? COLORS.white : COLORS.primary} />,
      onPress: () => router.push('/(doctor)/profile/support'),
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to auth
      router.replace('/(auth)/login');
    }
  };

  const handleImageUpload = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        updateUser({ 
          profileImage: result.assets[0].uri 
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      console.error('Image upload error:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handleImageUpload}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, isDarkMode && styles.avatarPlaceholderDark]}>
                  <User size={40} color={isDarkMode ? COLORS.white : COLORS.primary} />
                </View>
              )}
              <View style={styles.cameraButton}>
                <Camera size={16} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, isDarkMode && styles.textDark]}>Dr. {user?.firstName} {user?.lastName}</Text>
          <Text style={[styles.email, isDarkMode && styles.textSecondaryDark]}>{user?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Doctor</Text>
          </View>
        </View>

        {/* Dark/Light Toggle */}
        <TouchableOpacity
          style={[styles.darkModeToggle, isDarkMode && styles.darkModeToggleDark]}
          onPress={toggleDarkMode}
        >
          <View style={styles.darkModeIcon}>
            {isDarkMode ? (
              <Moon size={24} color={COLORS.white} />
            ) : (
              <Sun size={24} color={COLORS.primary} />
            )}
          </View>
          <Text style={[styles.darkModeText, isDarkMode && styles.textDark]}>
            {isDarkMode ? t('darkMode') : t('lightMode')}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={[styles.menuContainer, isDarkMode && styles.menuContainerDark]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                isDarkMode && styles.menuItemDark,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, isDarkMode && styles.menuIconDark]}>
                {item.icon}
              </View>
              <Text style={[styles.menuTitle, isDarkMode && styles.textDark]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <Text style={[styles.version, isDarkMode && styles.textSecondaryDark]}>
          {t('version')} {Constants.expoConfig?.version || '1.0.0'}
        </Text>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isDarkMode && styles.logoutButtonDark]}
          onPress={handleLogout}
        >
          <LogOut size={24} color={COLORS.error} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        {/* Language Selector Modal */}
        <LanguageSelector 
          isDarkMode={isDarkMode}
          isVisible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  avatarPlaceholderDark: {
    backgroundColor: '#2a2a2a',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  name: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: COLORS.transparentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontWeight: '500',
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  darkModeToggleDark: {
    backgroundColor: '#2a2a2a',
  },
  darkModeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.transparentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  darkModeText: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.medium,
    marginBottom: 16,
  },
  menuContainerDark: {
    backgroundColor: '#2a2a2a',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemDark: {
    borderBottomColor: '#3a3a3a',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.transparentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconDark: {
    backgroundColor: '#3a3a3a',
  },
  menuTitle: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.medium,
  },
  logoutButtonDark: {
    backgroundColor: '#2a2a2a',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: SIZES.md,
    color: COLORS.error,
    fontWeight: '500',
  },
  textDark: {
    color: COLORS.white,
  },
  textSecondaryDark: {
    color: '#999999',
  },
});