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
    AlertCircle,
    Pill,
    ShoppingCart
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export interface Medicine {
    id: string;
    medicineName: string;
    price: number;
    inStock: boolean;
    quantity?: number;
}

export interface Pharmacy {
    id: string;
    name: string;
    address: string;
    distance: number;
    rating: number;
    reviews: number;
    phone: string;
    isOpen: boolean;
    workingHours: {
        open: string;
        close: string;
    };
    coordinates: {
        latitude: number;
        longitude: number;
    };
    medicines: Medicine[];
}

interface PharmacyMapProps {
    prescriptionMedicines: string[]; // Array of medicine names from prescription
    onBookPharmacy?: (pharmacy: Pharmacy) => void;
    onSendPrescription?: (pharmacy: Pharmacy) => void;
}

// Mock data - in real app, this would come from an API
const mockPharmacies: Pharmacy[] = [
    {
        id: '1',
        name: 'MedPlus Pharmacy',
        address: '123 Main Street, Colombo 03',
        distance: 1.2,
        rating: 4.8,
        reviews: 245,
        phone: '+94 11 234 5678',
        isOpen: true,
        workingHours: { open: '08:00', close: '22:00' },
        coordinates: { latitude: 6.9271, longitude: 79.8612 },
        medicines: [
            { id: '1', medicineName: 'Lisinopril', price: 450, inStock: true, quantity: 30 },
            { id: '2', medicineName: 'Metformin', price: 320, inStock: true, quantity: 50 },
            { id: '3', medicineName: 'Atorvastatin', price: 680, inStock: false, quantity: 0 }
        ]
    },
    {
        id: '2',
        name: 'HealthRx Pharmacy',
        address: '456 Galle Road, Colombo 04',
        distance: 2.8,
        rating: 4.6,
        reviews: 189,
        phone: '+94 11 345 6789',
        isOpen: true,
        workingHours: { open: '07:00', close: '21:00' },
        coordinates: { latitude: 6.8935, longitude: 79.8573 },
        medicines: [
            { id: '1', medicineName: 'Lisinopril', price: 420, inStock: true, quantity: 25 },
            { id: '4', medicineName: 'Tretinoin Cream', price: 1250, inStock: true, quantity: 15 },
            { id: '5', medicineName: 'Clindamycin', price: 890, inStock: true, quantity: 40 }
        ]
    },
    {
        id: '3',
        name: 'CityMed Pharmacy',
        address: '789 Kandy Road, Colombo 07',
        distance: 4.1,
        rating: 4.9,
        reviews: 312,
        phone: '+94 11 456 7890',
        isOpen: false,
        workingHours: { open: '09:00', close: '20:00' },
        coordinates: { latitude: 6.9147, longitude: 79.8757 },
        medicines: [
            { id: '1', medicineName: 'Lisinopril', price: 480, inStock: true, quantity: 20 },
            { id: '2', medicineName: 'Metformin', price: 350, inStock: true, quantity: 30 },
            { id: '6', medicineName: 'Sumatriptan', price: 1850, inStock: true, quantity: 12 }
        ]
    },
    {
        id: '4',
        name: 'Guardian Pharmacy',
        address: '321 Union Place, Colombo 02',
        distance: 1.8,
        rating: 4.4,
        reviews: 156,
        phone: '+94 11 567 8901',
        isOpen: true,
        workingHours: { open: '24 Hours', close: '24 Hours' },
        coordinates: { latitude: 6.9222, longitude: 79.8648 },
        medicines: [
            { id: '1', medicineName: 'Lisinopril', price: 460, inStock: true, quantity: 45 },
            { id: '4', medicineName: 'Tretinoin Cream', price: 1180, inStock: true, quantity: 20 },
            { id: '5', medicineName: 'Clindamycin', price: 920, inStock: true, quantity: 35 }
        ]
    }
];

export default function PharmacyMap({ prescriptionMedicines, onBookPharmacy, onSendPrescription }: PharmacyMapProps) {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
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
            
            // Calculate distances to pharmacies
            updatePharmacyDistances(newLocation);
            setLocationLoading(false);

        } catch (error) {
            console.log('Location error:', error);
            setLocationError('Unable to get location');
            setLocationLoading(false);
            
            // Use default Colombo location as fallback
            const fallbackLocation = { latitude: 6.9271, longitude: 79.8612 };
            setUserLocation(fallbackLocation);
            updatePharmacyDistances(fallbackLocation);
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

    // Update pharmacy distances based on user location
    const updatePharmacyDistances = (location: { latitude: number; longitude: number }) => {
        const updatedPharmacies = mockPharmacies.map(pharmacy => ({
            ...pharmacy,
            distance: calculateDistance(
                location.latitude,
                location.longitude,
                pharmacy.coordinates.latitude,
                pharmacy.coordinates.longitude
            )
        }));
        
        // Filter pharmacies that have at least one prescription medicine
        const filteredPharmacies = updatedPharmacies
            .filter(pharmacy =>
                pharmacy.medicines.some(medicine => 
                    prescriptionMedicines.some(prescMed =>
                        medicine.medicineName.toLowerCase().includes(prescMed.toLowerCase()) && 
                        medicine.inStock
                    )
                )
            )
            .sort((a, b) => a.distance - b.distance);
            
        setPharmacies(filteredPharmacies);
    };

    // Initialize location and pharmacies
    useEffect(() => {
        getCurrentLocation();
    }, []);

    // Update pharmacies when prescription medicines change
    useEffect(() => {
        if (userLocation) {
            updatePharmacyDistances(userLocation);
        }
    }, [prescriptionMedicines]);

    const getAvailableMedicines = (pharmacy: Pharmacy) => {
        return pharmacy.medicines.filter(medicine =>
            prescriptionMedicines.some(prescMed =>
                medicine.medicineName.toLowerCase().includes(prescMed.toLowerCase()) && 
                medicine.inStock
            )
        );
    };

    const getTotalPrice = (pharmacy: Pharmacy) => {
        const availableMedicines = getAvailableMedicines(pharmacy);
        return availableMedicines.reduce((sum, medicine) => sum + medicine.price, 0);
    };

    const handleMarkerPress = (pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        // Center map on selected marker
        setRegion({
            ...region,
            latitude: pharmacy.coordinates.latitude,
            longitude: pharmacy.coordinates.longitude,
        });
    };

    // Open directions in native maps app
    const openDirections = (pharmacy: Pharmacy) => {
        const { latitude, longitude } = pharmacy.coordinates;
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

    const handleDirections = (pharmacy: Pharmacy) => {
        Alert.alert(
            'Open Directions',
            `Would you like to open directions to ${pharmacy.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Open Maps', 
                    onPress: () => openDirections(pharmacy)
                }
            ]
        );
    };

    const handleCall = (pharmacy: Pharmacy) => {
        const phoneUrl = `tel:${pharmacy.phone}`;
        
        Alert.alert(
            'Call Pharmacy',
            `Would you like to call ${pharmacy.name}?`,
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

    const handleSendPrescription = (pharmacy: Pharmacy) => {
        if (onSendPrescription) {
            onSendPrescription(pharmacy);
        }
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
                    {/* Pharmacy Markers */}
                    {pharmacies.map((pharmacy) => {
                        const isSelected = selectedPharmacy?.id === pharmacy.id;
                        
                        return (
                            <Marker
                                key={pharmacy.id}
                                coordinate={pharmacy.coordinates}
                                title={pharmacy.name}
                                description={`${pharmacy.address} • ${pharmacy.distance} km away`}
                                onPress={() => handleMarkerPress(pharmacy)}
                                pinColor={isSelected ? COLORS.primary : (pharmacy.isOpen ? COLORS.success : COLORS.error)}
                            >
                                {/* Custom marker callout */}
                                <View style={[
                                    styles.customMarker,
                                    { backgroundColor: isSelected ? COLORS.primary : (pharmacy.isOpen ? COLORS.success : COLORS.error) }
                                ]}>
                                    <Pill 
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
                        <Text style={styles.mapTitle}>Pharmacies</Text>
                        <Text style={styles.mapSubtitle}>{pharmacies.length} pharmacies found</Text>
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

    const renderPharmacyDetails = () => {
        if (!selectedPharmacy) return null;
        
        const availableMedicines = getAvailableMedicines(selectedPharmacy);
        const totalPrice = getTotalPrice(selectedPharmacy);

        return (
            <View style={styles.detailsCard}>
                <View style={styles.detailsHeader}>
                    <View style={styles.pharmacyInfo}>
                        <Text style={styles.pharmacyName}>{selectedPharmacy.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                            <Text style={styles.rating}>{selectedPharmacy.rating}</Text>
                            <Text style={styles.reviews}>({selectedPharmacy.reviews})</Text>
                        </View>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        selectedPharmacy.isOpen ? styles.openBadge : styles.closedBadge
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: selectedPharmacy.isOpen ? COLORS.success : COLORS.error }
                        ]}>
                            {selectedPharmacy.isOpen ? 'Open' : 'Closed'}
                        </Text>
                    </View>
                </View>

                <View style={styles.addressContainer}>
                    <MapPin size={14} color={COLORS.textSecondary} />
                    <Text style={styles.address}>{selectedPharmacy.address}</Text>
                    <Text style={styles.distance}>{selectedPharmacy.distance} km</Text>
                </View>

                <View style={styles.hoursContainer}>
                    <Clock size={14} color={COLORS.textSecondary} />
                    <Text style={styles.hours}>
                        {selectedPharmacy.workingHours.open === '24 Hours' 
                            ? '24 Hours' 
                            : `${selectedPharmacy.workingHours.open} - ${selectedPharmacy.workingHours.close}`
                        }
                    </Text>
                </View>

                {/* Available Medicines */}
                {availableMedicines.length > 0 && (
                    <View style={styles.medicinesContainer}>
                        <Text style={styles.medicinesTitle}>Available Medicines:</Text>
                        {availableMedicines.map((medicine, index) => (
                            <View key={index} style={styles.medicineItem}>
                                <View style={styles.medicineInfo}>
                                    <Pill size={16} color={COLORS.primary} />
                                    <Text style={styles.medicineName}>{medicine.medicineName}</Text>
                                </View>
                                <Text style={styles.medicinePrice}>LKR {medicine.price.toLocaleString()}</Text>
                            </View>
                        ))}
                        <View style={styles.totalPriceContainer}>
                            <Text style={styles.totalPriceLabel}>Total Price:</Text>
                            <Text style={styles.totalPrice}>LKR {totalPrice.toLocaleString()}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCall(selectedPharmacy)}
                    >
                        <Phone size={16} color={COLORS.primary} />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={() => handleDirections(selectedPharmacy)}
                    >
                        <Navigation size={16} color={COLORS.secondary} />
                        <Text style={styles.directionsButtonText}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !selectedPharmacy.isOpen && styles.sendButtonDisabled
                        ]}
                        onPress={() => handleSendPrescription(selectedPharmacy)}
                        disabled={!selectedPharmacy.isOpen}
                    >
                        <ShoppingCart size={16} color={COLORS.white} />
                        <Text style={[
                            styles.sendButtonText,
                            !selectedPharmacy.isOpen && styles.sendButtonTextDisabled
                        ]}>
                            {selectedPharmacy.isOpen ? 'Send Prescription' : 'Closed'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderGoogleMap()}
            {renderPharmacyDetails()}
            
            {!selectedPharmacy && (
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsText}>
                        {locationLoading 
                            ? 'Getting your location...' 
                            : 'Tap on a pharmacy marker to view available medicines and details'
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
    pharmacyInfo: {
        flex: 1,
    },
    pharmacyName: {
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
    medicinesContainer: {
        backgroundColor: COLORS.veryLightGray,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    medicinesTitle: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    medicineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    medicineInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    medicineName: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    medicinePrice: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
    totalPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 8,
        marginTop: 6,
    },
    totalPriceLabel: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    totalPrice: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        padding: 10,
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.primary,
        // flex: 1,
        width: '30%',
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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        // flex: 1,
        width: '35%',
        justifyContent: 'center',
    },
    directionsButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.secondary,
        marginLeft: 4,
        fontWeight: '500',
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        // flex: 1,
        width: '40%',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.lightGray,
    },
    sendButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.white,
        marginLeft: 4,
        fontWeight: '600',
    },
    sendButtonTextDisabled: {
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