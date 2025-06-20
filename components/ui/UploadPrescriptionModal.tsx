import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
  Switch
} from 'react-native';
import {
  X,
  Camera,
  Image as ImageIcon,
  FileText,
  Upload,
  Scan,
  CheckCircle2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Zap,
  ZapOff,
  Edit3,
  Trash2,
  Plus,
  Check
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { UploadResult, DetectedMedicine, AnalysisResult, ImageQuality } from '@/types/medical';

interface UploadPrescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadComplete: (result: UploadResult) => void;
  prescriptionId: string;
  existingMedicines?: { name: string; dosage: string; frequency: string; duration: string; instructions?: string; }[];
}

type UploadStep = 'select' | 'capture' | 'preview' | 'analyze' | 'review' | 'complete';

const { width, height } = Dimensions.get('window');

export default function UploadPrescriptionModal({
  visible,
  onClose,
  onUploadComplete,
  prescriptionId,
  existingMedicines
}: UploadPrescriptionModalProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [uploadType, setUploadType] = useState<'photo' | 'gallery' | 'pdf' | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedMedicines, setDetectedMedicines] = useState<DetectedMedicine[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Gallery permissions
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setCurrentStep('select');
      setUploadType(null);
      setCapturedImage(null);
      setIsProcessing(false);
      setDetectedMedicines([]);
      setAnalysisResult(null);
    }
  }, [visible]);

  // Request permissions
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryPermission.status === 'granted');
    } catch (error) {
      console.error('Permission request failed:', error);
      Alert.alert('Permission Error', 'Failed to request permissions.');
    }
  };

  const handleUploadTypeSelect = async (type: 'photo' | 'gallery' | 'pdf') => {
    setUploadType(type);

    switch (type) {
      case 'photo':
        setCurrentStep('capture');
        break;
      case 'gallery':
        await handleGalleryPick();
        break;
      case 'pdf':
        await handlePDFPick();
        break;
    }
  };

  const handleGalleryPick = async () => {
    try {
      if (hasGalleryPermission === false) {
        Alert.alert('Gallery Permission', 'Gallery access is required to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setCurrentStep('preview');
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
      Alert.alert('Error', 'Failed to access gallery. Please try again.');
    }
  };

  const handlePDFPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setCurrentStep('analyze');
        await startAnalysis(result.assets[0].uri, 'pdf');
      }
    } catch (error) {
      console.error('PDF picker error:', error);
      Alert.alert('Error', 'Failed to select PDF. Please try again.');
    }
  };

  const handleImageCaptured = (imageUri: string) => {
    setCapturedImage(imageUri);
    setCurrentStep('preview');
  };

  const handlePreviewConfirm = async () => {
    if (!capturedImage) return;

    setCurrentStep('analyze');
    await startAnalysis(capturedImage, uploadType || 'photo');
  };

  const startAnalysis = async (imageUri: string, type: 'photo' | 'gallery' | 'pdf') => {
    setIsProcessing(true);

    try {
      // Simulate AI analysis - replace with actual API call
      const analysis = await performPrescriptionAnalysis(imageUri, type);
      setAnalysisResult(analysis);
      setDetectedMedicines(analysis.detectedMedicines);
      setCurrentStep('review');
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'Failed to analyze prescription. Please try again.');
      setCurrentStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock AI analysis function - replace with actual implementation
  const performPrescriptionAnalysis = async (
    imageUri: string,
    type: 'photo' | 'gallery' | 'pdf'
  ): Promise<AnalysisResult> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock detected medicines - replace with actual AI/OCR service
    const mockMedicines: DetectedMedicine[] = [
      {
        id: `medicine_${Date.now()}_1`,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        confidence: 0.95,
        detected: true,
        source: 'detected',
        createdAt: new Date().toISOString(),
        boundingBox: { x: 100, y: 200, width: 200, height: 50 }
      },
      {
        id: `medicine_${Date.now()}_2`,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        confidence: 0.89,
        detected: true,
        source: 'detected',
        createdAt: new Date().toISOString(),
        boundingBox: { x: 100, y: 280, width: 220, height: 50 }
      }
    ];

    const imageQuality: ImageQuality = {
      clarity: 0.88,
      lighting: 0.85,
      angle: 0.92,
      overall: 0.88,
      issues: []
    };

    return {
      detectedMedicines: mockMedicines,
      confidence: 0.92,
      processingTime: 3.2,
      imageQuality,
      ocrConfidence: 0.90
    };
  };

  const handleMedicineEdit = (index: number, field: keyof DetectedMedicine, value: any) => {
    const updatedMedicines = [...detectedMedicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value,
      updatedAt: new Date().toISOString()
    };
    setDetectedMedicines(updatedMedicines);
  };

  const handleRemoveMedicine = (index: number) => {
    Alert.alert(
      'Remove Medicine',
      'Are you sure you want to remove this detected medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedMedicines = detectedMedicines.filter((_, i) => i !== index);
            setDetectedMedicines(updatedMedicines);
          }
        }
      ]
    );
  };

  const handleAddMedicine = () => {
    const newMedicine: DetectedMedicine = {
      id: `medicine_${Date.now()}_manual`,
      name: '',
      dosage: '',
      frequency: '',
      confidence: 1.0,
      detected: false,
      source: 'manual',
      createdAt: new Date().toISOString()
    };
    setDetectedMedicines([...detectedMedicines, newMedicine]);
  };

  const handleReviewConfirm = async () => {
    if (!capturedImage || !analysisResult) return;

    try {
      // Get file info and handle size properly
      const fileInfo = await FileSystem.getInfoAsync(capturedImage);
      const fileName = `prescription_${Date.now()}.${uploadType === 'pdf' ? 'pdf' : 'jpg'}`;

      // Handle file size - check if file exists and has size
      let fileSize = 0;
      if (fileInfo.exists && 'size' in fileInfo) {
        fileSize = fileInfo.size;
      }

      const uploadResult: UploadResult = {
        type: uploadType!,
        uri: capturedImage,
        fileName,
        detectedMedicines,
        confidence: analysisResult.confidence,
        processingTime: analysisResult.processingTime,
        uploadedPrescription: {
          id: `upload_${Date.now()}`,
          type: uploadType!,
          timestamp: new Date().toISOString(),
          fileName,
          fileSize,
          uri: capturedImage,
          uploadStatus: 'completed',
          analysisResult
        },
        analysisResult
      };

      setCurrentStep('complete');
      setTimeout(() => {
        onUploadComplete(uploadResult);
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Upload completion error:', error);
      Alert.alert('Error', 'Failed to complete upload. Please try again.');
    }
  };

  const handleClose = () => {
    setCurrentStep('select');
    setUploadType(null);
    setCapturedImage(null);
    setIsProcessing(false);
    setDetectedMedicines([]);
    setAnalysisResult(null);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return <SelectUploadType onSelect={handleUploadTypeSelect} />;
      case 'capture':
        return (
          <CameraCapture
            onImageCaptured={handleImageCaptured}
            onBack={() => setCurrentStep('select')}
          />
        );
      case 'preview':
        return (
          <ImagePreview
            imageUri={capturedImage!}
            onConfirm={handlePreviewConfirm}
            onBack={() => setCurrentStep('select')}
            onRetake={() => uploadType === 'photo' ? setCurrentStep('capture') : handleGalleryPick()}
          />
        );
      case 'analyze':
        return (
          <PrescriptionAnalysis
            isProcessing={isProcessing}
            progress={isProcessing ? undefined : 100}
          />
        );
      case 'review':
        return (
          <ReviewDetectedMedicines
            medicines={detectedMedicines}
            onMedicineEdit={handleMedicineEdit}
            onRemoveMedicine={handleRemoveMedicine}
            onAddMedicine={handleAddMedicine}
            onConfirm={handleReviewConfirm}
            onBack={() => setCurrentStep('preview')}
            analysisResult={analysisResult}
          />
        );
      case 'complete':
        return <UploadComplete />;
      default:
        return <SelectUploadType onSelect={handleUploadTypeSelect} />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentStep) {
      case 'select': return 'Upload Prescription';
      case 'capture': return 'Take Photo';
      case 'preview': return 'Review Image';
      case 'analyze': return 'Analyzing Prescription...';
      case 'review': return 'Review Detected Medicines';
      case 'complete': return 'Upload Complete';
      default: return 'Upload Prescription';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          {currentStep !== 'analyze' && currentStep !== 'complete' && (
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ProgressIndicator currentStep={currentStep} />
        </View>

        {/* Step Content */}
        <View style={styles.content}>
          {renderStepContent()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// Step 1: Select Upload Type
const SelectUploadType = ({ onSelect }: { onSelect: (type: 'photo' | 'gallery' | 'pdf') => void }) => (
  <View style={styles.selectContainer}>
    <Text style={styles.selectTitle}>How would you like to upload your prescription?</Text>
    <Text style={styles.selectSubtitle}>Choose the best option for your prescription document</Text>

    <TouchableOpacity style={styles.optionCard} onPress={() => onSelect('photo')}>
      <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + '20' }]}>
        <Camera size={32} color={COLORS.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>Take Photo</Text>
        <Text style={styles.optionDescription}>Use your camera to capture the prescription</Text>
      </View>
      <Text style={styles.recommendedBadge}>Recommended</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.optionCard} onPress={() => onSelect('gallery')}>
      <View style={[styles.optionIcon, { backgroundColor: COLORS.secondary + '20' }]}>
        <ImageIcon size={32} color={COLORS.secondary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>Choose from Gallery</Text>
        <Text style={styles.optionDescription}>Select an existing photo from your gallery</Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity style={styles.optionCard} onPress={() => onSelect('pdf')}>
      <View style={[styles.optionIcon, { backgroundColor: COLORS.warning + '20' }]}>
        <FileText size={32} color={COLORS.warning} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>Upload PDF</Text>
        <Text style={styles.optionDescription}>Select a PDF document of your prescription</Text>
      </View>
    </TouchableOpacity>
  </View>
);

// Real Camera Component - Error Free Version
const CameraCapture = ({ onImageCaptured, onBack }: {
  onImageCaptured: (uri: string) => void;
  onBack: () => void;
}) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  // Request permission if not granted
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
        });
        if (photo) {
          onImageCaptured(photo.uri);
        }
      } catch (error) {
        console.error('Failed to take picture:', error);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      }
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  // Check if permission is still loading
  if (!permission) {
    return (
      <View style={styles.cameraContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  // Check if permission is denied
  if (!permission.granted) {
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissionBackButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flashMode}
      />

      {/* Camera Controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.controlButton} onPress={onBack}>
          <X size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
          {flashMode === 'off' ? (
            <ZapOff size={24} color={COLORS.white} />
          ) : (
            <Zap size={24} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Capture Button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      {/* Guidelines */}
      <View style={styles.guidelines}>
        <View style={styles.guidelineCorner} />
        <View style={[styles.guidelineCorner, styles.topRight]} />
        <View style={[styles.guidelineCorner, styles.bottomLeft]} />
        <View style={[styles.guidelineCorner, styles.bottomRight]} />
      </View>
    </View>
  );
};

// Real Image Preview Component
const ImagePreview = ({
  imageUri,
  onConfirm,
  onBack,
  onRetake
}: {
  imageUri: string;
  onConfirm: () => void;
  onBack: () => void;
  onRetake: () => void;
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedUri, setEnhancedUri] = useState<string | null>(null);

  const enhanceImage = async () => {
    setIsEnhancing(true);
    try {
      // Apply image enhancements
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024 } }, // Resize for processing
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      setEnhancedUri(manipulatedImage.uri);
    } catch (error) {
      console.error('Image enhancement failed:', error);
      Alert.alert('Enhancement Failed', 'Could not enhance image, using original.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const displayUri = enhancedUri || imageUri;

  return (
    <View style={styles.previewContainer}>
      <ScrollView style={styles.previewScroll} maximumZoomScale={3} minimumZoomScale={1}>
        <Image source={{ uri: displayUri }} style={styles.previewImage} resizeMode="contain" />
      </ScrollView>

      <View style={styles.previewControls}>
        <TouchableOpacity style={styles.previewButton} onPress={onRetake}>
          <RotateCcw size={20} color={COLORS.primary} />
          <Text style={styles.previewButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.previewButton}
          onPress={enhanceImage}
          disabled={isEnhancing}
        >
          {isEnhancing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <ZoomIn size={20} color={COLORS.primary} />
          )}
          <Text style={styles.previewButtonText}>Enhance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <CheckCircle2 size={20} color={COLORS.white} />
          <Text style={styles.confirmButtonText}>Use This Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Real Analysis Component
const PrescriptionAnalysis = ({
  isProcessing,
  progress
}: {
  isProcessing: boolean;
  progress?: number;
}) => (
  <View style={styles.analysisContainer}>
    <View style={styles.analysisIcon}>
      {isProcessing ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <CheckCircle2 size={64} color={COLORS.success} />
      )}
    </View>

    <Text style={styles.analysisTitle}>
      {isProcessing ? 'Analyzing Prescription...' : 'Analysis Complete'}
    </Text>

    <Text style={styles.analysisText}>
      {isProcessing
        ? 'Our AI is reading your prescription and identifying medicines. This may take a few moments.'
        : 'Prescription analysis completed successfully!'
      }
    </Text>

    {isProcessing && (
      <View style={styles.analysisSteps}>
        <Text style={styles.stepText}>✓ Processing image...</Text>
        <Text style={styles.stepText}>⏳ Extracting text...</Text>
        <Text style={styles.stepText}>⏳ Identifying medicines...</Text>
        <Text style={styles.stepText}>⏳ Validating results...</Text>
      </View>
    )}
  </View>
);

// Enhanced Review Component
const ReviewDetectedMedicines = ({
  medicines,
  onMedicineEdit,
  onRemoveMedicine,
  onAddMedicine,
  onConfirm,
  onBack,
  analysisResult
}: {
  medicines: DetectedMedicine[];
  onMedicineEdit: (index: number, field: keyof DetectedMedicine, value: any) => void;
  onRemoveMedicine: (index: number) => void;
  onAddMedicine: () => void;
  onConfirm: () => void;
  onBack: () => void;
  analysisResult: AnalysisResult | null;
}) => (
  <ScrollView style={styles.reviewContainer}>
    <View style={styles.reviewHeader}>
      <Text style={styles.reviewTitle}>
        Found {medicines.length} medicine{medicines.length !== 1 ? 's' : ''}
      </Text>
      {analysisResult && (
        <Text style={styles.reviewConfidence}>
          Confidence: {Math.round(analysisResult.confidence * 100)}%
        </Text>
      )}
    </View>

    {medicines.map((medicine, index) => (
      <MedicineEditCard
        key={medicine.id || index}
        medicine={medicine}
        index={index}
        onEdit={onMedicineEdit}
        onRemove={onRemoveMedicine}
      />
    ))}

    <TouchableOpacity style={styles.addMedicineButton} onPress={onAddMedicine}>
      <Plus size={20} color={COLORS.primary} />
      <Text style={styles.addMedicineText}>Add Medicine Manually</Text>
    </TouchableOpacity>

    <View style={styles.reviewActions}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={onConfirm}>
        <Check size={20} color={COLORS.white} />
        <Text style={styles.saveButtonText}>Save Prescription</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

// Medicine Edit Card Component
const MedicineEditCard = ({
  medicine,
  index,
  onEdit,
  onRemove
}: {
  medicine: DetectedMedicine;
  index: number;
  onEdit: (index: number, field: keyof DetectedMedicine, value: any) => void;
  onRemove: (index: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{medicine.name || 'Medicine Name'}</Text>
          {medicine.confidence && (
            <Text style={styles.medicineConfidence}>
              {Math.round(medicine.confidence * 100)}% confidence
            </Text>
          )}
        </View>

        <View style={styles.medicineActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={16} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onRemove(index)}
          >
            <Trash2 size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editForm}>
          <TextInput
            style={styles.editInput}
            value={medicine.name}
            onChangeText={(text) => onEdit(index, 'name', text)}
            placeholder="Medicine Name"
            placeholderTextColor={COLORS.textSecondary}
          />

          <TextInput
            style={styles.editInput}
            value={medicine.dosage}
            onChangeText={(text) => onEdit(index, 'dosage', text)}
            placeholder="Dosage (e.g., 10mg)"
            placeholderTextColor={COLORS.textSecondary}
          />

          <TextInput
            style={styles.editInput}
            value={medicine.frequency}
            onChangeText={(text) => onEdit(index, 'frequency', text)}
            placeholder="Frequency (e.g., Once daily)"
            placeholderTextColor={COLORS.textSecondary}
          />

          <TextInput
            style={[styles.editInput, styles.notesInput]}
            value={medicine.notes || ''}
            onChangeText={(text) => onEdit(index, 'notes', text)}
            placeholder="Additional notes (optional)"
            placeholderTextColor={COLORS.textSecondary}
            multiline
          />

          <View style={styles.verificationRow}>
            <Text style={styles.verificationLabel}>Verified:</Text>
            <Switch
              value={medicine.isVerified || false}
              onValueChange={(value) => onEdit(index, 'isVerified', value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>
      ) : (
        <View style={styles.medicineDetails}>
          <Text style={styles.medicineDetail}>
            <Text style={styles.detailLabel}>Dosage: </Text>
            {medicine.dosage}
          </Text>
          <Text style={styles.medicineDetail}>
            <Text style={styles.detailLabel}>Frequency: </Text>
            {medicine.frequency}
          </Text>
          {medicine.notes && (
            <Text style={styles.medicineDetail}>
              <Text style={styles.detailLabel}>Notes: </Text>
              {medicine.notes}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

// Progress Indicator Component
const ProgressIndicator = ({ currentStep }: { currentStep: UploadStep }) => {
  const steps = ['select', 'capture', 'preview', 'analyze', 'review', 'complete'];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <View style={styles.progressBar}>
      {steps.map((step, index) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            index <= currentIndex ? styles.progressDotActive : styles.progressDotInactive
          ]}
        />
      ))}
    </View>
  );
};

const UploadComplete = () => (
  <View style={styles.completeContainer}>
    <CheckCircle2 size={80} color={COLORS.success} />
    <Text style={styles.completeTitle}>Upload Successful!</Text>
    <Text style={styles.completeText}>Your prescription has been analyzed and saved.</Text>
  </View>
);

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
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  progressDotInactive: {
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  selectContainer: {
    flex: 1,
  },
  selectTitle: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  selectSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
    position: 'relative',
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.success,
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    ...SHADOWS.small,
  },
  tipsTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  tipText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  // Camera Styles
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
  },
  permissionText: {
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionBackButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  guidelines: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '20%',
  },
  guidelineCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.white,
    borderWidth: 2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    right: 0,
    left: 'auto',
  },
  bottomLeft: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    bottom: 0,
    top: 'auto',
    left: 0,
  },
  bottomRight: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
  },
  // Preview Styles
  previewContainer: {
    flex: 1,
  },
  previewScroll: {
    flex: 1,
  },
  previewImage: {
    width: width - 32,
    height: height * 0.6,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  previewButton: {
    alignItems: 'center',
    padding: 12,
  },
  previewButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginTop: 4,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  // Analysis Styles
  analysisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analysisIcon: {
    marginBottom: 24,
  },
  analysisTitle: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  analysisText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  analysisSteps: {
    alignItems: 'flex-start',
  },
  stepText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  // Review Styles
  reviewContainer: {
    flex: 1,
  },
  reviewHeader: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  reviewTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  reviewConfidence: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
  },
  medicineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  medicineConfidence: {
    fontSize: SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  medicineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editForm: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verificationLabel: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  medicineDetails: {
    gap: 8,
  },
  medicineDetail: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  detailLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  addMedicineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  addMedicineText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  // backButtonText: {
  //   fontSize: SIZES.md,
  //   color: COLORS.textPrimary,
  //   fontWeight: '600',
  // },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.success,
    marginTop: 24,
    marginBottom: 12,
  },
  completeText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});