import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  Vibration
} from 'react-native';
import {
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions
} from 'expo-camera';
import {
  ArrowLeft,
  Zap,
  ZapOff,
  RotateCcw,
  Circle,
  Grid3X3,
  Focus,
  ScanLine,
  Camera,
} from 'lucide-react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface CameraCaptureScreenProps {
  onImageCaptured: (imageUri: string) => void;
  onBack: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraCaptureScreen({
  onImageCaptured,
  onBack
}: CameraCaptureScreenProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (focusPoint) {
      const timer = setTimeout(() => setFocusPoint(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [focusPoint]);

  if (!permission) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={64} color={COLORS.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to capture your prescription images
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCameraReady = () => {
    setIsReady(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || !isReady) return;

    try {
      setIsCapturing(true);
      Vibration.vibrate(50); // Light haptic feedback

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onImageCaptured(photo.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image. Please try again.');
      console.error('Camera capture error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleFlash = () => {
    setFlash((current: FlashMode) => current === 'off' ? 'on' : 'off');
  };

  const flipCamera = () => {
    setFacing((current: CameraType) => current === 'back' ? 'front' : 'back');
  };

  const handleTouchFocus = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setFocusPoint({ x: locationX, y: locationY });
  };

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
          onCameraReady={handleCameraReady}
          onTouchStart={handleTouchFocus}
        >
          {/* Grid Overlay */}
          {showGrid && <GridOverlay />}
          
          {/* Focus Point Indicator */}
          {focusPoint && (
            <View
              style={[
                styles.focusIndicator,
                { left: focusPoint.x - 25, top: focusPoint.y - 25 }
              ]}
            >
              <Focus size={50} color={COLORS.white} />
            </View>
          )}

          {/* Prescription Guide Overlay */}
          <View style={styles.guideOverlay}>
            <View style={styles.guideBorder} />
            <Text style={styles.guideText}>
              Position prescription within the frame
            </Text>
          </View>

          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={onBack}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={styles.topRightControls}>
              <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                {flash === 'on' ? (
                  <Zap size={24} color={COLORS.warning} />
                ) : (
                  <ZapOff size={24} color={COLORS.white} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={() => setShowGrid(!showGrid)}>
                <Grid3X3 size={24} color={showGrid ? COLORS.primary : COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
              <RotateCcw size={24} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isCapturing && styles.captureButtonActive
              ]}
              onPress={handleCapture}
              disabled={isCapturing || !isReady}
            >
              <View style={styles.captureButtonInner}>
                {isCapturing ? (
                  <View style={styles.capturingIndicator} />
                ) : (
                  <Circle size={70} color={COLORS.white} fill={COLORS.white} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </CameraView>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionItem}>
          <ScanLine size={20} color={COLORS.primary} />
          <Text style={styles.instructionText}>
            Align prescription within the frame for best results
          </Text>
        </View>
        <Text style={styles.instructionSubtext}>
          Make sure text is clear and all medicine details are visible
        </Text>
      </View>
    </View>
  );
}

// Grid Overlay Component
const GridOverlay = () => (
  <View style={styles.gridOverlay}>
    {/* Vertical Lines */}
    <View style={[styles.gridLine, styles.gridLineVertical, { left: '33.33%' }]} />
    <View style={[styles.gridLine, styles.gridLineVertical, { left: '66.66%' }]} />
    
    {/* Horizontal Lines */}
    <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33.33%' }]} />
    <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66.66%' }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  permissionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    height: 1,
    width: '100%',
  },
  focusIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideOverlay: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  guideText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    textAlign: 'center',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  captureButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturingIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  instructionsContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  instructionSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 32,
  },
});