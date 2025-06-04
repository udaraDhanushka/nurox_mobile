import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, ArrowLeft, Search } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAppointmentStore } from '@/store/appointmentStore';

// Define types for doctor, date and time slots
interface Doctor {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    experience: string;
    image: string;
}

interface DateSlot {
    id: string;
    date: string;
    day: string;
    dayNum: number;
}

interface TimeSlot {
    id: string;
    time: string;
}

// Mock data for available doctors
const availableDoctors: Doctor[] = [
    {
        id: 'd1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        rating: 4.9,
        reviews: 124,
        experience: '10 years',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 'd2',
        name: 'Dr. Michael Chen',
        specialty: 'Neurologist',
        rating: 4.8,
        reviews: 98,
        experience: '8 years',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 'd3',
        name: 'Dr. Emily Rodriguez',
        specialty: 'Dermatologist',
        rating: 4.7,
        reviews: 112,
        experience: '7 years',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2787&auto=format&fit=crop'
    },
    {
        id: 'd4',
        name: 'Dr. James Wilson',
        specialty: 'Orthopedic Surgeon',
        rating: 4.9,
        reviews: 156,
        experience: '12 years',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop'
    }
];

// Mock data for available time slots
const availableTimeSlots: TimeSlot[] = [
    { id: 't1', time: '09:00 AM' },
    { id: 't2', time: '10:30 AM' },
    { id: 't3', time: '11:45 AM' },
    { id: 't4', time: '02:15 PM' },
    { id: 't5', time: '03:30 PM' },
    { id: 't6', time: '04:45 PM' }
];

// Mock data for available dates (next 7 days)
const getAvailableDates = (): DateSlot[] => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        dates.push({
            id: `d${i}`,
            date: date.toISOString().split('T')[0],
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: date.getDate()
        });
    }

    return dates;
};

export default function BookAppointmentScreen() {
    const router = useRouter();
    const { addAppointment } = useAppointmentStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<DateSlot | null>(null);
    const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const availableDates = getAvailableDates();

    const filteredDoctors = searchQuery
        ? availableDoctors.filter(doctor =>
            doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : availableDoctors;

    const handleBookAppointment = () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) {
            Alert.alert('Missing Information', 'Please select a doctor, date, and time for your appointment.');
            return;
        }

        setIsLoading(true);

        // Create a new appointment
        const newAppointment = {
            id: `app-${Date.now()}`,
            doctorName: selectedDoctor.name,
            specialty: selectedDoctor.specialty,
            date: selectedDate.date,
            time: selectedTime.time,
            location: 'Main Hospital, Building A, Room 305',
            status: 'pending' as const, // Type assertion to AppointmentStatus
            notes: reason || 'No additional notes',
            doctorImage: selectedDoctor.image
        };

        // Simulate API delay
        setTimeout(() => {
            addAppointment(newAppointment);
            setIsLoading(false);

            Alert.alert(
                'Appointment Requested',
                'Your appointment request has been submitted successfully. You will receive a confirmation notification soon.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/myAppointments')
                    }
                ]
            );
        }, 1000);
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
                <Text style={styles.headerTitle}>Book Appointment</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Search size={20} color={COLORS.textSecondary} />
                        <Input
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search doctors by name or specialty"
                            style={styles.searchInput}
                            inputStyle={styles.searchInputText}
                        />
                    </View>
                </View>

                {/* Doctor Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Doctor</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.doctorsContainer}
                    >
                        {filteredDoctors.map((doctor) => (
                            <TouchableOpacity
                                key={doctor.id}
                                style={[
                                    styles.doctorCard,
                                    selectedDoctor?.id === doctor.id && styles.selectedDoctorCard
                                ]}
                                onPress={() => setSelectedDoctor(doctor)}
                            >
                                <Image
                                    source={{ uri: doctor.image }}
                                    style={styles.doctorImage}
                                />
                                <Text style={styles.doctorName}>{doctor.name}</Text>
                                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                                <View style={styles.doctorRating}>
                                    <Text style={styles.ratingText}>⭐ {doctor.rating}</Text>
                                    <Text style={styles.reviewsText}>({doctor.reviews})</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Date Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.datesContainer}
                    >
                        {availableDates.map((date) => (
                            <TouchableOpacity
                                key={date.id}
                                style={[
                                    styles.dateCard,
                                    selectedDate?.id === date.id && styles.selectedDateCard
                                ]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text
                                    style={[
                                        styles.dateDay,
                                        selectedDate?.id === date.id && styles.selectedDateText
                                    ]}
                                >
                                    {date.day}
                                </Text>
                                <Text
                                    style={[
                                        styles.dateDayNum,
                                        selectedDate?.id === date.id && styles.selectedDateText
                                    ]}
                                >
                                    {date.dayNum}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Time Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Time</Text>
                    <View style={styles.timeContainer}>
                        {availableTimeSlots.map((slot) => (
                            <TouchableOpacity
                                key={slot.id}
                                style={[
                                    styles.timeCard,
                                    selectedTime?.id === slot.id && styles.selectedTimeCard
                                ]}
                                onPress={() => setSelectedTime(slot)}
                            >
                                <Clock
                                    size={16}
                                    color={selectedTime?.id === slot.id ? COLORS.white : COLORS.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.timeText,
                                        selectedTime?.id === slot.id && styles.selectedTimeText
                                    ]}
                                >
                                    {slot.time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Reason for Visit */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reason for Visit (Optional)</Text>
                    <Input
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Briefly describe your symptoms or reason for the appointment"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Book Button */}
                <Button
                    title="Book Appointment"
                    onPress={handleBookAppointment}
                    isLoading={isLoading}
                    style={styles.bookButton}
                    disabled={!selectedDoctor || !selectedDate || !selectedTime}
                />
            </ScrollView>
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
    searchContainer: {
        marginBottom: 20,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        ...SHADOWS.small,
    },
    searchInput: {
        flex: 1,
        marginBottom: 0,
        paddingLeft: 8
    },
    searchInputText: {
        height: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    doctorsContainer: {
        paddingRight: 16,
    },
    doctorCard: {
        width: 150,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    selectedDoctorCard: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    doctorImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
    },
    doctorName: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    doctorRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: SIZES.xs,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    reviewsText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    datesContainer: {
        paddingRight: 16,
    },
    dateCard: {
        width: 60,
        height: 80,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        ...SHADOWS.small,
    },
    selectedDateCard: {
        backgroundColor: COLORS.primary,
    },
    dateDay: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    dateDayNum: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    selectedDateText: {
        color: COLORS.white,
    },
    timeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 12,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    selectedTimeCard: {
        backgroundColor: COLORS.primary,
    },
    timeText: {
        fontSize: SIZES.xs,
        color: COLORS.textPrimary,
        marginLeft: 4,
    },
    selectedTimeText: {
        color: COLORS.white,
    },
    bookButton: {
        marginBottom: 24,
    },
});