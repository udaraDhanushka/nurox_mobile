import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    Alert
} from 'react-native';
import {
    ArrowLeft,
    RotateCw,
    Crop,
    Contrast,
    Sun,
    Palette,
    Check,
    X,
    RefreshCw,
    Maximize,
    Eye,
    Sliders
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

interface ImagePreviewScreenProps {
    imageUri: string;
    onConfirm: (enhancedImageUri: string) => void;
    onBack: () => void;
    onRetake?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type EditMode = 'none' | 'crop' | 'brightness' | 'contrast' | 'rotate';

export default function ImagePreviewScreen({
    imageUri,
    onConfirm,
    onBack,
    onRetake
}: ImagePreviewScreenProps) {
    const [editMode, setEditMode] = useState<EditMode>('none');
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);
    const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 1, height: 1 });
    const [showOriginal, setShowOriginal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleEditModeChange = (mode: EditMode) => {
        setEditMode(editMode === mode ? 'none' : mode);
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleReset = () => {
        Alert.alert(
            'Reset Changes',
            'Are you sure you want to reset all edits?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    onPress: () => {
                        setBrightness(1);
                        setContrast(1);
                        setRotation(0);
                        setScale(1);
                        setCropArea({ x: 0, y: 0, width: 1, height: 1 });
                        setEditMode('none');
                    }
                }
            ]
        );
    };

    const handleConfirm = async () => {
        setIsProcessing(true);

        // Simulate image processing
        setTimeout(() => {
            setIsProcessing(false);
            onConfirm(imageUri); // In real implementation, pass enhanced image URI
        }, 2000);
    };

    const renderEditControls = () => {
        switch (editMode) {
            case 'brightness':
                return (
                    <BrightnessControl
                        value={brightness}
                        onChange={setBrightness}
                        onClose={() => setEditMode('none')}
                    />
                );
            case 'contrast':
                return (
                    <ContrastControl
                        value={contrast}
                        onChange={setContrast}
                        onClose={() => setEditMode('none')}
                    />
                );
            case 'crop':
                return (
                    <CropControl
                        cropArea={cropArea}
                        onChange={setCropArea}
                        onClose={() => setEditMode('none')}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={onBack}>
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Review Image</Text>

                <TouchableOpacity style={styles.headerButton} onPress={handleReset}>
                    <RefreshCw size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Image Container */}
            <View style={styles.imageContainer}>
                <ScrollView
                    style={styles.imageScrollView}
                    contentContainerStyle={styles.imageScrollContent}
                    maximumZoomScale={3}
                    minimumZoomScale={0.5}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: imageUri }}
                            style={[
                                styles.image,
                                {
                                    transform: [
                                        { rotate: `${rotation}deg` },
                                        { scale },
                                    ],
                                    opacity: showOriginal ? 1 : brightness,
                                    // Note: In real implementation, you'd use image processing libraries
                                    // for proper brightness/contrast adjustments
                                }
                            ]}
                            resizeMode="contain"
                        />

                        {editMode === 'crop' && <CropOverlay cropArea={cropArea} />}
                    </View>
                </ScrollView>

                {/* Quality Indicators */}
                <View style={styles.qualityIndicators}>
                    <QualityIndicator label="Clarity" score={0.85} color={COLORS.success} />
                    <QualityIndicator label="Lighting" score={0.92} color={COLORS.success} />
                    <QualityIndicator label="Angle" score={0.78} color={COLORS.warning} />
                </View>
            </View>

            {/* Edit Controls */}
            {renderEditControls()}

            {/* Bottom Tools */}
            <View style={styles.bottomToolbar}>
                <View style={styles.editTools}>
                    <TouchableOpacity
                        style={[styles.toolButton, editMode === 'crop' && styles.toolButtonActive]}
                        onPress={() => handleEditModeChange('crop')}
                    >
                        <Crop size={20} color={editMode === 'crop' ? COLORS.white : COLORS.textPrimary} />
                        <Text style={[styles.toolButtonText, editMode === 'crop' && styles.toolButtonTextActive]}>
                            Crop
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolButton} onPress={handleRotate}>
                        <RotateCw size={20} color={COLORS.textPrimary} />
                        <Text style={styles.toolButtonText}>Rotate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolButton, editMode === 'brightness' && styles.toolButtonActive]}
                        onPress={() => handleEditModeChange('brightness')}
                    >
                        <Sun size={20} color={editMode === 'brightness' ? COLORS.white : COLORS.textPrimary} />
                        <Text style={[styles.toolButtonText, editMode === 'brightness' && styles.toolButtonTextActive]}>
                            Bright
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolButton, editMode === 'contrast' && styles.toolButtonActive]}
                        onPress={() => handleEditModeChange('contrast')}
                    >
                        <Contrast size={20} color={editMode === 'contrast' ? COLORS.white : COLORS.textPrimary} />
                        <Text style={[styles.toolButtonText, editMode === 'contrast' && styles.toolButtonTextActive]}>
                            Contrast
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toolButton}
                        onPressIn={() => setShowOriginal(true)}
                        onPressOut={() => setShowOriginal(false)}
                    >
                        <Eye size={20} color={COLORS.textPrimary} />
                        <Text style={styles.toolButtonText}>Original</Text>
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {onRetake && (
                        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
                            <Text style={styles.retakeButtonText}>Retake</Text>
                        </TouchableOpacity>
                    )}

                    <Button
                        title={isProcessing ? "Processing..." : "Continue"}
                        onPress={handleConfirm}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        style={styles.confirmButton}
                    />
                </View>
            </View>

            {/* Enhancement Tips */}
            <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Quick Tips:</Text>
                <Text style={styles.tipText}>• Crop to focus on prescription details</Text>
                <Text style={styles.tipText}>• Adjust brightness if text appears too dark</Text>
                <Text style={styles.tipText}>• Rotate if the image orientation is incorrect</Text>
            </View>
        </View>
    );
}

// Quality Indicator Component
const QualityIndicator = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <View style={styles.qualityItem}>
        <Text style={styles.qualityLabel}>{label}</Text>
        <View style={styles.qualityBar}>
            <View style={[styles.qualityFill, { width: `${score * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.qualityScore}>{Math.round(score * 100)}%</Text>
    </View>
);

// Brightness Control Component
const BrightnessControl = ({ value, onChange, onClose }: any) => (
    <View style={styles.controlPanel}>
        <View style={styles.controlHeader}>
            <Text style={styles.controlTitle}>Brightness</Text>
            <TouchableOpacity onPress={onClose}>
                <X size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
        </View>
        <View style={styles.sliderContainer}>
            <Sun size={16} color={COLORS.textSecondary} />
            {/* In real implementation, use a proper slider component */}
            <View style={styles.sliderTrack}>
                <View style={[styles.sliderThumb, { left: `${(value - 0.5) * 100}%` }]} />
            </View>
            <Sun size={20} color={COLORS.textPrimary} />
        </View>
    </View>
);

// Contrast Control Component
const ContrastControl = ({ value, onChange, onClose }: any) => (
    <View style={styles.controlPanel}>
        <View style={styles.controlHeader}>
            <Text style={styles.controlTitle}>Contrast</Text>
            <TouchableOpacity onPress={onClose}>
                <X size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
        </View>
        <View style={styles.sliderContainer}>
            <Contrast size={16} color={COLORS.textSecondary} />
            <View style={styles.sliderTrack}>
                <View style={[styles.sliderThumb, { left: `${(value - 0.5) * 100}%` }]} />
            </View>
            <Contrast size={20} color={COLORS.textPrimary} />
        </View>
    </View>
);

// Crop Control Component
const CropControl = ({ cropArea, onChange, onClose }: any) => (
    <View style={styles.controlPanel}>
        <View style={styles.controlHeader}>
            <Text style={styles.controlTitle}>Crop Image</Text>
            <TouchableOpacity onPress={onClose}>
                <X size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
        </View>
        <Text style={styles.controlDescription}>
            Drag the corners to adjust the crop area
        </Text>
    </View>
);

// Crop Overlay Component
const CropOverlay = ({ cropArea }: any) => (
    <View style={styles.cropOverlay}>
        <View style={styles.cropFrame}>
            {/* Corner handles */}
            <View style={[styles.cropHandle, styles.cropHandleTopLeft]} />
            <View style={[styles.cropHandle, styles.cropHandleTopRight]} />
            <View style={[styles.cropHandle, styles.cropHandleBottomLeft]} />
            <View style={[styles.cropHandle, styles.cropHandleBottomRight]} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerButton: {
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
    imageContainer: {
        flex: 1,
        position: 'relative',
    },
    imageScrollView: {
        flex: 1,
    },
    imageScrollContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: SCREEN_WIDTH - 32,
        height: SCREEN_HEIGHT * 0.6,
    },
    qualityIndicators: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 8,
        padding: 12,
        minWidth: 120,
    },
    qualityItem: {
        marginBottom: 8,
    },
    qualityLabel: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        marginBottom: 4,
    },
    qualityBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        marginBottom: 2,
    },
    qualityFill: {
        height: '100%',
        borderRadius: 2,
    },
    qualityScore: {
        color: COLORS.white,
        fontSize: SIZES.xs,
        textAlign: 'right',
    },
    controlPanel: {
        position: 'absolute',
        bottom: 140,
        left: 16,
        right: 16,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        ...SHADOWS.medium,
    },
    controlHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    controlTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    controlDescription: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sliderTrack: {
        flex: 1,
        height: 4,
        backgroundColor: COLORS.lightGray,
        borderRadius: 2,
        position: 'relative',
    },
    sliderThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        top: -8,
    },
    cropOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cropFrame: {
        width: '80%',
        height: '60%',
        borderWidth: 2,
        borderColor: COLORS.primary,
        position: 'relative',
    },
    cropHandle: {
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
    },
    cropHandleTopLeft: {
        top: -10,
        left: -10,
    },
    cropHandleTopRight: {
        top: -10,
        right: -10,
    },
    cropHandleBottomLeft: {
        bottom: -10,
        left: -10,
    },
    cropHandleBottomRight: {
        bottom: -10,
        right: -10,
    },
    bottomToolbar: {
        backgroundColor: COLORS.white,
        paddingTop: 16,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    editTools: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    toolButton: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        minWidth: 60,
    },
    toolButtonActive: {
        backgroundColor: COLORS.primary,
    },
    toolButtonText: {
        fontSize: SIZES.xs,
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    toolButtonTextActive: {
        color: COLORS.white,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    retakeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    retakeButtonText: {
        fontSize: SIZES.md,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    confirmButton: {
        flex: 2,
    },
    tipsContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    tipsTitle: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    tipText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
});