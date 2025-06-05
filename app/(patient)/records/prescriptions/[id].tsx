import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, User, MapPin, Pill, RefreshCw, Navigation, Phone, Star, Clock, Map } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../../constants/theme';
import { Button } from '../../../../components/Button';
import { useMedicalStore } from '../../../../store/medicalStore';
import { usePharmacyStore, Pharmacy } from '../../../../store/pharmacyStore';
import { useNotificationStore } from '../../../../store/notificationStore';
import { PharmacyMapView } from '../../../../components/ui/PharmacyMapView';

export default function PrescriptionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { prescriptions } = useMedicalStore();
  const { findNearbyPharmacies } = usePharmacyStore();
  const { addNotification } = useNotificationStore();
  
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedPharmacyForMap, setSelectedPharmacyForMap] = useState<Pharmacy | null>(null);
  
  const prescription = prescriptions.find(p => p.id === id);
  
  useEffect(() => {
    // Mock user location (in a real app, you'd use expo-location)
    // For web compatibility, we'll use a default location
    const mockLocation = { latitude: 6.9271, longitude: 79.8612 }; // Colombo City
    setUserLocation(mockLocation);
    
    if (prescription) {
      // Get medicine IDs from prescription
      const medicineIds = prescription.medications.map((_, index) => (index + 1).toString());
      
      // Find nearby pharmacies
      const pharmacies = findNearbyPharmacies(
        mockLocation.latitude,
        mockLocation.longitude,
        medicineIds
      );
      setNearbyPharmacies(pharmacies);
    }
  }, [prescription, findNearbyPharmacies]);
  
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
  
  const handleRefillRequest = () => {
    Alert.alert(
      'Request Refill',
      'Would you like to request a refill for this prescription?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Request Refill',
          onPress: () => {
            Alert.alert(
              'Refill Requested',
              'Your refill request has been sent to the pharmacy. You will receive a notification when it is ready for pickup.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleSendToPharmacy = (pharmacy: Pharmacy) => {
    Alert.alert(
      'Send Prescription',
      `Send this prescription to ${pharmacy.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send',
          onPress: () => {
            setSelectedPharmacy(pharmacy.id);
            
            // Add notification
            addNotification({
              title: 'Prescription Sent',
              message: `Your prescription has been sent to ${pharmacy.name}. You will be notified when it is ready for pickup.`,
              type: 'prescription',
              priority: 'medium'
            });
            
            Alert.alert(
              'Prescription Sent',
              `Your prescription has been sent to ${pharmacy.name}. You will receive a notification when your medicines are ready for pickup.`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleCallPharmacy = (phone: string) => {
    if (Platform.OS !== 'web') {
      // On mobile, open phone dialer
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Error', 'Unable to make phone call');
      });
    } else {
      Alert.alert('Call Pharmacy', `Phone: ${phone}`);
    }
  };

  const handleGetDirections = (pharmacy: Pharmacy) => {
    if (Platform.OS !== 'web') {
      // On mobile, open native maps app
      const url = Platform.select({
        ios: `maps:0,0?q=${pharmacy.latitude},${pharmacy.longitude}`,
        android: `geo:0,0?q=${pharmacy.latitude},${pharmacy.longitude}`,
      });
      
      if (url) {
        Linking.openURL(url).catch(() => {
          // Fallback to Google Maps
          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
          Linking.openURL(googleMapsUrl);
        });
      }
    } else {
      // On web, open Google Maps
      const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleShowOnMap = (pharmacy: Pharmacy) => {
    setSelectedPharmacyForMap(pharmacy);
    setShowMapModal(true);
  };

  const renderPharmacyCard = (pharmacy: Pharmacy) => {
    const availableMedicines = pharmacy.medicines.filter(med => 
      prescription.medications.some(prescMed => 
        prescMed.name.toLowerCase().includes(med.medicineName.toLowerCase())
      ) && med.inStock
    );
    
    const totalPrice = availableMedicines.reduce((sum, med) => sum + med.price, 0);

    return (
      <View key={pharmacy.id} style={styles.pharmacyCard}>
        <View style={styles.pharmacyHeader}>
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
            <View style={styles.pharmacyMeta}>
              <View style={styles.ratingContainer}>
                <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.rating}>{pharmacy.rating}</Text>
              </View>
              <Text style={styles.distance}>{pharmacy.distance?.toFixed(1)} km away</Text>
            </View>
            <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
          </View>
        </View>

        <View style={styles.workingHours}>
          <Clock size={14} color={COLORS.textSecondary} />
          <Text style={styles.workingHoursText}>
            Open: {pharmacy.workingHours.open} - {pharmacy.workingHours.close}
          </Text>
        </View>

        <View style={styles.medicineAvailability}>
          <Text style={styles.availabilityTitle}>Available Medicines:</Text>
          {availableMedicines.map((med, index) => (
            <View key={index} style={styles.medicineItem}>
              <Text style={styles.medicineItemName}>{med.medicineName}</Text>
              <Text style={styles.medicinePrice}>${med.price.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalPrice}>
            <Text style={styles.totalPriceLabel}>Total:</Text>
            <Text style={styles.totalPriceValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.pharmacyActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCallPharmacy(pharmacy.phone)}
          >
            <Phone size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShowOnMap(pharmacy)}
          >
            <Map size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Map</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleGetDirections(pharmacy)}
          >
            <Navigation size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.sendButton]}
            onPress={() => handleSendToPharmacy(pharmacy)}
          >
            <Text style={styles.sendButtonText}>Send Prescription</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[
          styles.statusBadgeContainer,
          prescription.status === 'active' ? styles.activeBadge : 
          prescription.status === 'completed' ? styles.completedBadge : styles.cancelledBadge
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
              <Text style={styles.infoValue}>Dr. {prescription.doctorName}</Text>
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
        
        {/* Medications */}
        <View style={styles.medicationsCard}>
          <Text style={styles.medicationsTitle}>Medications</Text>
          
          {prescription.medications.map((medication, index) => (
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

        {/* Nearby Pharmacies */}
        {nearbyPharmacies.length > 0 && (
          <View style={styles.pharmaciesSection}>
            <Text style={styles.pharmaciesSectionTitle}>Nearby Pharmacies</Text>
            <Text style={styles.pharmaciesSectionSubtitle}>
              Find pharmacies with your prescribed medicines
            </Text>
            
            {nearbyPharmacies.map(renderPharmacyCard)}
          </View>
        )}
        
        {/* Action Buttons */}
        {prescription.status === 'active' && prescription.refillsRemaining > 0 && (
          <Button
            title="Request Refill"
            onPress={handleRefillRequest}
            style={styles.refillButton}
          />
        )}
        
        <Button
          title="Download Prescription"
          variant="outline"
          onPress={() => Alert.alert('Download', 'Prescription PDF downloaded successfully.')}
          style={styles.downloadButton}
        />
      </ScrollView>

      {/* Map Modal */}
      {selectedPharmacyForMap && (
        <PharmacyMapView
          pharmacy={selectedPharmacyForMap}
          userLocation={userLocation}
          visible={showMapModal}
          onClose={() => {
            setShowMapModal(false);
            setSelectedPharmacyForMap(null);
          }}
          onGetDirections={() => {
            setShowMapModal(false);
            handleGetDirections(selectedPharmacyForMap);
            setSelectedPharmacyForMap(null);
          }}
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
  pharmaciesSection: {
    marginBottom: 16,
  },
  pharmaciesSectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pharmaciesSectionSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  pharmacyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  pharmacyHeader: {
    marginBottom: 12,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pharmacyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  distance: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  pharmacyAddress: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  workingHours: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  workingHoursText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  medicineAvailability: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  availabilityTitle: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  medicineItemName: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  medicinePrice: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  totalPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalPriceLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalPriceValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  pharmacyActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
    minWidth: 70,
  },
  actionButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    flex: 1,
    justifyContent: 'center',
    minWidth: 140,
  },
  sendButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  refillButton: {
    marginBottom: 12,
  },
  downloadButton: {
    marginBottom: 24,
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
});