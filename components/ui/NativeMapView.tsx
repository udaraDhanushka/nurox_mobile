import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { Navigation, MapPin, Loader } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Pharmacy } from '../../store/pharmacyStore';

// Only import react-native-maps on native platforms
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (error) {
    console.log('react-native-maps not available');
  }
}

interface NativeMapViewProps {
  pharmacy: Pharmacy;
  userLocation: { latitude: number; longitude: number } | null;
  onGetDirections: () => void;
}

const NativeMapView: React.FC<NativeMapViewProps> = ({ pharmacy, userLocation, onGetDirections }) => {
  const [mapReady, setMapReady] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Haversine formula to calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Calculate distance whenever user location changes
  useEffect(() => {
    if (userLocation && pharmacy.latitude && pharmacy.longitude) {
      setIsCalculatingDistance(true);
      
      // Add small delay to simulate calculation (remove in production)
      const timer = setTimeout(() => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          pharmacy.latitude,
          pharmacy.longitude
        );
        setCalculatedDistance(distance);
        setIsCalculatingDistance(false);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setCalculatedDistance(null);
      setIsCalculatingDistance(false);
    }
  }, [userLocation, pharmacy.latitude, pharmacy.longitude]);

  // Calculate region for the map
  const getMapRegion = () => {
    if (!userLocation) {
      return {
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const midLat = (userLocation.latitude + pharmacy.latitude) / 2;
    const midLng = (userLocation.longitude + pharmacy.longitude) / 2;
    
    const latDelta = Math.abs(userLocation.latitude - pharmacy.latitude) * 1.5;
    const lngDelta = Math.abs(userLocation.longitude - pharmacy.longitude) * 1.5;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  // Enhanced directions with distance check
  const handleGetDirections = () => {
    if (!userLocation) {
      Alert.alert(
        'Location Required',
        'Please enable location services to get directions.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (calculatedDistance && calculatedDistance > 100) {
      Alert.alert(
        'Long Distance',
        `This pharmacy is ${calculatedDistance.toFixed(1)} km away. Are you sure you want directions?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Get Directions', onPress: onGetDirections }
        ]
      );
    } else {
      onGetDirections();
    }
  };

  // Get display distance (prefer calculated, fallback to pharmacy.distance)
  const getDisplayDistance = (): string => {
    if (isCalculatingDistance) {
      return 'Calculating...';
    }
    
    if (calculatedDistance !== null) {
      return `${calculatedDistance.toFixed(1)} km away`;
    }
    
    if (pharmacy.distance) {
      return `${pharmacy.distance.toFixed(1)} km away`;
    }
    
    return 'Distance unknown';
  };

  // Fallback if maps are not available
  if (!MapView || !Marker || Platform.OS === 'web') {
    return (
      <View style={styles.fallbackContainer}>
        <MapPin size={48} color={COLORS.primary} />
        <Text style={styles.fallbackTitle}>{pharmacy.name}</Text>
        <Text style={styles.fallbackAddress}>{pharmacy.address}</Text>
        <Text style={styles.fallbackDistance}>
          {getDisplayDistance()}
        </Text>
        
        {!userLocation && (
          <Text style={styles.locationWarning}>
            📍 Enable location for accurate distance
          </Text>
        )}
        
        <TouchableOpacity 
          style={[
            styles.directionsButton,
            !userLocation && styles.directionsButtonDisabled
          ]}
          onPress={handleGetDirections}
          disabled={!userLocation}
        >
          <Navigation size={20} color={COLORS.white} />
          <Text style={styles.directionsButtonText}>
            {userLocation ? 'Get Directions' : 'Location Required'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={getMapRegion()}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        provider="google"
        mapType="standard"
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
        onError={(error: unknown) => {
          if (error instanceof Error) {
            console.log('Map error:', error.message);
          } else {
            console.log('Unknown map error:', error);
          }
        
          Alert.alert('Map Error', 'Failed to load map. Please try again.');
        }}
        
      >
        {/* Pharmacy marker */}
        <Marker
          coordinate={{
            latitude: pharmacy.latitude,
            longitude: pharmacy.longitude,
          }}
          title={pharmacy.name}
          description={`${pharmacy.address}\n${getDisplayDistance()}`}
          pinColor={COLORS.primary}
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            pinColor={COLORS.success}
          />
        )}
      </MapView>
      
      {/* Loading overlay for map */}
      {!mapReady && (
        <View style={styles.loadingOverlay}>
          <Loader size={32} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
      
      {/* Overlay info card */}
      <View style={styles.infoCard}>
        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
        <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
        
        <View style={styles.distanceContainer}>
          {isCalculatingDistance && (
            <Loader size={16} color={COLORS.primary} />
          )}
          <Text style={[
            styles.pharmacyDistance,
            isCalculatingDistance && styles.calculatingDistance
          ]}>
            {getDisplayDistance()}
          </Text>
        </View>
        
        {!userLocation && (
          <Text style={styles.locationHint}>
            📍 Enable location for real-time distance
          </Text>
        )}
        
        <TouchableOpacity 
          style={[
            styles.directionsButton,
            !userLocation && styles.directionsButtonDisabled
          ]}
          onPress={handleGetDirections}
          disabled={!userLocation}
        >
          <Navigation size={20} color={COLORS.white} />
          <Text style={styles.directionsButtonText}>
            {userLocation ? 'Get Directions' : 'Location Required'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NativeMapView;

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.medium,
  },
  pharmacyName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pharmacyDistance: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  calculatingDistance: {
    opacity: 0.7,
  },
  locationHint: {
    fontSize: SIZES.xs,
    color: COLORS.warning,
    marginBottom: 12,
    fontStyle: 'italic',
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
  directionsButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
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
    backgroundColor: COLORS.background,
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
    marginBottom: 16,
  },
  locationWarning: {
    fontSize: SIZES.sm,
    color: COLORS.warning,
    marginBottom: 32,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});