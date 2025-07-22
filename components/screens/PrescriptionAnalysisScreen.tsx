import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Brain,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileText,
  Zap,
  Target,
  Pill,
  Clock,
  AlertCircle
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import OCRService from '@/services/OCRService';

interface PrescriptionAnalysisScreenProps {
  imageUri: string;
  uploadType: 'photo' | 'gallery' | 'pdf';
  onComplete: (detectedMedicines: DetectedMedicine[]) => void;
}

// Updated to match OCR Service interface
interface DetectedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  confidence: number;
  detected: boolean;
  source: 'detected' | 'manual';
  boundingBox?: BoundingBox;
  createdAt: string;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
}

interface AnalysisResult {
  detectedMedicines: DetectedMedicine[];
  ocrText: string;
  confidence: number;
  processingTime: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Configuration flag to enable testing mode with mock data
const TESTING_MODE = false; // Set to true to test data flow with mock medicines

export default function PrescriptionAnalysisScreen({
  imageUri,
  uploadType,
  onComplete
}: PrescriptionAnalysisScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [detectedMedicines, setDetectedMedicines] = useState<DetectedMedicine[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    {
      id: 'preprocess',
      label: 'Image Preprocessing',
      description: 'Preparing image for text recognition',
      icon: <Eye size={20} color={COLORS.primary} />,
      status: 'pending'
    },
    {
      id: 'ocr',
      label: 'Text Recognition',
      description: 'Extracting text using ML Kit OCR',
      icon: <Scan size={20} color={COLORS.primary} />,
      status: 'pending'
    },
    {
      id: 'analysis',
      label: 'Medicine Detection',
      description: 'Analyzing text for medicine information',
      icon: <Brain size={20} color={COLORS.primary} />,
      status: 'pending'
    },
    {
      id: 'validation',
      label: 'Results Validation',
      description: 'Verifying detected medicines and confidence',
      icon: <Target size={20} color={COLORS.primary} />,
      status: 'pending'
    },
    {
      id: 'complete',
      label: 'Analysis Complete',
      description: 'Processing finished successfully',
      icon: <CheckCircle2 size={20} color={COLORS.success} />,
      status: 'pending'
    }
  ]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnalysis();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const updateStepStatus = (stepId: string, status: AnalysisStep['status']) => {
    setAnalysisSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const updateProgress = (newProgress: number) => {
    setProgress(newProgress);
    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Generate mock medicines for testing data flow
  const generateMockMedicines = (): DetectedMedicine[] => {
    const medicines = [
      { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
      { name: 'Vitamin D', dosage: '1000 IU', frequency: 'Daily' },
      { name: 'Omega-3', dosage: '1000mg', frequency: 'Twice daily' },
      { name: 'Calcium', dosage: '500mg', frequency: 'With meals' },
      { name: 'Ibuprofen', dosage: '200mg', frequency: 'As needed' },
      { name: 'Acetaminophen', dosage: '500mg', frequency: 'Every 6 hours' },
    ];
    
    // Generate random subset to test different results each time
    const randomCount = Math.floor(Math.random() * 3) + 1;
    const randomMedicines = medicines
      .sort(() => 0.5 - Math.random())
      .slice(0, randomCount)
      .map((med, index) => ({
        id: `test_${Date.now()}_${index}`,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        detected: true,
        source: 'detected' as const,
        createdAt: new Date().toISOString()
      }));
      
    console.log('🧪 Generated mock medicines for testing:', randomMedicines);
    return randomMedicines;
  };

  const startAnalysis = async () => {
    try {
      console.log('🚀 Starting prescription analysis...');
      console.log('📸 Image URI:', imageUri);
      console.log('📁 Upload type:', uploadType);
      console.log('🧪 Testing mode:', TESTING_MODE ? 'ENABLED' : 'DISABLED');

      // Step 1: Preprocessing (UI preparation)
      setCurrentStepIndex(0);
      updateStepStatus('preprocess', 'processing');
      updateProgress(10);
      
      console.log('📝 Step 1: Preprocessing...');
      // Small delay to show preprocessing step
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStepStatus('preprocess', 'completed');
      updateProgress(20);

      // Step 2: OCR Text Recognition
      setCurrentStepIndex(1);
      updateStepStatus('ocr', 'processing');
      updateProgress(30);

      console.log('📝 Step 2: Starting OCR processing...');
      
      let result: AnalysisResult;
      
      if (TESTING_MODE) {
        // Testing mode - use mock data to verify data flow
        console.log('🧪 TESTING MODE: Using mock data instead of actual OCR');
        const mockMedicines = generateMockMedicines();
        result = {
          detectedMedicines: mockMedicines,
          ocrText: 'Mock OCR text for testing purposes',
          confidence: mockMedicines.reduce((sum, med) => sum + med.confidence, 0) / mockMedicines.length,
          processingTime: 2.5
        };
        console.log('🧪 Mock result generated:', result);
      } else {
        // Production mode - use actual OCR
        console.log('🔍 PRODUCTION MODE: Using actual OCR service');
        console.log('🔍 About to process image with OCR:', imageUri);
        
        // Optional: Test basic OCR first
        // await OCRService.testOCRBasic(imageUri);
        
        // Actual OCR processing
        result = await OCRService.processPrescriptionImage(imageUri);
        console.log('📊 OCR Service returned result:', result);
        console.log('💊 Detected medicines from OCR:', result.detectedMedicines);
        console.log('📊 Number of medicines detected:', result.detectedMedicines.length);
      }
      
      // IMPORTANT: Always set the actual result, even if empty
      setDetectedMedicines(result.detectedMedicines);
      setAnalysisResult(result);
      
      updateStepStatus('ocr', 'completed');
      updateProgress(60);

      // Step 3: Medicine Analysis (already done in OCR service)
      setCurrentStepIndex(2);
      updateStepStatus('analysis', 'processing');
      updateProgress(70);

      console.log('📝 Step 3: Medicine analysis...');
      // Small delay to show analysis step
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus('analysis', 'completed');
      updateProgress(85);

      // Step 4: Validation
      setCurrentStepIndex(3);
      updateStepStatus('validation', 'processing');
      
      console.log('📝 Step 4: Validation...');
      // Small delay for validation step
      await new Promise(resolve => setTimeout(resolve, 400));
      updateStepStatus('validation', 'completed');
      updateProgress(95);

      // Step 5: Complete
      setCurrentStepIndex(4);
      updateStepStatus('complete', 'processing');
      updateProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus('complete', 'completed');

      // Complete analysis with a small delay to show completion
      setTimeout(() => {
        console.log('📤 Calling onComplete with medicines:', result.detectedMedicines);
        console.log('📊 Number of medicines being passed:', result.detectedMedicines.length);
        console.log('💊 Medicine names being passed:', result.detectedMedicines.map(m => m.name));
        onComplete(result.detectedMedicines); // This should be the actual OCR result
      }, 800);

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      
      // Mark current step as error
      const currentStep = analysisSteps[currentStepIndex];
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error');
      }

      // Show error alert
      Alert.alert(
        'Analysis Failed',
        `Failed to analyze the prescription image. ${error instanceof Error ? error.message : 'Please try again with a clearer image.'}`,
        [
          {
            text: 'Retry',
            onPress: () => {
              // Reset and retry
              console.log('🔄 Retrying analysis...');
              setCurrentStepIndex(0);
              setProgress(0);
              setDetectedMedicines([]);
              setAnalysisResult(null);
              setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
              startAnalysis();
            }
          },
          {
            text: 'Cancel',
            onPress: () => {
              console.log('❌ Analysis cancelled by user');
              onComplete([]);
            },
            style: 'cancel'
          }
        ]
      );
    }
  };

  const renderDetectionOverlay = () => {
    if (currentStepIndex < 2 || detectedMedicines.length === 0) return null;

    return (
      <View style={styles.detectionOverlay}>
        {detectedMedicines.map((medicine, index) => (
          <Animated.View
            key={medicine.id}
            style={[
              styles.detectionBox,
              medicine.boundingBox && {
                left: medicine.boundingBox.x,
                top: medicine.boundingBox.y,
                width: medicine.boundingBox.width,
                height: medicine.boundingBox.height,
              },
              {
                opacity: progressAnim.interpolate({
                  inputRange: [50, 80],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              }
            ]}
          >
            <View style={styles.detectionLabel}>
              <Pill size={12} color={COLORS.white} />
              <Text style={styles.detectionText}>{medicine.name}</Text>
              <Text style={styles.confidenceText}>
                {Math.round(medicine.confidence * 100)}%
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    );
  };

  const getProcessingStatusText = () => {
    const currentStep = analysisSteps[currentStepIndex];
    if (!currentStep) return 'AI Processing';
    
    switch (currentStep.status) {
      case 'processing':
        return currentStep.label;
      case 'completed':
        return 'Analysis Complete';
      case 'error':
        return 'Error Occurred';
      default:
        return 'AI Processing';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analyzing Prescription</Text>
        <Text style={styles.headerSubtitle}>
          Using ML Kit OCR to detect medicines and dosages
          {TESTING_MODE && (
            <Text style={[styles.headerSubtitle, { color: COLORS.warning, fontWeight: 'bold' }]}>
              {'\n'}🧪 TESTING MODE ENABLED
            </Text>
          )}
        </Text>
      </View>

      {/* Image with Analysis Overlay */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        
        {/* Scanning Effect */}
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [
                {
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 300],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Detection Overlay */}
        {renderDetectionOverlay()}

        {/* Processing Indicator */}
        <Animated.View
          style={[
            styles.processingIndicator,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          {analysisSteps[currentStepIndex]?.status === 'error' ? (
            <AlertCircle size={24} color={COLORS.error} />
          ) : (
            <Brain size={24} color={COLORS.primary} />
          )}
          <Text style={[
            styles.processingText,
            analysisSteps[currentStepIndex]?.status === 'error' && { color: COLORS.error }
          ]}>
            {getProcessingStatusText()}
          </Text>
        </Animated.View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
      </View>

      {/* Analysis Steps */}
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>Analysis Progress</Text>
        {analysisSteps.map((step, index) => (
          <AnalysisStepItem
            key={step.id}
            step={step}
            isActive={index === currentStepIndex}
            isCompleted={index < currentStepIndex}
          />
        ))}
      </View>

      {/* Live Results */}
      {detectedMedicines.length > 0 && (
        <View style={styles.liveResults}>
          <Text style={styles.liveResultsTitle}>
            🎯 Detected Medicines ({detectedMedicines.length})
          </Text>
          {analysisResult && (
            <Text style={styles.analysisInfo}>
              Processing time: {analysisResult.processingTime.toFixed(1)}s • 
              Overall confidence: {Math.round(analysisResult.confidence * 100)}%
              {TESTING_MODE && ' • 🧪 TEST DATA'}
            </Text>
          )}
          {detectedMedicines.slice(0, 2).map((medicine, index) => (
            <View key={medicine.id} style={styles.medicineItem}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{medicine.name}</Text>
                <Text style={styles.medicineDetails}>
                  {medicine.dosage} • {medicine.frequency}
                </Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(medicine.confidence * 100)}%
                </Text>
              </View>
            </View>
          ))}
          {detectedMedicines.length > 2 && (
            <Text style={styles.moreResultsText}>
              +{detectedMedicines.length - 2} more medicines detected...
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// Analysis Step Item Component
const AnalysisStepItem = ({ 
  step, 
  isActive, 
  isCompleted 
}: { 
  step: AnalysisStep; 
  isActive: boolean; 
  isCompleted: boolean; 
}) => (
  <View style={styles.stepItem}>
    <View style={[
      styles.stepIcon,
      isActive && styles.stepIconActive,
      isCompleted && styles.stepIconCompleted,
      step.status === 'error' && styles.stepIconError
    ]}>
      {step.status === 'error' ? (
        <AlertTriangle size={16} color={COLORS.white} />
      ) : isCompleted ? (
        <CheckCircle2 size={16} color={COLORS.white} />
      ) : isActive ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        step.icon
      )}
    </View>
    
    <View style={styles.stepContent}>
      <Text style={[
        styles.stepLabel,
        isActive && styles.stepLabelActive,
        step.status === 'error' && styles.stepLabelError
      ]}>
        {step.label}
      </Text>
      <Text style={styles.stepDescription}>{step.description}</Text>
    </View>
    
    {isActive && step.status !== 'error' && (
      <View style={styles.stepIndicator}>
        <Zap size={16} color={COLORS.warning} />
      </View>
    )}
    
    {step.status === 'error' && (
      <View style={styles.stepIndicator}>
        <AlertTriangle size={16} color={COLORS.error} />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  imageContainer: {
    height: 200,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  detectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  detectionBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.success,
    borderRadius: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  detectionLabel: {
    position: 'absolute',
    top: -24,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  detectionText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  processingIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  processingText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  stepsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepsTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    ...SHADOWS.small,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconActive: {
    backgroundColor: COLORS.primary,
  },
  stepIconCompleted: {
    backgroundColor: COLORS.success,
  },
  stepIconError: {
    backgroundColor: COLORS.error,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  stepLabelError: {
    color: COLORS.error,
  },
  stepDescription: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  stepIndicator: {
    marginLeft: 8,
  },
  liveResults: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  liveResultsTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  analysisInfo: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.veryLightGray,
    borderRadius: 8,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  medicineDetails: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  confidenceBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  moreResultsText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});