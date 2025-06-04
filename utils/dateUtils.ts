import { format, formatDistanceToNow as formatDistanceToNowFn } from 'date-fns';

/**
 * Format a date to a readable string
 * @param date Date to format
 * @param formatString Format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: Date, formatString: string = 'MMM dd, yyyy'): string => {
    return format(date, formatString);
};

/**
 * Format a time to a readable string
 * @param date Date to format
 * @param formatString Format string (default: 'h:mm a')
 * @returns Formatted time string
 */
export const formatTime = (date: Date, formatString: string = 'h:mm a'): string => {
    return format(date, formatString);
};

/**
 * Format a date to a relative time string (e.g. "2 hours ago")
 * @param date Date to format
 * @returns Relative time string
 */
export const formatDistanceToNow = (date: Date): string => {
    return formatDistanceToNowFn(date, { addSuffix: true });
};

/**
 * Combine date and time strings into a Date object
 * @param dateStr Date string in format YYYY-MM-DD
 * @param timeStr Time string in format HH:MM AM/PM
 * @returns Combined Date object
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    let [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return new Date(year, month - 1, day, hours, minutes);
};