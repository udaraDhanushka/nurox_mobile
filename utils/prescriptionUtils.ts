import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Types
export interface DetectedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  confidence: number;
  detected: boolean;
  isVerified?: boolean;
  notes?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  lastModified?: number;
}

export interface ProcessingOptions {
  enhanceImage?: boolean;
  cropToContent?: boolean;
  adjustBrightness?: number;
  adjustContrast?: number;
  rotation?: number;
}

export interface AnalysisResult {
  detectedMedicines: DetectedMedicine[];
  confidence: number;
  processingTime: number;
  imageQuality: {
    clarity: number;
    lighting: number;
    angle: number;
    overall: number;
  };
  error?: string;
}

// Image Processing Utilities
export class ImageProcessor {
  static async enhanceImage(
    imageUri: string, 
    options: ProcessingOptions = {}
  ): Promise<string> {
    try {
      const manipulateOptions: ImageManipulator.Action[] = [];

      // Apply rotation if specified
      if (options.rotation && options.rotation !== 0) {
        manipulateOptions.push({
          rotate: options.rotation,
        });
      }

      // Apply cropping if specified
      if (options.cropToContent) {
        // This would typically involve edge detection
        // For now, we'll use a default crop
        manipulateOptions.push({
          crop: {
            originX: 50,
            originY: 100,
            width: 300,
            height: 400,
          },
        });
      }

      // Apply brightness and contrast adjustments
      if (options.adjustBrightness || options.adjustContrast) {
        // Note: expo-image-manipulator doesn't have brightness/contrast
        // In a real app, you'd use a more advanced image processing library
        console.log('Brightness/Contrast adjustments would be applied here');
      }

      if (manipulateOptions.length === 0) {
        return imageUri; // No processing needed
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        manipulateOptions,
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Image enhancement failed:', error);
      throw new Error('Failed to enhance image');
    }
  }

  static async getImageQuality(imageUri: string): Promise<AnalysisResult['imageQuality']> {
    // In a real implementation, this would use computer vision to analyze:
    // - Clarity: Check for blur, focus quality
    // - Lighting: Analyze brightness distribution, shadows
    // - Angle: Detect document orientation, perspective distortion
    
    // For demo purposes, return mock quality scores
    const mockScores = {
      clarity: 0.75 + Math.random() * 0.2,
      lighting: 0.8 + Math.random() * 0.15,
      angle: 0.7 + Math.random() * 0.25,
      overall: 0
    };

    mockScores.overall = (mockScores.clarity + mockScores.lighting + mockScores.angle) / 3;
    
    return mockScores;
  }

  static async compressImage(imageUri: string, quality: number = 0.8): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error('Failed to compress image');
    }
  }
}

// File Handling Utilities
export class FileHandler {
  static async pickImageFromGallery(): Promise<UploadedFile | null> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photo library to select images.'
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      return {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        size: fileInfo.exists ? (fileInfo.size || 0) : 0,
      };
    } catch (error) {
      console.error('Gallery picker failed:', error);
      throw new Error('Failed to pick image from gallery');
    }
  }

  static async pickDocument(): Promise<UploadedFile | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      
      return {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/pdf',
        size: asset.size || 0,
      };
    } catch (error) {
      console.error('Document picker failed:', error);
      throw new Error('Failed to pick document');
    }
  }

  static async getFileInfo(uri: string): Promise<{
    size: number;
    exists: boolean;
    isDirectory: boolean;
    modificationTime?: number;
  }> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      
      // FileInfo properties are only available when file exists
      if (info.exists) {
        return {
          size: info.size || 0,
          exists: info.exists,
          isDirectory: info.isDirectory || false,
          modificationTime: info.modificationTime,
        };
      } else {
        return {
          size: 0,
          exists: false,
          isDirectory: false,
        };
      }
    } catch (error) {
      console.error('Failed to get file info:', error);
      return {
        size: 0,
        exists: false,
        isDirectory: false,
      };
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// OCR and Medicine Detection Utilities
export class MedicineDetector {
  static async analyzePrescription(
    imageUri: string,
    options: { timeout?: number } = {}
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Simulate API call to OCR/ML service
      await this.simulateProcessing(options.timeout || 5000);
      
      const mockResult: AnalysisResult = {
        detectedMedicines: await this.generateMockMedicines(),
        confidence: 0.85 + Math.random() * 0.1,
        processingTime: (Date.now() - startTime) / 1000,
        imageQuality: await ImageProcessor.getImageQuality(imageUri),
      };

      return mockResult;
    } catch (error) {
      return {
        detectedMedicines: [],
        confidence: 0,
        processingTime: (Date.now() - startTime) / 1000,
        imageQuality: {
          clarity: 0,
          lighting: 0,
          angle: 0,
          overall: 0,
        },
        error: error instanceof Error ? error.message : 'Analysis failed',
      };
    }
  }

  private static async simulateProcessing(duration: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  private static async generateMockMedicines(): Promise<DetectedMedicine[]> {
    const medicineDatabase = [
      { name: 'Lisinopril', dosages: ['5mg', '10mg', '20mg'], frequencies: ['Once daily', 'Twice daily'] },
      { name: 'Metformin', dosages: ['500mg', '850mg', '1000mg'], frequencies: ['Once daily', 'Twice daily', 'Three times daily'] },
      { name: 'Aspirin', dosages: ['81mg', '325mg'], frequencies: ['Once daily', 'As needed'] },
      { name: 'Atorvastatin', dosages: ['10mg', '20mg', '40mg'], frequencies: ['Once daily at bedtime'] },
      { name: 'Amlodipine', dosages: ['2.5mg', '5mg', '10mg'], frequencies: ['Once daily'] },
      { name: 'Omeprazole', dosages: ['20mg', '40mg'], frequencies: ['Once daily', 'Twice daily'] },
      { name: 'Simvastatin', dosages: ['10mg', '20mg', '40mg'], frequencies: ['Once daily at bedtime'] },
      { name: 'Losartan', dosages: ['25mg', '50mg', '100mg'], frequencies: ['Once daily', 'Twice daily'] },
    ];

    const numMedicines = Math.floor(Math.random() * 4) + 2; // 2-5 medicines
    const selectedMedicines = medicineDatabase
      .sort(() => 0.5 - Math.random())
      .slice(0, numMedicines);

    return selectedMedicines.map((med, index) => ({
      name: med.name,
      dosage: med.dosages[Math.floor(Math.random() * med.dosages.length)],
      frequency: med.frequencies[Math.floor(Math.random() * med.frequencies.length)],
      confidence: 0.7 + Math.random() * 0.25,
      detected: true,
      boundingBox: {
        x: 50 + Math.random() * 100,
        y: 100 + index * 50,
        width: 200 + Math.random() * 100,
        height: 30 + Math.random() * 20,
      },
    }));
  }

  static validateMedicine(medicine: Partial<DetectedMedicine>): string[] {
    const errors: string[] = [];

    if (!medicine.name?.trim()) {
      errors.push('Medicine name is required');
    }

    if (!medicine.dosage?.trim()) {
      errors.push('Dosage is required');
    }

    if (!medicine.frequency?.trim()) {
      errors.push('Frequency is required');
    }

    // Validate dosage format (basic check)
    if (medicine.dosage && !/^\d+(\.\d+)?\s*(mg|g|ml|mcg|IU|units?)$/i.test(medicine.dosage)) {
      errors.push('Dosage format appears invalid (e.g., "10mg", "2.5g")');
    }

    return errors;
  }

  static normalizeMedicineName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Validation Utilities
export class ValidationUtils {
  static isValidImageFile(file: UploadedFile): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return (
      validTypes.includes(file.type.toLowerCase()) &&
      file.size <= maxSize &&
      file.size > 0
    );
  }

  static isValidPDFFile(file: UploadedFile): boolean {
    const maxSize = 25 * 1024 * 1024; // 25MB

    return (
      file.type.toLowerCase() === 'application/pdf' &&
      file.size <= maxSize &&
      file.size > 0
    );
  }

  static validateUploadedFile(file: UploadedFile): string[] {
    const errors: string[] = [];

    if (!file.uri) {
      errors.push('File URI is required');
    }

    if (!file.name) {
      errors.push('File name is required');
    }

    if (file.size === 0) {
      errors.push('File appears to be empty');
    }

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      errors.push('Only image files (JPEG, PNG, HEIC) and PDF files are supported');
    }

    if (isImage && !this.isValidImageFile(file)) {
      errors.push('Invalid image file or file too large (max 10MB)');
    }

    if (isPDF && !this.isValidPDFFile(file)) {
      errors.push('Invalid PDF file or file too large (max 25MB)');
    }

    return errors;
  }
}

// Storage Utilities
export class StorageUtils {
  static async saveUploadHistory(upload: {
    prescriptionId: string;
    fileName: string;
    fileUri: string;
    uploadTime: string;
    detectedMedicines: DetectedMedicine[];
  }): Promise<void> {
    try {
      const historyKey = `upload_history_${upload.prescriptionId}`;
      const existingHistory = await this.getUploadHistory(upload.prescriptionId);
      
      const updatedHistory = [
        ...existingHistory,
        {
          id: `upload_${Date.now()}`,
          ...upload,
        },
      ];

      // In a real app, you'd use AsyncStorage or another persistence solution
      console.log('Saving upload history:', updatedHistory);
    } catch (error) {
      console.error('Failed to save upload history:', error);
    }
  }

  static async getUploadHistory(prescriptionId: string): Promise<any[]> {
    try {
      // In a real app, retrieve from AsyncStorage
      return [];
    } catch (error) {
      console.error('Failed to get upload history:', error);
      return [];
    }
  }

  static async clearUploadHistory(prescriptionId: string): Promise<void> {
    try {
      // In a real app, clear from AsyncStorage
      console.log('Clearing upload history for prescription:', prescriptionId);
    } catch (error) {
      console.error('Failed to clear upload history:', error);
    }
  }
}

// Analytics and Logging
export class AnalyticsLogger {
  static logUploadStart(uploadType: 'photo' | 'gallery' | 'pdf'): void {
    console.log('Upload started:', {
      type: uploadType,
      timestamp: new Date().toISOString(),
    });
  }

  static logUploadComplete(result: {
    type: string;
    processingTime: number;
    medicinesDetected: number;
    confidence: number;
  }): void {
    console.log('Upload completed:', {
      ...result,
      timestamp: new Date().toISOString(),
    });
  }

  static logUploadError(error: string, context: any): void {
    console.error('Upload error:', {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  static logMedicineVerification(medicine: DetectedMedicine, verified: boolean): void {
    console.log('Medicine verification:', {
      medicineName: medicine.name,
      confidence: medicine.confidence,
      verified,
      timestamp: new Date().toISOString(),
    });
  }
}

// Error Handling
export class ErrorHandler {
  static handleUploadError(error: unknown): string {
    if (error instanceof Error) {
      switch (error.message) {
        case 'PERMISSION_DENIED':
          return 'Camera or storage permission is required to upload prescriptions.';
        case 'FILE_TOO_LARGE':
          return 'The selected file is too large. Please choose a smaller file.';
        case 'INVALID_FILE_TYPE':
          return 'Please select a valid image file (JPEG, PNG) or PDF document.';
        case 'NETWORK_ERROR':
          return 'Network connection error. Please check your internet connection and try again.';
        case 'PROCESSING_FAILED':
          return 'Failed to process the prescription image. Please try with a clearer image.';
        default:
          return error.message;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  static showErrorAlert(error: unknown, title: string = 'Error'): void {
    const message = this.handleUploadError(error);
    Alert.alert(title, message);
  }
}