import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Navigation, MapPin } from 'lucide-react-native';
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

  // Fallback if maps are not available
  // if (!MapView || !Marker || Platform.OS === 'web') {
  //   return (
  //     <View style={styles.fallbackContainer}>
  //       <MapPin size={48} color={COLORS.primary} />
  //       <Text style={styles.fallbackTitle}>{pharmacy.name}</Text>
  //       <Text style={styles.fallbackAddress}>{pharmacy.address}</Text>
  //       <Text style={styles.fallbackDistance}>
  //         {pharmacy.distance?.toFixed(1)} km away
  //       </Text>
        
  //       <TouchableOpacity 
  //         style={styles.directionsButton}
  //         onPress={onGetDirections}
  //       >
  //         <Navigation size={20} color={COLORS.white} />
  //         <Text style={styles.directionsButtonText}>Get Directions</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

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
      >
        {/* Pharmacy marker */}
        <Marker
          coordinate={{
            latitude: pharmacy.latitude,
            longitude: pharmacy.longitude,
          }}
          title={pharmacy.name}
          description={pharmacy.address}
          pinColor={COLORS.primary}
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor={COLORS.success}
          />
        )}
      </MapView>
      
      {/* Overlay info card */}
      <View style={styles.infoCard}>
        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
        <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
        <Text style={styles.pharmacyDistance}>
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
    marginBottom: 4,
  },
  pharmacyDistance: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 12,
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