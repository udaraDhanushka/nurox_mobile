import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Upload, Download, Eye, Share, Trash2, Plus, Calendar, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';

interface MedicalDocument {
  id: string;
  name: string;
  type: 'lab_report' | 'prescription' | 'imaging' | 'insurance' | 'referral' | 'other';
  size: string;
  uploadDate: string;
  provider?: string;
  description?: string;
}

export default function MedicalDocumentsScreen() {
  const { t } = useTranslation();
  const [documents] = useState<MedicalDocument[]>([
    {
      id: '1',
      name: 'Blood Test Results - January 2024',
      type: 'lab_report',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      provider: 'City Medical Lab',
      description: 'Complete blood count and metabolic panel'
    },
    {
      id: '2',
      name: 'Chest X-Ray Report',
      type: 'imaging',
      size: '5.1 MB',
      uploadDate: '2024-01-10',
      provider: 'Downtown Radiology',
      description: 'Routine chest X-ray examination'
    },
    {
      id: '3',
      name: 'Insurance Card - Front & Back',
      type: 'insurance',
      size: '1.2 MB',
      uploadDate: '2024-01-05',
      description: 'Current health insurance card'
    },
    {
      id: '4',
      name: 'Prescription - Lisinopril',
      type: 'prescription',
      size: '0.8 MB',
      uploadDate: '2024-01-03',
      provider: 'Dr. Sarah Johnson',
      description: 'Blood pressure medication prescription'
    },
    {
      id: '5',
      name: 'Cardiology Referral',
      type: 'referral',
      size: '1.5 MB',
      uploadDate: '2023-12-20',
      provider: 'Dr. Michael Chen',
      description: 'Referral to cardiology specialist'
    }
  ]);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'lab_report':
        return { icon: <FileText size={20} color={COLORS.info} />, color: COLORS.info };
      case 'prescription':
        return { icon: <FileText size={20} color={COLORS.primary} />, color: COLORS.primary };
      case 'imaging':
        return { icon: <FileText size={20} color={COLORS.warning} />, color: COLORS.warning };
      case 'insurance':
        return { icon: <FileText size={20} color={COLORS.success} />, color: COLORS.success };
      case 'referral':
        return { icon: <FileText size={20} color={COLORS.secondary} />, color: COLORS.secondary };
      default:
        return { icon: <FileText size={20} color={COLORS.textSecondary} />, color: COLORS.textSecondary };
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'lab_report':
        return t('labReport');
      case 'prescription':
        return t('prescriptions');
      case 'imaging':
        return t('imaging');
      case 'insurance':
        return t('insurance');
      case 'referral':
        return t('referral');
      default:
        return t('document');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDocumentAction = (action: string, document: MedicalDocument) => {
    switch (action) {
      case 'view':
        Alert.alert(t('view') + ' ' + t('document'), `Opening ${document.name}`);
        break;
      case 'download':
        Alert.alert(t('download'), `Downloading ${document.name}`);
        break;
      case 'share':
        Alert.alert(t('share') + ' ' + t('document'), `Sharing ${document.name}`);
        break;
      case 'delete':
        Alert.alert(
          t('delete') + ' ' + t('document'),
          `Are you sure you want to delete ${document.name}?`,
          [
            { text: t('cancel'), style: 'cancel' },
            { text: t('delete'), style: 'destructive', onPress: () => {} }
          ]
        );
        break;
    }
  };

  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, MedicalDocument[]>);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t('medicalRecords'),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }} 
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {t('storeManageDocuments')}
          </Text>
          <Button
            title={t('uploadDocument')}
            onPress={() => Alert.alert(t('uploadDocument'), 'Document upload feature coming soon')}
            style={styles.uploadButton}
            icon={<Upload size={20} color={COLORS.white} />}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {documents.length === 0 ? (
            <EmptyState
              icon={<FileText size={48} color={COLORS.textSecondary} />}
              message={t('noDocuments')}
              description={t('uploadMedicalDocuments')}
            />
          ) : (
            <View style={styles.documentsContainer}>
              {Object.entries(documentsByType).map(([type, docs]) => (
                <View key={type} style={styles.typeSection}>
                  <Text style={styles.typeSectionTitle}>
                    {getDocumentTypeName(type)} ({docs.length})
                  </Text>
                  
                  <View style={styles.documentsList}>
                    {docs.map((document) => {
                      const { icon, color } = getDocumentIcon(document.type);
                      
                      return (
                        <TouchableOpacity
                          key={document.id}
                          style={styles.documentCard}
                          onPress={() => handleDocumentAction('view', document)}
                        >
                          <View style={styles.documentHeader}>
                            <View style={[styles.documentIcon, { backgroundColor: `${color}15` }]}>
                              {icon}
                            </View>
                            <View style={styles.documentInfo}>
                              <Text style={styles.documentName} numberOfLines={2}>
                                {document.name}
                              </Text>
                              <Text style={styles.documentSize}>{document.size}</Text>
                            </View>
                          </View>

                          {document.description && (
                            <Text style={styles.documentDescription} numberOfLines={2}>
                              {document.description}
                            </Text>
                          )}

                          <View style={styles.documentMeta}>
                            <View style={styles.metaRow}>
                              <Calendar size={14} color={COLORS.textSecondary} />
                              <Text style={styles.metaText}>
                                {t('uploaded')} {formatDate(document.uploadDate)}
                              </Text>
                            </View>
                            {document.provider && (
                              <View style={styles.metaRow}>
                                <User size={14} color={COLORS.textSecondary} />
                                <Text style={styles.metaText}>{document.provider}</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.documentActions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleDocumentAction('view', document)}
                            >
                              <Eye size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleDocumentAction('download', document)}
                            >
                              <Download size={16} color={COLORS.success} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleDocumentAction('share', document)}
                            >
                              <Share size={16} color={COLORS.info} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleDocumentAction('delete', document)}
                            >
                              <Trash2 size={16} color={COLORS.error} />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  documentsContainer: {
    gap: 24,
  },
  typeSection: {
    marginBottom: 8,
  },
  typeSectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.medium,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  documentSize: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  documentDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  documentMeta: {
    gap: 6,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});