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

/**
 * Calculate age from birth date
 * @param dateOfBirth - Birth date as string or Date object
 * @returns Age in years as a number
 */
export const calculateAge = (dateOfBirth: string | Date | null | undefined): number => {
    if (!dateOfBirth) return 0;
    
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) return 0;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return Math.max(0, age); // Ensure age is not negative
};

/**
 * Format age for display with appropriate unit
 * @param dateOfBirth - Birth date as string or Date object
 * @returns Formatted age string (e.g., "25 years", "2 months", "3 weeks")
 */
export const formatAge = (dateOfBirth: string | Date | null | undefined): string => {
    if (!dateOfBirth) return 'Age not provided';
    
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    
    if (isNaN(birthDate.getTime())) return 'Invalid date';
    
    const today = new Date();
    const ageInYears = calculateAge(dateOfBirth);
    
    // For children under 2 years, show months or weeks
    if (ageInYears < 2) {
        const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
        
        if (ageInMonths < 1) {
            const ageInWeeks = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
            if (ageInWeeks < 1) {
                const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
                return ageInDays === 1 ? '1 day' : `${Math.max(0, ageInDays)} days`;
            }
            return ageInWeeks === 1 ? '1 week' : `${ageInWeeks} weeks`;
        }
        
        return ageInMonths === 1 ? '1 month' : `${ageInMonths} months`;
    }
    
    // For 2+ years, show years
    return ageInYears === 1 ? '1 year' : `${ageInYears} years`;
};

/**
 * Validate if a date of birth is reasonable
 * @param dateOfBirth - Birth date as string or Date object
 * @returns Object with validation result and error message
 */
export const validateDateOfBirth = (dateOfBirth: string | Date | null | undefined): { isValid: boolean; error?: string } => {
    if (!dateOfBirth) {
        return { isValid: false, error: 'Date of birth is required' };
    }
    
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    
    if (isNaN(birthDate.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
    }
    
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 150); // Maximum age of 150 years
    
    if (birthDate < minDate) {
        return { isValid: false, error: 'Date of birth is too far in the past' };
    }
    
    if (birthDate > today) {
        return { isValid: false, error: 'Date of birth cannot be in the future' };
    }
    
    return { isValid: true };
};

/**
 * Get age category for medical purposes
 * @param dateOfBirth - Birth date as string or Date object
 * @returns Age category string
 */
export const getAgeCategory = (dateOfBirth: string | Date | null | undefined): string => {
    const age = calculateAge(dateOfBirth);
    
    if (age < 1) return 'Infant';
    if (age < 2) return 'Toddler';
    if (age < 13) return 'Child';
    if (age < 18) return 'Adolescent';
    if (age < 65) return 'Adult';
    return 'Senior';
};

/**
 * Check if patient is a minor (under 18)
 * @param dateOfBirth - Birth date as string or Date object
 * @returns Boolean indicating if patient is minor
 */
export const isMinor = (dateOfBirth: string | Date | null | undefined): boolean => {
    return calculateAge(dateOfBirth) < 18;
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param date - Date as string or Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
};