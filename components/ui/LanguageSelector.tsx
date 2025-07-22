import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Globe, Check } from 'lucide-react-native';
import { Language, useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

interface LanguageSelectorProps {
  isDarkMode?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  isDarkMode = false,
  isVisible = false,
  onClose
}) => {
  const { language, setLanguage } = useLanguageStore();
  const { updateLanguage } = useAuthStore();
  const { t } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    updateLanguage(langCode);
    if (onClose) onClose();
  };

  return (
      <Modal
        animationType="slide"
        transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>
              {t('selectLanguage')}
            </Text>
            
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    isDarkMode && styles.languageOptionDark,
                    item.code === language && styles.selectedOption,
                    item.code === language && isDarkMode && styles.selectedOptionDark
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <View style={styles.languageOptionContent}>
                    <Text style={[styles.languageName, isDarkMode && styles.textDark]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.nativeName, isDarkMode && styles.textSecondaryDark]}>
                      {item.nativeName}
                    </Text>
                  </View>
                  {item.code === language && (
                    <Check size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.languageList}
            />
            
            <TouchableOpacity
              style={[styles.cancelButton, isDarkMode && styles.cancelButtonDark]}
            onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  languageSelectorDark: {
    backgroundColor: '#2a2a2a',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.transparentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDark: {
    backgroundColor: '#3a3a3a',
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  selectedLanguage: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalContentDark: {
    backgroundColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  languageList: {
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  languageOptionDark: {
    borderBottomColor: '#3a3a3a',
  },
  selectedOption: {
    backgroundColor: COLORS.transparentPrimary,
  },
  selectedOptionDark: {
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
  },
  languageOptionContent: {
    flex: 1,
  },
  languageName: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  nativeName: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  textDark: {
    color: COLORS.white,
  },
  textSecondaryDark: {
    color: '#999999',
  },
});