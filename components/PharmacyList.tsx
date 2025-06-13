import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { Star, Clock, Phone, Navigation, MapPin } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Pharmacy, PharmacyMedicine } from '@/types/medical';

interface PharmacyListProps {
    prescriptionMedicines: string[];
    onSendPrescription: (pharmacy: Pharmacy) => void;
}

// Types for pharmacy data
interface Medicine {
    id: string;
    medicineName: string;
    price: number;
    inStock: boolean;
    quantity?: number;
}

// interface Pharmacy {
//     id: string;
//     name: string;
//     address: string;
//     distance: number;
//     rating: number;
//     reviews: number;
//     phone: string;
//     isOpen: boolean;
//     workingHours: {
//         open: string;
//         close: string;
//     };
//     coordinates: {
//         latitude: number;
//         longitude: number;
//     };
//     medicines: Medicine[];
// }

interface PharmacyListProps {
    prescriptionMedicines: string[];
    onSendPrescription: (pharmacy: Pharmacy) => void;
}

// Mock pharmacy data
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
            { id: '3', medicineName: 'Tretinoin Cream', price: 1250, inStock: true, quantity: 15 },
            { id: '4', medicineName: 'Clindamycin', price: 890, inStock: true, quantity: 40 },
            { id: '5', medicineName: 'Sumatriptan', price: 1850, inStock: true, quantity: 12 },
            { id: '6', medicineName: 'Atorvastatin', price: 380, inStock: true, quantity: 25 },
            { id: '7', medicineName: 'Amlodipine', price: 290, inStock: true, quantity: 35 },
            { id: '8', medicineName: 'Omeprazole', price: 250, inStock: true, quantity: 40 },
            { id: '9', medicineName: 'Simvastatin', price: 420, inStock: true, quantity: 20 },
            { id: '10', medicineName: 'Losartan', price: 360, inStock: true, quantity: 30 },
            { id: '11', medicineName: 'Aspirin', price: 150, inStock: true, quantity: 100 }
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
            { id: '2', medicineName: 'Tretinoin Cream', price: 1180, inStock: true, quantity: 20 },
            { id: '3', medicineName: 'Clindamycin', price: 920, inStock: true, quantity: 35 },
            { id: '4', medicineName: 'Metformin', price: 300, inStock: true, quantity: 40 },
            { id: '5', medicineName: 'Atorvastatin', price: 390, inStock: true, quantity: 20 },
            { id: '6', medicineName: 'Omeprazole', price: 240, inStock: true, quantity: 35 },
            { id: '7', medicineName: 'Aspirin', price: 140, inStock: true, quantity: 80 }
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
            { id: '2', medicineName: 'Sumatriptan', price: 1750, inStock: true, quantity: 8 },
            { id: '3', medicineName: 'Amlodipine', price: 310, inStock: true, quantity: 25 },
            { id: '4', medicineName: 'Simvastatin', price: 450, inStock: true, quantity: 15 },
            { id: '5', medicineName: 'Losartan', price: 380, inStock: true, quantity: 25 }
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
            { id: '2', medicineName: 'Tretinoin Cream', price: 1200, inStock: true, quantity: 18 },
            { id: '3', medicineName: 'Clindamycin', price: 900, inStock: true, quantity: 30 },
            { id: '4', medicineName: 'Sumatriptan', price: 1900, inStock: true, quantity: 15 },
            { id: '5', medicineName: 'Metformin', price: 330, inStock: true, quantity: 60 },
            { id: '6', medicineName: 'Atorvastatin', price: 400, inStock: true, quantity: 30 },
            { id: '7', medicineName: 'Amlodipine', price: 300, inStock: true, quantity: 40 },
            { id: '8', medicineName: 'Omeprazole', price: 260, inStock: true, quantity: 50 },
            { id: '9', medicineName: 'Aspirin', price: 160, inStock: true, quantity: 120 }
        ]
    },
    {
        id: '5',
        name: 'PharmaCare Plus',
        address: '654 Baseline Road, Colombo 09',
        distance: 3.5,
        rating: 4.7,
        reviews: 203,
        phone: '+94 11 678 9012',
        isOpen: true,
        workingHours: { open: '08:30', close: '21:30' },
        coordinates: { latitude: 6.8847, longitude: 79.8736 },
        medicines: [
            { id: '1', medicineName: 'Simvastatin', price: 400, inStock: true, quantity: 25 },
            { id: '2', medicineName: 'Losartan', price: 350, inStock: true, quantity: 35 },
            { id: '3', medicineName: 'Omeprazole', price: 230, inStock: true, quantity: 45 },
            { id: '4', medicineName: 'Aspirin', price: 130, inStock: true, quantity: 90 },
            { id: '5', medicineName: 'Metformin', price: 310, inStock: true, quantity: 55 }
        ]
    }
];

export default function PharmacyList({ prescriptionMedicines, onSendPrescription }: PharmacyListProps) {
    const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);

    useEffect(() => {
        // Filter pharmacies that have the prescribed medicines
        const pharmaciesWithMedicines = mockPharmacies.filter(pharmacy =>
            pharmacy.medicines.some(medicine =>
                prescriptionMedicines.some(prescMed =>
                    medicine.medicineName.toLowerCase().includes(prescMed.toLowerCase()) &&
                    medicine.inStock
                )
            )
        ).sort((a, b) => a.distance - b.distance);

        setNearbyPharmacies(pharmaciesWithMedicines);
    }, [prescriptionMedicines]);

    const handleCallPharmacy = (phone: string) => {
        if (Platform.OS !== 'web') {
            Linking.openURL(`tel:${phone}`).catch(() => {
                Alert.alert('Error', 'Unable to make phone call');
            });
        } else {
            Alert.alert('Call Pharmacy', `Phone: ${phone}`);
        }
    };

    const handleGetDirections = (pharmacy: Pharmacy) => {
        if (Platform.OS !== 'web') {
            const url = Platform.select({
                ios: `maps:0,0?q=${pharmacy.coordinates.latitude},${pharmacy.coordinates.longitude}`,
                android: `geo:0,0?q=${pharmacy.coordinates.latitude},${pharmacy.coordinates.longitude}`,
            });

            if (url) {
                Linking.openURL(url).catch(() => {
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.coordinates.latitude},${pharmacy.coordinates.longitude}`;
                    Linking.openURL(googleMapsUrl);
                });
            }
        } else {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.coordinates.latitude},${pharmacy.coordinates.longitude}`;
            window.open(url, '_blank');
        }
    };

    const getAvailableMedicines = (pharmacy: Pharmacy) => {
        return pharmacy.medicines.filter(medicine =>
            prescriptionMedicines.some(prescMed =>
                medicine.medicineName.toLowerCase().includes(prescMed.toLowerCase()) &&
                medicine.inStock
            )
        );
    };

    const renderPharmacyCard = (pharmacy: Pharmacy) => {
        const availableMedicines = getAvailableMedicines(pharmacy);
        const totalPrice = availableMedicines.reduce((sum, med) => sum + med.price, 0);

        return (
            <View key={pharmacy.id} style={styles.pharmacyCard}>
                <View style={styles.pharmacyHeader}>
                    <View style={styles.pharmacyInfo}>
                        <View style={styles.pharmacyNameRow}>
                            <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                            {!pharmacy.isOpen && (
                                <View style={styles.closedBadge}>
                                    <Text style={styles.closedBadgeText}>Closed</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.pharmacyMeta}>
                            <View style={styles.ratingContainer}>
                                <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                                <Text style={styles.rating}>{pharmacy.rating}</Text>
                                <Text style={styles.reviews}>({pharmacy.reviews} reviews)</Text>
                            </View>
                            <Text style={styles.distance}>{pharmacy.distance?.toFixed(1)} km away</Text>
                        </View>
                        <View style={styles.addressRow}>
                            <MapPin size={14} color={COLORS.textSecondary} />
                            <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.workingHours}>
                    <Clock size={14} color={pharmacy.isOpen ? COLORS.success : COLORS.textSecondary} />
                    <Text style={[
                        styles.workingHoursText,
                        { color: pharmacy.isOpen ? COLORS.success : COLORS.textSecondary }
                    ]}>
                        {pharmacy.workingHours.open === '24 Hours'
                            ? 'Open 24 Hours'
                            : `${pharmacy.workingHours.open} - ${pharmacy.workingHours.close}`
                        }
                        {pharmacy.isOpen ? ' • Open now' : ' • Closed'}
                    </Text>
                </View>

                <View style={styles.medicineAvailability}>
                    <Text style={styles.availabilityTitle}>
                        Available Medicines ({availableMedicines.length}/{prescriptionMedicines.length}):
                    </Text>
                    {availableMedicines.map((med, index) => (
                        <View key={index} style={styles.medicineItem}>
                            <View style={styles.medicineItemLeft}>
                                <Text style={styles.medicineItemName}>{med.medicineName}</Text>
                                <Text style={styles.medicineStock}>In stock: {med.quantity} units</Text>
                            </View>
                            <Text style={styles.medicinePrice}>LKR {med.price.toFixed(2)}</Text>
                        </View>
                    ))}
                    {availableMedicines.length > 0 && (
                        <View style={styles.totalPrice}>
                            <Text style={styles.totalPriceLabel}>Total Estimated Cost:</Text>
                            <Text style={styles.totalPriceValue}>LKR {totalPrice.toFixed(2)}</Text>
                        </View>
                    )}
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
                        onPress={() => handleGetDirections(pharmacy)}
                    >
                        <Navigation size={16} color={COLORS.primary} />
                        <Text style={styles.actionButtonText}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            styles.sendButton,
                            !pharmacy.isOpen && styles.sendButtonDisabled
                        ]}
                        onPress={() => pharmacy.isOpen && onSendPrescription(pharmacy)}
                        disabled={!pharmacy.isOpen}
                    >
                        <Text style={[
                            styles.sendButtonText,
                            !pharmacy.isOpen && styles.sendButtonTextDisabled
                        ]}>
                            {pharmacy.isOpen ? 'Send Prescription' : 'Closed'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nearby Pharmacies</Text>
                <Text style={styles.headerSubtitle}>
                    Found {nearbyPharmacies.length} pharmacies with your medicines
                </Text>
            </View>

            {nearbyPharmacies.length > 0 ? (
                nearbyPharmacies.map(renderPharmacyCard)
            ) : (
                <View style={styles.noPharmaciesContainer}>
                    <Text style={styles.noPharmaciesText}>
                        No pharmacies found with your prescribed medicines nearby.
                    </Text>
                    <Text style={styles.noPharmaciesSuggestion}>
                        Try expanding your search area or contact pharmacies directly.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    pharmacyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    pharmacyHeader: {
        marginBottom: 12,
    },
    pharmacyInfo: {
        flex: 1,
    },
    pharmacyNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    pharmacyName: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
    },
    closedBadge: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    closedBadgeText: {
        fontSize: SIZES.xs,
        color: COLORS.error,
        fontWeight: '600',
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
        fontWeight: '500',
    },
    reviews: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    distance: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pharmacyAddress: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        flex: 1,
    },
    workingHours: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    workingHoursText: {
        fontSize: SIZES.sm,
        fontWeight: '500',
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
        alignItems: 'center',
        marginBottom: 6,
    },
    medicineItemLeft: {
        flex: 1,
    },
    medicineItemName: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    medicineStock: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    medicinePrice: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
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
        fontWeight: '500',
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        flex: 1,
        justifyContent: 'center',
        minWidth: 140,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.lightGray,
        borderColor: COLORS.lightGray,
    },
    sendButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.white,
        fontWeight: '600',
    },
    sendButtonTextDisabled: {
        color: COLORS.textSecondary,
    },
    noPharmaciesContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noPharmaciesText: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    noPharmaciesSuggestion: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});