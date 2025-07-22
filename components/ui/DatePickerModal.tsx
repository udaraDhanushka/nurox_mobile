import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, X } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

interface DateOption {
  date: string;
  formatted: string;
  label: string;
  isToday: boolean;
  isTomorrow: boolean;
  dayOfWeek: string;
}

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
  minDate?: Date;
  maxDaysAhead?: number;
}

const { width, height } = Dimensions.get('window');

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
  minDate = new Date(),
  maxDaysAhead = 30
}) => {
  const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate);
  const insets = useSafeAreaInsets();

  const generateDates = (): DateOption[] => {
    const dates: DateOption[] = [];
    const today = new Date(minDate);
    // Ensure we're working with local date (Sri Lankan timezone if device is set correctly)
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    for (let i = 0; i < Math.min(7, maxDaysAhead); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const formatted = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });

      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = dayOfWeek;
      
      dates.push({
        date: dateString,
        formatted,
        label,
        isToday: i === 0,
        isTomorrow: i === 1,
        dayOfWeek
      });
    }
    
    return dates;
  };

  const generateCalendarDays = () => {
    const today = new Date(minDate);
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of the month and calculate starting day of week
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    
    const calendarDays: (DateOption | null)[] = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the current month (but only future dates)
    const daysInMonth = lastDayOfMonth.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      
      // Only add if it's today or in the future (comparing dates only, not time)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      if (dateOnly >= todayOnly) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;
        
        const formatted = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });

        const daysSinceToday = Math.floor((dateOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));
        
        let label = '';
        if (daysSinceToday === 0) label = 'Today';
        else if (daysSinceToday === 1) label = 'Tomorrow';
        else label = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        calendarDays.push({
          date: dateString,
          formatted,
          label,
          isToday: daysSinceToday === 0,
          isTomorrow: daysSinceToday === 1,
          dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
      } else {
        calendarDays.push(null); // Past dates as null
      }
    }
    
    // Add next month dates if we have space and haven't reached maxDaysAhead
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    let nextMonthDay = 1;
    
    while (calendarDays.length < 42 && calendarDays.length % 7 !== 0) { // Fill remaining cells in 6x7 grid
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextMonthDay);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const daysSinceToday = Math.floor((dateOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceToday < maxDaysAhead) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;
        
        const formatted = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });
        
        calendarDays.push({
          date: dateString,
          formatted,
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday: false,
          isTomorrow: false,
          dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
      } else {
        calendarDays.push(null);
      }
      
      nextMonthDay++;
    }
    
    return calendarDays;
  };

  const handleConfirm = () => {
    onDateSelect(tempSelectedDate);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedDate(selectedDate);
    onClose();
  };

  const dates = generateDates();
  const calendarDays = generateCalendarDays();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { 
          marginTop: Math.max(insets.top + 20, 40), 
          marginBottom: Math.max(insets.bottom + 20, 40) 
        }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCancel}
            >
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.title}>Select Appointment Date</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Quick Select Section */}
          <View style={styles.quickSelectSection}>
            <Text style={styles.sectionTitle}>Quick Select</Text>
            <View style={styles.quickSelectRow}>
              {dates.slice(0, 3).map((dateOption) => (
                <TouchableOpacity
                  key={dateOption.date}
                  style={[
                    styles.quickSelectButton,
                    tempSelectedDate === dateOption.date && styles.selectedQuickSelect
                  ]}
                  onPress={() => setTempSelectedDate(dateOption.date)}
                >
                  <Text style={[
                    styles.quickSelectLabel,
                    tempSelectedDate === dateOption.date && styles.selectedQuickSelectText
                  ]}>
                    {dateOption.label}
                  </Text>
                  <Text style={[
                    styles.quickSelectDate,
                    tempSelectedDate === dateOption.date && styles.selectedQuickSelectText
                  ]}>
                    {new Date(dateOption.date).getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarSection}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>
                {new Date(minDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
            
            <View style={styles.weekDaysHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendarGrid}>
              {calendarDays.map((dateOption, index) => {
                if (!dateOption) {
                  // Empty cell for days outside current month range
                  return <View key={`empty-${index}`} style={styles.dateCell} />;
                }
                
                const date = new Date(dateOption.date);
                const dayOfMonth = date.getDate();
                const isNextMonth = date.getMonth() !== new Date(minDate).getMonth();
                
                return (
                  <TouchableOpacity
                    key={dateOption.date}
                    style={[
                      styles.dateCell,
                      tempSelectedDate === dateOption.date && styles.selectedDateCell,
                      dateOption.isToday && styles.todayCell,
                      isNextMonth && styles.nextMonthCell
                    ]}
                    onPress={() => setTempSelectedDate(dateOption.date)}
                  >
                    <Text style={[
                      styles.dateCellText,
                      tempSelectedDate === dateOption.date && styles.selectedDateText,
                      dateOption.isToday && styles.todayText,
                      isNextMonth && styles.nextMonthText
                    ]}>
                      {dayOfMonth}
                    </Text>
                    {dateOption.isToday && (
                      <View style={styles.todayDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Date Display */}
          {tempSelectedDate && (
            <View style={styles.selectedDateDisplay}>
              <Calendar size={20} color={COLORS.primary} />
              <View style={styles.selectedDateInfo}>
                <Text style={styles.selectedDateLabel}>Selected Date</Text>
                <Text style={styles.selectedDateValue}>
                  {new Date(tempSelectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={[styles.actionButtons, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              style={styles.cancelButton}
            />
            <Button
              title="Confirm"
              onPress={handleConfirm}
              style={styles.confirmButton}
              disabled={!tempSelectedDate}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: width - 40,
    maxWidth: 400,
    maxHeight: height * 0.75,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quickSelectSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickSelectButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedQuickSelect: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickSelectLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  quickSelectDate: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  selectedQuickSelectText: {
    color: COLORS.white,
  },
  calendarSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  monthHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    width: '14.28%', // Match calendar cell width
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.background,
    position: 'relative',
    marginBottom: 4,
  },
  selectedDateCell: {
    backgroundColor: COLORS.primary,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dateCellText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedDateText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  nextMonthCell: {
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  nextMonthText: {
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
  todayDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  selectedDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.transparentPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedDateInfo: {
    marginLeft: 12,
  },
  selectedDateLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  selectedDateValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});