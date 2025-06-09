import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator,
    RefreshControl,
    Alert 
} from 'react-native';
import { 
    Building, 
    MapPin, 
    Star, 
    Clock, 
    Phone, 
    DollarSign,
    Navigation 
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { TestCenter } from '@/types/medical';

// interface TestCenter {
//     id: string;
//     name: string;
//     address: string;
//     distance: number;
//     rating: number;
//     reviews: number;
//     phone: string;
//     isOpen: boolean;
//     openHours: string;
//     availableTests: Array<{
//         name: string;
//         price: number;
//         duration: string;
//         availableSlots: number;
//     }>;
//     nextAvailableSlot: string;
//     coordinates: {
//         latitude: number;
//         longitude: number;
//     };
// }

interface TestCentersListProps {
    testName: string;
    onBookTest: (testCenter: TestCenter) => void;
}

// Mock data - in real app, this would come from an API
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
        availableTests: [
            { name: 'Complete Blood Count (CBC)', price: 2500, duration: '15 min', availableSlots: 8 },
            { name: 'Lipid Panel', price: 3500, duration: '15 min', availableSlots: 5 },
            { name: 'Thyroid Function Test', price: 4500, duration: '10 min', availableSlots: 12 }
        ],
        nextAvailableSlot: 'Today 2:30 PM',
        coordinates: { latitude: 6.9271, longitude: 79.8612 }
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
        availableTests: [
            { name: 'Complete Blood Count (CBC)', price: 2200, duration: '20 min', availableSlots: 6 },
            { name: 'Vitamin D Level', price: 3800, duration: '10 min', availableSlots: 10 }
        ],
        nextAvailableSlot: 'Today 4:15 PM',
        coordinates: { latitude: 6.8935, longitude: 79.8573 }
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
        availableTests: [
            { name: 'Complete Blood Count (CBC)', price: 2800, duration: '15 min', availableSlots: 0 },
            { name: 'Lipid Panel', price: 3200, duration: '15 min', availableSlots: 3 },
            { name: 'Thyroid Function Test', price: 4200, duration: '12 min', availableSlots: 7 }
        ],
        nextAvailableSlot: 'Tomorrow 9:00 AM',
        coordinates: { latitude: 6.9147, longitude: 79.8757 }
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
        availableTests: [
            { name: 'Complete Blood Count (CBC)', price: 2300, duration: '18 min', availableSlots: 15 },
            { name: 'Vitamin D Level', price: 4000, duration: '12 min', availableSlots: 8 }
        ],
        nextAvailableSlot: 'Now Available',
        coordinates: { latitude: 6.9222, longitude: 79.8648 }
    }
];

export default function TestCentersList({ testName, onBookTest }: TestCentersListProps) {
    const [testCenters, setTestCenters] = useState<TestCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');

    useEffect(() => {
        loadTestCenters();
    }, [testName]);

    const loadTestCenters = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Filter centers that offer the requested test
            const filteredCenters = mockTestCenters.filter(center =>
                center.availableTests.some(test => 
                    test.name.toLowerCase().includes(testName.toLowerCase())
                )
            );
            
            setTestCenters(sortCenters(filteredCenters, sortBy));
        } catch (error) {
            console.error('Error loading test centers:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortCenters = (centers: TestCenter[], criteria: 'distance' | 'price' | 'rating') => {
        return [...centers].sort((a, b) => {
            switch (criteria) {
                case 'distance':
                    return a.distance - b.distance;
                case 'price':
                    const aPrice = getTestPrice(a, testName);
                    const bPrice = getTestPrice(b, testName);
                    return aPrice - bPrice;
                case 'rating':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });
    };

    const getTestPrice = (center: TestCenter, testName: string): number => {
        const test = center.availableTests.find(t => 
            t.name.toLowerCase().includes(testName.toLowerCase())
        );
        return test ? test.price : 0;
    };

    const getTestInfo = (center: TestCenter, testName: string) => {
        return center.availableTests.find(t => 
            t.name.toLowerCase().includes(testName.toLowerCase())
        );
    };

    const handleSortChange = (newSortBy: 'distance' | 'price' | 'rating') => {
        setSortBy(newSortBy);
        setTestCenters(sortCenters(testCenters, newSortBy));
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTestCenters();
        setRefreshing(false);
    };

    const handleCall = (center: TestCenter) => {
        Alert.alert(
            'Call Center',
            `Would you like to call ${center.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Call', 
                    onPress: () => {
                        // In a real app, this would initiate a phone call using Linking
                        // Linking.openURL(`tel:${center.phone}`);
                        Alert.alert('Calling', `Calling ${center.phone}`);
                    }
                }
            ]
        );
    };

    const handleDirections = (center: TestCenter) => {
        Alert.alert(
            'Open Directions',
            `Would you like to open directions to ${center.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Open Maps', 
                    onPress: () => {
                        // In a real app, this would open the native maps app
                        // const url = Platform.select({
                        //   ios: `maps:0,0?q=${center.coordinates.latitude},${center.coordinates.longitude}`,
                        //   android: `geo:0,0?q=${center.coordinates.latitude},${center.coordinates.longitude}`
                        // });
                        // Linking.openURL(url);
                        Alert.alert('Success', 'Directions opened in Maps app');
                    }
                }
            ]
        );
    };

    const renderTestCenter = ({ item }: { item: TestCenter }) => {
        const testInfo = getTestInfo(item, testName);
        
        return (
            <View style={styles.centerCard}>
                <View style={styles.centerHeader}>
                    <View style={styles.centerInfo}>
                        <Text style={styles.centerName}>{item.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                            <Text style={styles.rating}>{item.rating}</Text>
                            <Text style={styles.reviews}>({item.reviews} reviews)</Text>
                        </View>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        item.isOpen ? styles.openBadge : styles.closedBadge
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.isOpen ? COLORS.success : COLORS.error }
                        ]}>
                            {item.isOpen ? 'Open' : 'Closed'}
                        </Text>
                    </View>
                </View>

                <View style={styles.addressContainer}>
                    <MapPin size={14} color={COLORS.textSecondary} />
                    <Text style={styles.address}>{item.address}</Text>
                    <Text style={styles.distance}>{item.distance} km</Text>
                </View>

                <View style={styles.hoursContainer}>
                    <Clock size={14} color={COLORS.textSecondary} />
                    <Text style={styles.hours}>{item.openHours}</Text>
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
                        <Text style={styles.nextSlot}>Next: {item.nextAvailableSlot}</Text>
                    </View>
                )}

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCall(item)}
                    >
                        <Phone size={16} color={COLORS.primary} />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={() => handleDirections(item)}
                    >
                        <Navigation size={16} color={COLORS.secondary} />
                        <Text style={styles.directionsButtonText}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.bookButton,
                            (!item.isOpen || !testInfo || testInfo.availableSlots === 0) && styles.bookButtonDisabled
                        ]}
                        onPress={() => onBookTest(item)}
                        disabled={!item.isOpen || !testInfo || testInfo.availableSlots === 0}
                    >
                        <Text style={[
                            styles.bookButtonText,
                            (!item.isOpen || !testInfo || testInfo.availableSlots === 0) && styles.bookButtonTextDisabled
                        ]}>
                            {!item.isOpen ? 'Closed' : 
                             !testInfo ? 'Not Available' :
                             testInfo.availableSlots === 0 ? 'Fully Booked' : 'Book Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding test centers...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Sort Options */}
            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <View style={styles.sortButtons}>
                    {(['distance', 'price', 'rating'] as const).map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.sortButton,
                                sortBy === option && styles.sortButtonActive
                            ]}
                            onPress={() => handleSortChange(option)}
                        >
                            <Text style={[
                                styles.sortButtonText,
                                sortBy === option && styles.sortButtonTextActive
                            ]}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Results Count */}
            <View style={styles.resultsContainer}>
                <Text style={styles.resultsText}>
                    {testCenters.length} test center{testCenters.length !== 1 ? 's' : ''} found for "{testName}"
                </Text>
            </View>

            {/* Test Centers List */}
            <FlatList
                data={testCenters}
                renderItem={renderTestCenter}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Building size={60} color={COLORS.lightGray} />
                        <Text style={styles.emptyText}>
                            No test centers found for "{testName}"
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Try searching for a different test or check back later
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 16,
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sortLabel: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginRight: 12,
    },
    sortButtons: {
        flexDirection: 'row',
        flex: 1,
    },
    sortButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: COLORS.veryLightGray,
    },
    sortButtonActive: {
        backgroundColor: COLORS.primary,
    },
    sortButtonText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    sortButtonTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    resultsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.white,
    },
    resultsText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    listContainer: {
        padding: 16,
    },
    centerCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    centerHeader: {
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
        marginBottom: 6,
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
    nextSlot: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: SIZES.sm,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
});