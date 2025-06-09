import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    FlatList
} from 'react-native';
import {
    X,
    Calendar,
    Clock,
    User,
    Phone,
    Building,
    CheckCircle,
    AlertCircle
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

const { width } = Dimensions.get('window');

interface TimeSlot {
    time: string;
    available: boolean;
    booked?: boolean;
}

interface BookingModalProps {
    visible: boolean;
    testCenter: any;
    testName: string;
    onConfirm: (bookingDetails: any) => void;
    onCancel: () => void;
}

// Generate time slots for the next 7 days
const generateTimeSlots = (): { [key: string]: TimeSlot[] } => {
    const slots: { [key: string]: TimeSlot[] } = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        
        // Generate slots from 8 AM to 6 PM
        const daySlots: TimeSlot[] = [];
        for (let hour = 8; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const slotDateTime = new Date(date);
                slotDateTime.setHours(hour, minute, 0, 0);
                
                // Check if slot is in the past
                const isPast = slotDateTime < new Date();
                // Randomly make some slots unavailable for demo
                const randomUnavailable = Math.random() < 0.3;
                
                daySlots.push({
                    time,
                    available: !isPast && !randomUnavailable,
                    booked: randomUnavailable
                });
            }
        }
        slots[dateKey] = daySlots;
    }
    
    return slots;
};

// Generate next 7 days
const getNext7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayName = i === 0 ? 'Today' : 
                       i === 1 ? 'Tomorrow' : 
                       date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        days.push({
            key: date.toISOString().split('T')[0],
            label: dayName,
            date: dayDate,
            fullDate: date
        });
    }
    
    return days;
};

export default function BookingModal({ 
    visible, 
    testCenter, 
    testName, 
    onConfirm, 
    onCancel 
}: BookingModalProps) {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [timeSlots, setTimeSlots] = useState<{ [key: string]: TimeSlot[] }>({});
    const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date');
    const [patientInfo, setPatientInfo] = useState({
        name: 'John Doe', // This would come from user profile
        phone: '+94 77 123 4567',
        email: 'john.doe@email.com'
    });

    const days = getNext7Days();

    useEffect(() => {
        if (visible) {
            setTimeSlots(generateTimeSlots());
            setSelectedDate(days[0].key); // Default to today
            setSelectedTime('');
            setStep('date');
        }
    }, [visible]);

    const handleDateSelect = (dateKey: string) => {
        setSelectedDate(dateKey);
        setSelectedTime('');
        setStep('time');
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep('confirm');
    };

    const handleConfirm = () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Error', 'Please select a date and time');
            return;
        }

        const selectedDay = days.find(day => day.key === selectedDate);
        const bookingDetails = {
            testCenter,
            testName,
            date: selectedDate,
            time: selectedTime,
            dateLabel: selectedDay?.label,
            dateDisplay: selectedDay?.date,
            patientInfo,
            bookingId: `BK${Date.now()}`,
            bookingTime: new Date().toISOString()
        };

        onConfirm(bookingDetails);
    };

    const handleBack = () => {
        if (step === 'time') {
            setStep('date');
        } else if (step === 'confirm') {
            setStep('time');
        } else {
            onCancel();
        }
    };

    const getSelectedDayInfo = () => {
        return days.find(day => day.key === selectedDate);
    };

    const getAvailableSlots = () => {
        if (!selectedDate || !timeSlots[selectedDate]) return [];
        return timeSlots[selectedDate].filter(slot => slot.available);
    };

    const renderDateStep = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Date</Text>
            <Text style={styles.stepDescription}>Choose your preferred date for the test</Text>
            
            <FlatList
                data={days}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.dateCard,
                            selectedDate === item.key && styles.dateCardSelected
                        ]}
                        onPress={() => handleDateSelect(item.key)}
                    >
                        <Text style={[
                            styles.dayLabel,
                            selectedDate === item.key && styles.dayLabelSelected
                        ]}>
                            {item.label}
                        </Text>
                        <Text style={[
                            styles.dateLabel,
                            selectedDate === item.key && styles.dateLabelSelected
                        ]}>
                            {item.date}
                        </Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.key}
            />

            <View style={styles.testCenterInfo}>
                <Building size={20} color={COLORS.primary} />
                <View style={styles.centerDetails}>
                    <Text style={styles.centerName}>{testCenter?.name}</Text>
                    <Text style={styles.centerAddress}>{testCenter?.address}</Text>
                </View>
            </View>
        </View>
    );

    const renderTimeStep = () => {
        const availableSlots = getAvailableSlots();
        const selectedDayInfo = getSelectedDayInfo();

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Select Time</Text>
                <Text style={styles.stepDescription}>
                    Available slots for {selectedDayInfo?.label}, {selectedDayInfo?.date}
                </Text>
                
                {availableSlots.length === 0 ? (
                    <View style={styles.noSlotsContainer}>
                        <AlertCircle size={40} color={COLORS.warning} />
                        <Text style={styles.noSlotsText}>No available slots for this date</Text>
                        <Text style={styles.noSlotsSubtext}>Please select a different date</Text>
                    </View>
                ) : (
                    <View style={styles.timeSlotsGrid}>
                        {availableSlots.map((slot, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.timeSlot,
                                    selectedTime === slot.time && styles.timeSlotSelected
                                ]}
                                onPress={() => handleTimeSelect(slot.time)}
                            >
                                <Text style={[
                                    styles.timeText,
                                    selectedTime === slot.time && styles.timeTextSelected
                                ]}>
                                    {slot.time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderConfirmStep = () => {
        const selectedDayInfo = getSelectedDayInfo();
        const testInfo = testCenter?.availableTests?.find((test: any) => 
            test.name.toLowerCase().includes(testName.toLowerCase())
        );

        return (
            <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.stepTitle}>Confirm Booking</Text>
                <Text style={styles.stepDescription}>Please review your booking details</Text>
                
                {/* Booking Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <CheckCircle size={24} color={COLORS.success} />
                        <Text style={styles.summaryTitle}>Booking Summary</Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Test</Text>
                        <Text style={styles.summaryValue}>{testName}</Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Date</Text>
                        <Text style={styles.summaryValue}>
                            {selectedDayInfo?.label}, {selectedDayInfo?.date}
                        </Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Time</Text>
                        <Text style={styles.summaryValue}>{selectedTime}</Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Duration</Text>
                        <Text style={styles.summaryValue}>{testInfo?.duration || '15 min'}</Text>
                    </View>
                    
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Price</Text>
                        <Text style={styles.summaryPrice}>
                            LKR {testInfo?.price?.toLocaleString() || '0'}
                        </Text>
                    </View>
                </View>

                {/* Test Center Details */}
                <View style={styles.centerCard}>
                    <Text style={styles.cardTitle}>Test Center</Text>
                    <View style={styles.centerInfo}>
                        <Building size={20} color={COLORS.primary} />
                        <View style={styles.centerDetails}>
                            <Text style={styles.centerName}>{testCenter?.name}</Text>
                            <Text style={styles.centerAddress}>{testCenter?.address}</Text>
                            <Text style={styles.centerPhone}>{testCenter?.phone}</Text>
                        </View>
                    </View>
                </View>

                {/* Patient Information */}
                <View style={styles.patientCard}>
                    <Text style={styles.cardTitle}>Patient Information</Text>
                    <View style={styles.patientInfo}>
                        <View style={styles.patientItem}>
                            <User size={16} color={COLORS.textSecondary} />
                            <Text style={styles.patientText}>{patientInfo.name}</Text>
                        </View>
                        <View style={styles.patientItem}>
                            <Phone size={16} color={COLORS.textSecondary} />
                            <Text style={styles.patientText}>{patientInfo.phone}</Text>
                        </View>
                    </View>
                </View>

                {/* Important Notes */}
                <View style={styles.notesCard}>
                    <Text style={styles.cardTitle}>Important Notes</Text>
                    <View style={styles.notesList}>
                        <Text style={styles.noteItem}>• Please arrive 15 minutes before your appointment</Text>
                        <Text style={styles.noteItem}>• Bring a valid ID and your booking confirmation</Text>
                        <Text style={styles.noteItem}>• Fasting may be required for certain tests</Text>
                        <Text style={styles.noteItem}>• Contact the lab if you need to reschedule</Text>
                    </View>
                </View>
            </ScrollView>
        );
    };

    const getStepContent = () => {
        switch (step) {
            case 'date':
                return renderDateStep();
            case 'time':
                return renderTimeStep();
            case 'confirm':
                return renderConfirmStep();
            default:
                return renderDateStep();
        }
    };

    const getActionButtons = () => {
        if (step === 'date') {
            return (
                <View style={styles.actionButtons}>
                    <Button
                        title="Cancel"
                        variant="outline"
                        onPress={onCancel}
                        style={styles.cancelButton}
                    />
                    <Button
                        title="Next"
                        onPress={() => setStep('time')}
                        style={styles.nextButton}
                        disabled={!selectedDate}
                    />
                </View>
            );
        } else if (step === 'time') {
            return (
                <View style={styles.actionButtons}>
                    <Button
                        title="Back"
                        variant="outline"
                        onPress={handleBack}
                        style={styles.backButton}
                    />
                    <Button
                        title="Next"
                        onPress={() => setStep('confirm')}
                        style={styles.nextButton}
                        disabled={!selectedTime}
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.actionButtons}>
                    <Button
                        title="Back"
                        variant="outline"
                        onPress={handleBack}
                        style={styles.backButton}
                    />
                    <Button
                        title="Confirm Booking"
                        onPress={handleConfirm}
                        style={styles.confirmButton}
                    />
                </View>
            );
        }
    };

    if (!testCenter) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onCancel}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={step === 'date' ? onCancel : handleBack}
                    >
                        <X size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Book Appointment</Text>
                    <View style={styles.stepIndicator}>
                        <Text style={styles.stepText}>
                            {step === 'date' ? '1' : step === 'time' ? '2' : '3'}/3
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {getStepContent()}
                </View>

                <View style={styles.footer}>
                    {getActionButtons()}
                </View>
            </View>
        </Modal>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    closeButton: {
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
    stepIndicator: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    stepText: {
        fontSize: SIZES.xs,
        color: COLORS.white,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    stepContainer: {
        flex: 1,
        padding: 16,
    },
    stepTitle: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    datesContainer: {
        paddingHorizontal: 8,
    },
    dateCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        minWidth: 80,
        borderWidth: 2,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    dateCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    dayLabel: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    dayLabelSelected: {
        color: COLORS.white,
    },
    dateLabel: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    dateLabelSelected: {
        color: COLORS.white,
    },
    testCenterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        ...SHADOWS.small,
    },
    centerDetails: {
        marginLeft: 12,
        flex: 1,
    },
    centerName: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    centerAddress: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    noSlotsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    noSlotsText: {
        fontSize: SIZES.md,
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    noSlotsSubtext: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    timeSlotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    timeSlot: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        width: (width - 48) / 3 - 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    timeSlotSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    timeText: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    timeTextSelected: {
        color: COLORS.white,
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    summaryLabel: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    summaryPrice: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    centerCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    cardTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    centerInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    centerPhone: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        marginTop: 4,
    },
    patientCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    patientInfo: {
        gap: 8,
    },
    patientItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    patientText: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    notesCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    notesList: {
        gap: 8,
    },
    noteItem: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    footer: {
        padding: 16,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
    },
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 1,
    },
    confirmButton: {
        flex: 1,
    },
});