import { calculateAge, validateDateOfBirth } from './dateUtils';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Patient data validation for sync operations
export interface PatientSyncData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number;
  profileImage?: string;
}

/**
 * Validate patient data before synchronization
 */
export function validatePatientSyncData(data: PatientSyncData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (data.firstName !== undefined) {
    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push('First name cannot be empty');
    } else if (data.firstName.trim().length > 50) {
      errors.push('First name cannot exceed 50 characters');
    }
  }

  if (data.lastName !== undefined) {
    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.push('Last name cannot be empty');
    } else if (data.lastName.trim().length > 50) {
      errors.push('Last name cannot exceed 50 characters');
    }
  }

  // Email validation
  if (data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }
  }

  // Phone validation
  if (data.phone !== undefined && data.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      warnings.push('Phone number format may be invalid');
    }
  }

  // Date of birth validation
  if (data.dateOfBirth !== undefined) {
    const dobValidation = validateDateOfBirth(data.dateOfBirth);
    if (!dobValidation.isValid) {
      errors.push(dobValidation.error || 'Invalid date of birth');
    } else {
      // Check if age matches calculated age
      if (data.age !== undefined) {
        const calculatedAge = calculateAge(data.dateOfBirth);
        if (Math.abs(data.age - calculatedAge) > 1) {
          warnings.push(`Age mismatch: provided ${data.age}, calculated ${calculatedAge}`);
        }
      }
    }
  }

  // Age validation
  if (data.age !== undefined) {
    if (data.age < 0 || data.age > 150) {
      errors.push('Age must be between 0 and 150');
    }
  }

  // Profile image validation
  if (data.profileImage !== undefined && data.profileImage) {
    try {
      new URL(data.profileImage);
    } catch {
      warnings.push('Profile image URL may be invalid');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitize patient data for sync operations
 */
export function sanitizePatientSyncData(data: PatientSyncData): PatientSyncData {
  const sanitized: PatientSyncData = {};

  // Sanitize strings
  if (data.firstName !== undefined) {
    sanitized.firstName = data.firstName.trim();
  }
  if (data.lastName !== undefined) {
    sanitized.lastName = data.lastName.trim();
  }
  if (data.email !== undefined) {
    sanitized.email = data.email.trim().toLowerCase();
  }
  if (data.phone !== undefined) {
    // Remove common phone formatting characters
    sanitized.phone = data.phone.replace(/[\s\-\(\)]/g, '');
  }

  // Validate and format date of birth
  if (data.dateOfBirth !== undefined) {
    sanitized.dateOfBirth = data.dateOfBirth.trim();
    // Recalculate age to ensure consistency
    sanitized.age = calculateAge(sanitized.dateOfBirth);
  } else if (data.age !== undefined) {
    sanitized.age = Math.round(data.age);
  }

  if (data.profileImage !== undefined) {
    sanitized.profileImage = data.profileImage.trim();
  }

  if (data.id !== undefined) {
    sanitized.id = data.id.trim();
  }

  return sanitized;
}

/**
 * Compare two patient data objects and return differences
 */
export function comparePatientData(
  current: PatientSyncData, 
  updated: PatientSyncData
): {
  hasChanges: boolean;
  changes: string[];
  sensitiveChanges: string[];
} {
  const changes: string[] = [];
  const sensitiveChanges: string[] = [];

  const fieldsToCheck = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'age'] as const;

  fieldsToCheck.forEach(field => {
    if (updated[field] !== undefined && current[field] !== updated[field]) {
      changes.push(field);
      
      // Mark sensitive fields
      if (['email', 'dateOfBirth'].includes(field)) {
        sensitiveChanges.push(field);
      }
    }
  });

  return {
    hasChanges: changes.length > 0,
    changes,
    sensitiveChanges
  };
}

/**
 * Validate sync operation integrity
 */
export function validateSyncIntegrity(
  originalData: PatientSyncData,
  syncedData: PatientSyncData
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for critical field consistency
  if (originalData.id && syncedData.id && originalData.id !== syncedData.id) {
    errors.push('Patient ID mismatch during sync');
  }

  // Check age and date of birth consistency
  if (syncedData.dateOfBirth && syncedData.age) {
    const calculatedAge = calculateAge(syncedData.dateOfBirth);
    if (Math.abs(syncedData.age - calculatedAge) > 1) {
      errors.push('Age and date of birth are inconsistent');
    }
  }

  // Check for suspicious data loss
  const criticalFields = ['firstName', 'lastName', 'email'] as const;
  criticalFields.forEach(field => {
    if (originalData[field] && !syncedData[field]) {
      warnings.push(`Critical field '${field}' was lost during sync`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Create a sync checksum for data integrity verification
 */
export function createSyncChecksum(data: PatientSyncData): string {
  const relevantFields = [
    data.id,
    data.firstName,
    data.lastName,
    data.email,
    data.dateOfBirth,
    data.age?.toString()
  ].filter(Boolean).join('|');

  // Simple hash function for checksum
  let hash = 0;
  for (let i = 0; i < relevantFields.length; i++) {
    const char = relevantFields.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Verify sync checksum
 */
export function verifySyncChecksum(
  data: PatientSyncData, 
  expectedChecksum: string
): boolean {
  const actualChecksum = createSyncChecksum(data);
  return actualChecksum === expectedChecksum;
}