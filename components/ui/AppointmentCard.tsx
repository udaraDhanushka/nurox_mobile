import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Calendar, Clock, MapPin, Hash } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Appointment } from '../../store/appointmentStore';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.appointmentCard}
      onPress={onPress}
    >
      <Image 
        source={{ uri: appointment.doctorImage }} 
        style={styles.doctorImage}
      />
      <View style={styles.appointmentInfo}>
        <Text style={styles.doctorName}>{appointment.doctorName}</Text>
        <Text style={styles.specialty}>{appointment.specialty}</Text>
        <Text style={styles.hospitalName}>{appointment.hospitalName}</Text>
        <View style={styles.appointmentDetailsContainer}>
          <View style={styles.appointmentTimeContainer}>
            <Calendar size={14} color={COLORS.textSecondary} />
            <Text style={styles.appointmentTime}>{appointment.date}</Text>
          </View>
          <View style={styles.appointmentTimeContainer}>
            <Hash size={14} color={COLORS.textSecondary} />
            <Text style={styles.appointmentTime}>Token {appointment.tokenNumber}</Text>
          </View>
          <View style={styles.appointmentTimeContainer}>
            <Clock size={14} color={COLORS.textSecondary} />
            <Text style={styles.appointmentTime}>{appointment.estimatedTime}</Text>
          </View>
        </View>
      </View>
      <View style={[
        styles.statusBadge, 
        appointment.status === 'confirmed' ? styles.confirmedBadge : 
        appointment.status === 'pending' ? styles.pendingBadge :
        appointment.status === 'completed' ? styles.completedBadge :
        styles.cancelledBadge
      ]}>
        <Text style={styles.statusText}>{appointment.status}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  specialty: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  hospitalName: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  appointmentDetailsContainer: {
    gap: 4,
  },
  appointmentTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  confirmedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  completedBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
});