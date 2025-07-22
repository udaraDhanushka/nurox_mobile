import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    Dimensions,
    Alert,
    Platform,
    Linking
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { 
    MapPin, 
    Navigation, 
    Phone, 
    Clock,
    Building,
    Star,
    DollarSign,
    Locate,
    AlertCircle
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

const { width, height } = Dimensions.get('window');

interface TestCenter {
    id: string;
    name: string;
    address: string;
    distance: number;
    rating: number;
    reviews: number;
    phone: string;
    isOpen: boolean;
    openHours: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    availableTests: Array<{
        name: string;
        price: number;
        duration: string;
        availableSlots: number;
    }>;
}

interface TestCenterMapProps {
    testName: string;
    onBookTest: (testCenter: TestCenter) => void;
}

// Mock data - same as in TestCentersList
const mockTestCenters: TestCenter[] = [
    {
        id: '1',
        name: 'Central Diagnostics',
        address: '123 Main Street, Colombo 03',
        distance: 1.2,
        rating: 4.8,
        reviews: 245,
        phone: '+94 11 234 5678',
        isOpen: true,
        openHours: '6:00 AM - 10:00 PM',
        coordinates: { latitude: 6.9271, longitude: 79.8612 },
        availableTests: [
            { name: 'Complete Blood Count (CBC)', price: 2500, duration: '15 min', availableSlots: 8 },
            { name: 'Lipid Panel', price: 3500, duration: '15 min', availableSlots: 5 },
            { name: 'Thyroid Function Test', price: 4500, duration: '10 min', availableSlots: 12 }
        ]
    },
    {
        id: '2',
        name: 'HealthLabs Lanka',
        address: '456 Galle Road, Colombo 04',
        distance: 2.8,
        rating: 4.6,
        reviews: 189,
        phone: '+94 11 345 6789',
        isOpen: true,
        openHours: '7:00 AM - 9:00 PM',
        coordinates: { latitude: 6.8935, longitude: 79.8573 },
        availableTests: [
            { name: 'Complete Blood Count (CBC)', price: 2200, duration: '20 min', availableSlots: 6 },
            { name: 'Vitamin D Level', price: 3800, duration: '10 min', availableSlots: 10 }
        ]
    },
    {
        id: '3',
        name: 'LifeLabs Medical Center',
        address: '789 Kandy Road, Colombo 07',
        distance: 4.1,
        rating: 4.9,
        reviews: 312,
        phone: '+94 11 456 7890',
        isOpen: false,
        openHours: '8:00 AM - 6:00 PM',
        coordinates: { latitude: 6.9147, longitude: 79.8757 },
        availableTests: [
            { name: 'Complete Blood Count (CBC)', price: 2800, duration: '15 min', availableSlots: 0 },
            { name: 'Lipid Panel', price: 3200, duration: '15 min', availableSlots: 3 },
            { name: 'Thyroid Function Test', price: 4200, duration: '12 min', availableSlots: 7 }
        ]
    },
    {
        id: '4',
        name: 'Metro Diagnostic Center',
        address: '321 Union Place, Colombo 02',
        distance: 1.8,
        rating: 4.4,
        reviews: 156,
        phone: '+94 11 567 8901',
        isOpen: true,
        openHours: '24 Hours',
        coordinates: { latitude: 6.9222, longitude: 79.8648 },
        availableTests: [
            { name: 'Complete Blood Count (CBC)', price: 2300, duration: '18 min', availableSlots: 15 },
            { name: 'Vitamin D Level', price: 4000, duration: '12 min', availableSlots: 8 }
        ]
    }
];

export default function TestCenterMap({ testName, onBookTest }: TestCenterMapProps) {
    const [testCenters, setTestCenters] = useState<TestCenter[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<TestCenter | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Initial map region centered on Colombo (fallback)
    const [region, setRegion] = useState<Region>({
        latitude: 6.9271,
        longitude: 79.8612,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    // Request location permissions using Expo Location
    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.warn('Error requesting location permission:', error);
            return false;
        }
    };

    // Get user's current location using Expo Location
    const getCurrentLocation = async () => {
        setLocationLoading(true);
        setLocationError(null);

        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                setLocationError('Location permission denied');
                setLocationLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 1,
            });

            const { latitude, longitude } = location.coords;
            const newLocation = { latitude, longitude };
            
            setUserLocation(newLocation);
            
            // Update map region to user's location
            setRegion({
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
            
            // Calculate distances to test centers
            updateTestCenterDistances(newLocation);
            setLocationLoading(false);

        } catch (error) {
            console.log('Location error:', error);
            setLocationError('Unable to get location');
            setLocationLoading(false);
            
            // Use default Colombo location as fallback
            const fallbackLocation = { latitude: 6.9271, longitude: 79.8612 };
            setUserLocation(fallbackLocation);
            updateTestCenterDistances(fallbackLocation);
        }
    };

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return Math.round(distance * 10) / 10; // Round to 1 decimal place
    };

    // Update test center distances based on user location
    const updateTestCenterDistances = (location: { latitude: number; longitude: number }) => {
        const updatedCenters = mockTestCenters.map(center => ({
            ...center,
            distance: calculateDistance(
                location.latitude,
                location.longitude,
                center.coordinates.latitude,
                center.coordinates.longitude
            )
        }));
        
        // Filter and sort by distance
        const filteredCenters = updatedCenters
            .filter(center =>
                center.availableTests.some(test => 
                    test.name.toLowerCase().includes(testName.toLowerCase())
                )
            )
            .sort((a, b) => a.distance - b.distance);
            
        setTestCenters(filteredCenters);
    };

    // Initialize location and test centers
    useEffect(() => {
        getCurrentLocation();
    }, []);

    // Update test centers when testName changes
    useEffect(() => {
        if (userLocation) {
            updateTestCenterDistances(userLocation);
        }
    }, [testName]);

    const getTestInfo = (center: TestCenter, testName: string) => {
        return center.availableTests.find(t => 
            t.name.toLowerCase().includes(testName.toLowerCase())
        );
    };

    const handleMarkerPress = (center: TestCenter) => {
        setSelectedCenter(center);
        // Center map on selected marker
        setRegion({
            ...region,
            latitude: center.coordinates.latitude,
            longitude: center.coordinates.longitude,
        });
    };

    // Open directions in native maps app
    const openDirections = (center: TestCenter) => {
        const { latitude, longitude } = center.coordinates;
        const url = Platform.select({
            ios: `maps:0,0?q=${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}`
        });
        
        if (url) {
            Linking.openURL(url).catch(err => {
                Alert.alert('Error', 'Unable to open maps application');
                console.error('Error opening maps:', err);
            });
        }
    };

    const handleDirections = (center: TestCenter) => {
        Alert.alert(
            'Open Directions',
            `Would you like to open directions to ${center.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Open Maps', 
                    onPress: () => openDirections(center)
                }
            ]
        );
    };

    const handleCall = (center: TestCenter) => {
        const phoneUrl = `tel:${center.phone}`;
        
        Alert.alert(
            'Call Center',
            `Would you like to call ${center.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Call', 
                    onPress: () => {
                        Linking.openURL(phoneUrl).catch(err => {
                            Alert.alert('Error', 'Unable to make phone call');
                            console.error('Error making call:', err);
                        });
                    }
                }
            ]
        );
    };

    // Refresh location
    const handleRefreshLocation = () => {
        getCurrentLocation();
    };

    // Google Maps component
    const renderGoogleMap = () => {
        return (
            <View style={styles.mapContainer}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={region}
                    showsUserLocation={true}
                    showsMyLocationButton={false} // We'll use custom button
                    showsCompass={true}
                    showsScale={true}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    rotateEnabled={true}
                    onRegionChangeComplete={setRegion}
                >
                    {/* Test Center Markers */}
                    {testCenters.map((center) => {
                        const isSelected = selectedCenter?.id === center.id;
                        
                        return (
                            <Marker
                                key={center.id}
                                coordinate={center.coordinates}
                                title={center.name}
                                description={`${center.address} • ${center.distance} km away`}
                                onPress={() => handleMarkerPress(center)}
                                pinColor={isSelected ? COLORS.primary : (center.isOpen ? COLORS.success : COLORS.error)}
                            >
                                {/* Custom marker callout */}
                                <View style={[
                                    styles.customMarker,
                                    { backgroundColor: isSelected ? COLORS.primary : (center.isOpen ? COLORS.success : COLORS.error) }
                                ]}>
                                    <Building 
                                        size={16} 
                                        color={COLORS.white} 
                                    />
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>

                {/* Map Controls Overlay */}
                <View style={styles.mapOverlay}>
                    <View style={styles.mapInfo}>
                        <Text style={styles.mapTitle}>Test Centers</Text>
                        <Text style={styles.mapSubtitle}>{testCenters.length} centers found</Text>
                    </View>
                    
                    {/* Custom Location Button */}
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={handleRefreshLocation}
                        disabled={locationLoading}
                    >
                        {locationLoading ? (
                            <View style={styles.locationLoading} />
                        ) : locationError ? (
                            <AlertCircle size={20} color={COLORS.error} />
                        ) : (
                            <Locate size={20} color={COLORS.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Location Status */}
                {locationError && (
                    <View style={styles.locationErrorBanner}>
                        <AlertCircle size={16} color={COLORS.error} />
                        <Text style={styles.locationErrorText}>{locationError}</Text>
                        <TouchableOpacity onPress={handleRefreshLocation}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const renderCenterDetails = () => {
        if (!selectedCenter) return null;
        
        const testInfo = getTestInfo(selectedCenter, testName);

        return (
            <View style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                    <View style={styles.centerInfo}>
                        <Text style={styles.centerName}>{selectedCenter.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                            <Text style={styles.rating}>{selectedCenter.rating}</Text>
                            <Text style={styles.reviews}>({selectedCenter.reviews})</Text>
                        </View>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        selectedCenter.isOpen ? styles.openBadge : styles.closedBadge
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: selectedCenter.isOpen ? COLORS.success : COLORS.error }
                        ]}>
                            {selectedCenter.isOpen ? 'Open' : 'Closed'}
                        </Text>
                    </View>
                </View>

                <View style={styles.addressContainer}>
                    <MapPin size={14} color={COLORS.textSecondary} />
                    <Text style={styles.address}>{selectedCenter.address}</Text>
                    <Text style={styles.distance}>{selectedCenter.distance} km</Text>
                </View>

                <View style={styles.hoursContainer}>
                    <Clock size={14} color={COLORS.textSecondary} />
                    <Text style={styles.hours}>{selectedCenter.openHours}</Text>
                </View>

                {testInfo && (
                    <View style={styles.testInfoContainer}>
                        <View style={styles.testDetails}>
                            <View style={styles.priceContainer}>
                                <DollarSign size={16} color={COLORS.primary} />
                                <Text style={styles.price}>LKR {testInfo.price.toLocaleString()}</Text>
                            </View>
                            <Text style={styles.duration}>{testInfo.duration}</Text>
                            <Text style={styles.slots}>
                                {testInfo.availableSlots} slots available
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCall(selectedCenter)}
                    >
                        <Phone size={16} color={COLORS.primary} />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={() => handleDirections(selectedCenter)}
                    >
                        <Navigation size={16} color={COLORS.secondary} />
                        <Text style={styles.directionsButtonText}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.bookButton,
                            (!selectedCenter.isOpen || !testInfo || testInfo.availableSlots === 0) && styles.bookButtonDisabled
                        ]}
                        onPress={() => onBookTest(selectedCenter)}
                        disabled={!selectedCenter.isOpen || !testInfo || testInfo.availableSlots === 0}
                    >
                        <Text style={[
                            styles.bookButtonText,
                            (!selectedCenter.isOpen || !testInfo || testInfo.availableSlots === 0) && styles.bookButtonTextDisabled
                        ]}>
                            {!selectedCenter.isOpen ? 'Closed' : 
                             !testInfo ? 'Not Available' :
                             testInfo.availableSlots === 0 ? 'Fully Booked' : 'Book Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderGoogleMap()}
            {renderCenterDetails()}
            
            {!selectedCenter && (
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsText}>
                        {locationLoading 
                            ? 'Getting your location...' 
                            : 'Tap on a test center marker to view details and book an appointment'
                        }
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    mapOverlay: {
        position: 'absolute',
        top: 32,
        left: 32,
        right: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mapInfo: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        ...SHADOWS.small,
    },
    mapTitle: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    mapSubtitle: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    locationButton: {
        backgroundColor: COLORS.white,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    locationLoading: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderTopColor: 'transparent',
        // Add rotation animation here if needed
    },
    locationErrorBanner: {
        position: 'absolute',
        top: 100,
        left: 32,
        right: 32,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.error,
        ...SHADOWS.small,
    },
    locationErrorText: {
        flex: 1,
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    retryText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
    customMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
        ...SHADOWS.small,
    },
    detailsCard: {
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 12,
        padding: 16,
        ...SHADOWS.small,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    centerInfo: {
        flex: 1,
    },
    centerName: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        marginLeft: 4,
        marginRight: 4,
    },
    reviews: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    openBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    closedBadge: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    statusText: {
        fontSize: SIZES.xs,
        fontWeight: '600',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    address: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginLeft: 6,
        flex: 1,
    },
    distance: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '500',
    },
    hoursContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    hours: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginLeft: 6,
    },
    testInfoContainer: {
        backgroundColor: COLORS.veryLightGray,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    testDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    price: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 4,
    },
    duration: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginRight: 16,
    },
    slots: {
        fontSize: SIZES.sm,
        color: COLORS.success,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.primary,
        flex: 1,
        marginRight: 6,
        justifyContent: 'center',
    },
    callButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        marginLeft: 4,
        fontWeight: '500',
    },
    directionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        flex: 1,
        marginHorizontal: 3,
        justifyContent: 'center',
    },
    directionsButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.secondary,
        marginLeft: 4,
        fontWeight: '500',
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        flex: 1,
        marginLeft: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookButtonDisabled: {
        backgroundColor: COLORS.lightGray,
    },
    bookButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.white,
        fontWeight: '600',
    },
    bookButtonTextDisabled: {
        color: COLORS.textSecondary,
    },
    instructionsCard: {
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    instructionsText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});