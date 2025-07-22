import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform, Linking, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Calendar, User, MapPin, Pill, RefreshCw, Navigation, Phone, Star,
  Clock, Map, X, Download, Share2, Send, Bell, Upload, Camera, CheckCircle
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useMedicalStore } from '@/store/medicalStore';
import PharmacyList from '@/components/PharmacyList';
import PharmacyMap from '@/components/ui/PharmacyMap';
import SendPrescriptionModal from '@/components/SendPrescriptionModal';
import ShareModal from '@/components/ShareModal';
import UploadPrescriptionModal from '@/components/ui/UploadPrescriptionModal';
import { Prescription, DetectedMedicine, UploadedPrescription, UploadResult } from '@/types/medical';   

export default function PrescriptionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { prescriptions, updatePrescription } = useMedicalStore();

  const [showPharmacies, setShowPharmacies] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [uploadedPrescriptions, setUploadedPrescriptions] = useState<UploadedPrescription[]>([]);
  const [detectedMedicines, setDetectedMedicines] = useState<DetectedMedicine[]>([]);

  const prescription = prescriptions.find(p => p.id === String(id));

  if (!prescription) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prescription Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Prescription not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.goBackButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleRequestRefill = () => {
    Alert.alert(
      'Request Refill',
      'Choose an option to request your refill:',
      [
        { text: 'Request from Current Pharmacy', onPress: () => console.log('Request from Current') },
        { text: 'Find New Pharmacy', onPress: () => setShowPharmacies(true) },
        { text: 'Upload Prescription Image', onPress: () => setShowUploadModal(true) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleUploadPrescription = () => {
    setShowUploadModal(true);
  };

  // Enhanced upload completion handler
  const handleUploadComplete = (result: UploadResult) => {
    // Add the uploaded prescription to the list with all required fields
    const uploadedPrescription: UploadedPrescription = {
      id: `upload_${Date.now()}`,
      type: result.type,
      timestamp: new Date().toISOString(),
      fileName: result.fileName,
      fileSize: 0, // This would be calculated from the actual file
      uri: result.uri,
      uploadStatus: 'completed',
      analysisResult: result.analysisResult
    };
    
    // Add source field to detected medicines
    const detectedMedicinesWithSource: DetectedMedicine[] = result.detectedMedicines.map(medicine => ({
      ...medicine,
      id: medicine.id || `medicine_${Date.now()}_${Math.random()}`,
      source: 'detected' as const,
      createdAt: new Date().toISOString()
    }));
    
    setUploadedPrescriptions(prev => [...prev, uploadedPrescription]);
    setDetectedMedicines(prev => [...prev, ...detectedMedicinesWithSource]);

    // Update the prescription in the store
    updatePrescription(prescription.id, {
      ...prescription,
      detectedMedicines: [...(prescription.detectedMedicines || []), ...detectedMedicinesWithSource],
      uploadedPrescriptions: [...(prescription.uploadedPrescriptions || []), uploadedPrescription],
      lastUpdated: new Date().toISOString()
    });

    Alert.alert(
      'Upload Successful! 🎉',
      `Successfully detected ${result.detectedMedicines.length} medicine(s) from your prescription.\n\nConfidence: ${Math.round(result.confidence * 100)}%\nProcessing time: ${result.processingTime}s`,
      [
        {
          text: 'View Medicines',
          onPress: () => {
            // Scroll to detected medicines section
          }
        },
        { text: 'OK' }
      ]
    );
  };

  // Legacy handlers for backward compatibility
  const handleTakePhoto = () => {
    // Simulate taking a photo and detecting medicines
    setTimeout(() => {
      const mockDetectedMedicines: DetectedMedicine[] = [
        { 
          id: `medicine_${Date.now()}_1`,
          name: 'Lisinopril', 
          dosage: '10mg', 
          frequency: 'Once daily', 
          detected: true, 
          confidence: 0.89,
          source: 'detected',
          createdAt: new Date().toISOString()
        },
        { 
          id: `medicine_${Date.now()}_2`,
          name: 'Metformin', 
          dosage: '500mg', 
          frequency: 'Twice daily', 
          detected: true, 
          confidence: 0.92,
          source: 'detected',
          createdAt: new Date().toISOString()
        },
        { 
          id: `medicine_${Date.now()}_3`,
          name: 'Aspirin', 
          dosage: '81mg', 
          frequency: 'Once daily', 
          detected: true, 
          confidence: 0.85,
          source: 'detected',
          createdAt: new Date().toISOString()
        }
      ];
      setDetectedMedicines(prev => [...prev, ...mockDetectedMedicines]);
      
      const uploadedPrescription: UploadedPrescription = {
        id: `upload_${Date.now()}`,
        type: 'photo',
        timestamp: new Date().toISOString(),
        fileName: `photo_${Date.now()}.jpg`,
        fileSize: 2048000,
        uri: `mock://photo_${Date.now()}`,
        uploadStatus: 'completed'
      };
      setUploadedPrescriptions(prev => [...prev, uploadedPrescription]);
      
      Alert.alert(
        'Prescription Uploaded',
        `Successfully detected ${mockDetectedMedicines.length} medicines from your prescription image.`,
        [{ text: 'OK' }]
      );
    }, 1000);
  };

  const handleChooseFromGallery = () => {
    // Simulate choosing from gallery and detecting medicines
    setTimeout(() => {
      const mockDetectedMedicines: DetectedMedicine[] = [
        { 
          id: `medicine_${Date.now()}_1`,
          name: 'Atorvastatin', 
          dosage: '20mg', 
          frequency: 'Once daily', 
          detected: true, 
          confidence: 0.87,
          source: 'detected',
          createdAt: new Date().toISOString()
        },
        { 
          id: `medicine_${Date.now()}_2`,
          name: 'Amlodipine', 
          dosage: '5mg', 
          frequency: 'Once daily', 
          detected: true, 
          confidence: 0.91,
          source: 'detected',
          createdAt: new Date().toISOString()
        }
      ];
      setDetectedMedicines(prev => [...prev, ...mockDetectedMedicines]);
      
      const uploadedPrescription: UploadedPrescription = {
        id: `upload_${Date.now()}`,
        type: 'gallery',
        timestamp: new Date().toISOString(),
        fileName: `gallery_${Date.now()}.jpg`,
        fileSize: 1536000,
        uri: `mock://gallery_${Date.now()}`,
        uploadStatus: 'completed'
      };
      setUploadedPrescriptions(prev => [...prev, uploadedPrescription]);
      
      Alert.alert(
        'Prescription Uploaded',
        `Successfully detected ${mockDetectedMedicines.length} medicines from your prescription image.`,
        [{ text: 'OK' }]
      );
    }, 1000);
  };

  const handleUploadPDF = () => {
    // Simulate PDF upload and detecting medicines
    setTimeout(() => {
      const mockDetectedMedicines: DetectedMedicine[] = [
        { 
          id: `medicine_${Date.now()}_1`,
          name: 'Omeprazole', 
          dosage: '20mg', 
          frequency: 'Once daily', 
          detected: true, 
          confidence: 0.93,
          source: 'detected',
          createdAt: new Date().toISOString()
        },
        { 
          id: `medicine_${Date.now()}_2`,
          name: 'Simvastatin', 
          dosage: '40mg', 
          frequency: 'Once daily at bedtime', 
          detected: true, 
          confidence: 0.88,
          source: 'detected',
          createdAt: new Date().toISOString()
        },
        { 
          id: `medicine_${Date.now()}_3`,
          name: 'Losartan', 
          dosage: '50mg', 
          frequency: 'Once daily', 
          detected: true, 
          confidence: 0.90,
          source: 'detected',
          createdAt: new Date().toISOString()
        }
      ];
      setDetectedMedicines(prev => [...prev, ...mockDetectedMedicines]);
      
      const uploadedPrescription: UploadedPrescription = {
        id: `upload_${Date.now()}`,
        type: 'pdf',
        timestamp: new Date().toISOString(),
        fileName: `prescription_${Date.now()}.pdf`,
        fileSize: 512000,
        uri: `mock://pdf_${Date.now()}`,
        uploadStatus: 'completed'
      };
      setUploadedPrescriptions(prev => [...prev, uploadedPrescription]);
      
      Alert.alert(
        'Prescription Uploaded',
        `Successfully detected ${mockDetectedMedicines.length} medicines from your prescription PDF.`,
        [{ text: 'OK' }]
      );
    }, 1000);
  };

  const handleFindPharmacies = () => {
    setShowPharmacies(true);
  };

  const handleSendToPrescription = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
    setShowSendModal(true);
  };

  const handleSendConfirm = (sendDetails: any) => {
    // Update the prescription with pharmacy information
    updatePrescription(prescription.id, {
      ...prescription,
      pharmacy: sendDetails.pharmacy.name,
      status: 'processing'
    });

    Alert.alert(
      'Prescription Sent',
      `Your prescription has been sent to ${sendDetails.pharmacy.name}. You will receive a notification when your medicines are ready for pickup.`,
      [{ text: 'OK', onPress: () => setShowSendModal(false) }]
    );
  };

  const handleNotifyWhenReady = () => {
    Alert.alert(
      'Notification Set',
      'You will be notified when your prescription is ready for pickup.',
      [{ text: 'OK' }]
    );
  };

  const handleSendToDoctor = () => {
    Alert.alert(
      'Send to Doctor',
      'Choose how to send the prescription to your doctor:',
      [
        { text: 'Send via App', onPress: () => console.log('Send via App') },
        { text: 'Email', onPress: () => console.log('Email') },
        { text: 'SMS', onPress: () => console.log('SMS') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // New handlers for enhanced functionality
  const handleDeleteUploadedPrescription = (index: number) => {
    Alert.alert(
      'Delete Upload',
      'Are you sure you want to remove this uploaded prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUploadedPrescriptions(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleRemoveDetectedMedicine = (medicineIndex: number) => {
    Alert.alert(
      'Remove Medicine',
      'Are you sure you want to remove this detected medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setDetectedMedicines(prev => prev.filter((_, i) => i !== medicineIndex));
          }
        }
      ]
    );
  };

  // Get medicine names for PharmacyMap component
  const originalMedicines = prescription.medications?.map(med => med.name) || [];
  const uploadedMedicines = detectedMedicines.map(med => med.name);
  const prescriptionMedicines = [...originalMedicines, ...uploadedMedicines];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => showPharmacies ? setShowPharmacies(false) : router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showPharmacies ? 'Nearby Pharmacies' : 'Prescription Details'}
        </Text>
        {showPharmacies && (
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
                Map
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!showPharmacies ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Badge */}
          <View style={[
            styles.statusBadgeContainer,
            prescription.status === 'active' ? styles.activeBadge :
              prescription.status === 'completed' ? styles.completedBadge :
                prescription.status === 'processing' ? styles.processingBadge : styles.cancelledBadge
          ]}>
            <Text style={styles.statusBadgeText}>{prescription.status}</Text>
          </View>

          {/* Prescription Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Calendar size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date Prescribed</Text>
                <Text style={styles.infoValue}>{prescription.date}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <User size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Prescribed By</Text>
                <Text style={styles.infoValue}>{prescription.doctorName}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MapPin size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Pharmacy</Text>
                <Text style={styles.infoValue}>{prescription.pharmacy || 'Not selected'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <RefreshCw size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Refills Remaining</Text>
                <Text style={styles.infoValue}>{prescription.refillsRemaining}</Text>
              </View>
            </View>
          </View>

          {/* NEW: Uploaded Prescriptions Section */}
          {uploadedPrescriptions.length > 0 && (
            <View style={styles.uploadedPrescriptionsCard}>
              <View style={styles.uploadedHeader}>
                <Upload size={20} color={COLORS.primary} />
                <Text style={styles.uploadedTitle}>Uploaded Prescriptions</Text>
              </View>
              
              {uploadedPrescriptions.map((upload, index) => (
                <View key={index} style={styles.uploadedItem}>
                  <View style={styles.uploadedItemContent}>
                    <View style={styles.uploadedItemInfo}>
                      <Text style={styles.uploadedFileName}>{upload.fileName}</Text>
                      <Text style={styles.uploadedTimestamp}>
                        Uploaded {new Date(upload.timestamp).toLocaleDateString()}
                      </Text>
                      <View style={styles.uploadedMeta}>
                        <Text style={styles.uploadedType}>{upload.type.toUpperCase()}</Text>
                        <Text style={styles.uploadedSize}>
                          {(upload.fileSize / 1024).toFixed(1)} KB
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteUploadButton}
                      onPress={() => handleDeleteUploadedPrescription(index)}
                    >
                      <X size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Medications or Actions */}
          {prescription.status === 'completed' ? (
            <View style={styles.medicationsCard}>
              <Text style={styles.medicationsTitle}>Medications</Text>

              {prescription.medications?.map((medication, index) => (
                <View key={index} style={styles.medicationItem}>
                  <View style={styles.medicationHeader}>
                    <View style={styles.medicationTitleContainer}>
                      <Pill size={20} color={COLORS.primary} />
                      <Text style={styles.medicationName}>{medication.name}</Text>
                    </View>
                    <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                  </View>

                  <View style={styles.medicationDetails}>
                    <Text style={styles.medicationDetail}>
                      <Text style={styles.detailLabel}>Frequency: </Text>
                      {medication.frequency}
                    </Text>
                    <Text style={styles.medicationDetail}>
                      <Text style={styles.detailLabel}>Duration: </Text>
                      {medication.duration}
                    </Text>
                    {medication.instructions && (
                      <Text style={styles.medicationDetail}>
                        <Text style={styles.detailLabel}>Instructions: </Text>
                        {medication.instructions}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.pendingActionsCard}>
              <Text style={styles.pendingTitle}>Prescription Actions</Text>
              <Text style={styles.pendingDescription}>
                Your prescription is currently {prescription.status}. You can request a refill, upload a prescription image, or find nearby pharmacies to fill your prescription.
              </Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleUploadPrescription}
              >
                <Upload size={20} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Upload Prescription</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleFindPharmacies}
              >
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Find Pharmacies</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ENHANCED: Detected Medicines from Uploads */}
          {detectedMedicines.length > 0 && (
            <View style={styles.detectedMedicinesCard}>
              <View style={styles.detectedMedicinesHeader}>
                <CheckCircle size={20} color={COLORS.success} />
                <Text style={styles.detectedMedicinesTitle}>Detected Medicines</Text>
              </View>
              <Text style={styles.detectedMedicinesSubtitle}>
                Found {detectedMedicines.length} medicine(s) from your uploaded prescriptions
              </Text>

              {detectedMedicines.map((medicine: DetectedMedicine, index: number) => (
                <View key={index} style={styles.detectedMedicineItem}>
                  <View style={styles.detectedMedicineHeader}>
                    <View style={styles.detectedMedicineTitleContainer}>
                      <Pill size={18} color={COLORS.success} />
                      <Text style={styles.detectedMedicineName}>{medicine.name}</Text>
                    </View>
                    <View style={styles.detectedMedicineActions}>
                      {medicine.confidence && (
                        <View style={styles.detectedBadge}>
                          <Text style={styles.detectedBadgeText}>
                            {Math.round(medicine.confidence * 100)}%
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.removeMedicineButton}
                        onPress={() => handleRemoveDetectedMedicine(index)}
                      >
                        <X size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.detectedMedicineDetails}>
                    <Text style={styles.detectedMedicineDetail}>
                      <Text style={styles.detectedDetailLabel}>Dosage: </Text>
                      {medicine.dosage}
                    </Text>
                    <Text style={styles.detectedMedicineDetail}>
                      <Text style={styles.detectedDetailLabel}>Frequency: </Text>
                      {medicine.frequency}
                    </Text>
                    {medicine.notes && (
                      <Text style={styles.detectedMedicineDetail}>
                        <Text style={styles.detectedDetailLabel}>Notes: </Text>
                        {medicine.notes}
                      </Text>
                    )}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.findPharmaciesForDetectedButton}
                onPress={() => setShowPharmacies(true)}
              >
                <MapPin size={18} color={COLORS.white} />
                <Text style={styles.findPharmaciesForDetectedButtonText}>
                  Find Pharmacies for These Medicines
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Download PDF - Show for completed prescriptions */}
            {prescription.status === 'completed' && (
              <TouchableOpacity
                style={styles.downloadButtonContainer}
                onPress={() => Alert.alert('Download', 'Prescription PDF downloaded successfully.')}
              >
                <Download size={18} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Download PDF</Text>
              </TouchableOpacity>
            )}

            {/* Share Prescription - Show for all statuses except cancelled */}
            {prescription.status !== 'cancelled' && (
              <TouchableOpacity
                style={styles.shareButtonContainer}
                onPress={() => setShowShareModal(true)}
              >
                <Share2 size={18} color={COLORS.primary} style={styles.buttonIcon} />
                <Text style={styles.shareButtonText}>Share Prescription</Text>
              </TouchableOpacity>
            )}

            {/* Request Refill - Show for completed prescriptions with refills remaining */}
            {prescription.status === 'completed' && prescription.refillsRemaining > 0 && (
              <TouchableOpacity
                style={styles.refillButtonContainer}
                onPress={handleRequestRefill}
              >
                <RefreshCw size={18} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Request Refill</Text>
              </TouchableOpacity>
            )}

            {(prescription.status === 'active' || prescription.status === 'processing') && (
              <TouchableOpacity
                style={styles.notifyButtonContainer}
                onPress={handleNotifyWhenReady}
              >
                <Bell size={18} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Notify When Ready</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        viewMode === 'list' ? (
          <PharmacyList
            prescriptionMedicines={prescriptionMedicines}
            onSendPrescription={handleSendToPrescription}
          />
        ) : (
          <PharmacyMap
            prescriptionMedicines={prescriptionMedicines}
            onSendPrescription={handleSendToPrescription}
          />
        )
      )}

      {/* NEW: Upload Prescription Modal */}
      <UploadPrescriptionModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
        prescriptionId={prescription.id}
      />

      {/* Send Prescription Modal */}
      <SendPrescriptionModal
        visible={showSendModal}
        pharmacy={selectedPharmacy}
        prescriptionMedicines={prescriptionMedicines}
        onConfirm={handleSendConfirm}
        onCancel={() => setShowSendModal(false)}
      />

      {/* Share Modal */}
      <ShareModal
        visible={showShareModal}
        type="prescription"
        data={prescription}
        onClose={() => setShowShareModal(false)}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  viewToggle: {
    left: 60,
    flexDirection: 'row',
    backgroundColor: COLORS.veryLightGray,
    borderRadius: 20,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusBadgeContainer: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  completedBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  processingBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  statusBadgeText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  // NEW: Uploaded Prescriptions Styles
  uploadedPrescriptionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  uploadedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadedTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  uploadedItem: {
    marginBottom: 12,
  },
  uploadedItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.veryLightGray,
    padding: 12,
    borderRadius: 8,
  },
  uploadedItemInfo: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  uploadedTimestamp: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  uploadedMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadedType: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  uploadedSize: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  deleteUploadButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    borderRadius: 16,
  },
  medicationsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  medicationsTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  medicationItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  medicationDosage: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  medicationDetails: {
    marginLeft: 28,
  },
  medicationDetail: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pendingActionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  pendingTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  pendingDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.veryLightGray,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 12,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  downloadButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  shareButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  redirectButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 12,
  },
  notifyButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  refillButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  shareButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  redirectButtonText: {
    color: COLORS.secondary,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  goBackButton: {
    width: 200,
  },
  detectedMedicinesCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  detectedMedicinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detectedMedicinesTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  detectedMedicinesSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginLeft: 28,
  },
  detectedMedicineItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  detectedMedicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detectedMedicineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detectedMedicineName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  // ENHANCED: Detected Medicine Actions
  detectedMedicineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detectedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detectedBadgeText: {
    fontSize: SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  removeMedicineButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    borderRadius: 12,
  },
  detectedMedicineDetails: {
    marginLeft: 26,
  },
  detectedMedicineDetail: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detectedDetailLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  findPharmaciesForDetectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  findPharmaciesForDetectedButtonText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
});