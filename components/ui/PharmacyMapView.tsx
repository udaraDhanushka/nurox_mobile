import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import { X, Navigation, MapPin } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Pharmacy } from '../../store/pharmacyStore';

interface PharmacyMapViewProps {
  pharmacy: Pharmacy;
  userLocation: { latitude: number; longitude: number } | null;
  visible: boolean;
  onClose: () => void;
  onGetDirections: () => void;
}

// FIXED: Updated interface to match the actual usage
interface NativeMapViewProps {
  pharmacy: Pharmacy;
  userLocation: { latitude: number; longitude: number } | null;
  onGetDirections: () => void;
}

// Fallback component for web or when maps are not available
const MapFallback: React.FC<{
  pharmacy: Pharmacy;
  onGetDirections: () => void;
}> = ({ pharmacy, onGetDirections }) => (
  <View style={styles.fallbackContainer}>
    <MapPin size={48} color={COLORS.primary} />
    <Text style={styles.fallbackTitle}>{pharmacy.name}</Text>
    <Text style={styles.fallbackAddress}>{pharmacy.address}</Text>
    <Text style={styles.fallbackDistance}>
      {pharmacy.distance?.toFixed(1)} km away
    </Text>
    
    <TouchableOpacity 
      style={styles.directionsButton}
      onPress={onGetDirections}
    >
      <Navigation size={20} color={COLORS.white} />
      <Text style={styles.directionsButtonText}>Get Directions</Text>
    </TouchableOpacity>
  </View>
);

// FIXED: Native Map Component with proper error handling
const NativeMapView = React.lazy(() => {
  if (Platform.OS === 'web') {
    // Return a fallback component for web
    return Promise.resolve({
      default: ({ pharmacy, onGetDirections }: NativeMapViewProps) => (
        <MapFallback pharmacy={pharmacy} onGetDirections={onGetDirections} />
      )
    });
  }
  
  return import('./NativeMapView').catch(() => ({
    default: ({ pharmacy, onGetDirections }: NativeMapViewProps) => (
      <MapFallback pharmacy={pharmacy} onGetDirections={onGetDirections} />
    )
  }));
});

export const PharmacyMapView: React.FC<PharmacyMapViewProps> = ({
  pharmacy,
  userLocation,
  visible,
  onClose,
  onGetDirections
}) => {
  // Native map view with Google Maps integration (mobile only)
  const renderMapView = () => {
    if (Platform.OS === 'web') {
      return (
        <MapFallback
          pharmacy={pharmacy}
          onGetDirections={onGetDirections}
        />
      );
    }

    return (
      <React.Suspense fallback={
        <MapFallback
          pharmacy={pharmacy}
          onGetDirections={onGetDirections}
        />
      }>
        <NativeMapView
          pharmacy={pharmacy}
          userLocation={userLocation}
          onGetDirections={onGetDirections}
        />
      </React.Suspense>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pharmacy Location</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Map or fallback content */}
        {renderMapView()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  directionsButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fallbackTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackAddress: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackDistance: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 32,
  },
});