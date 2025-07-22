// import React, { useState, useEffect, useRef } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   Modal,
//   TouchableOpacity,
//   ScrollView,
//   Animated,
//   Dimensions,
//   Alert
// } from 'react-native';
// import {
//   X,
//   Upload,
//   CheckCircle2,
//   AlertTriangle,
//   Clock,
//   Zap,
//   Pause,
//   Play,
//   Trash2,
//   RefreshCw,
//   FileText,
//   Image as ImageIcon,
//   Brain,
//   Target
// } from 'lucide-react-native';
// import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
// import { useUploadOperations } from '@/store/medicalStore';
// import { ProcessingUpload, UploadQueueItem } from '@/types/medical';

// interface UploadProgressTrackerProps {
//   visible: boolean;
//   onClose: () => void;
// }

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// export default function UploadProgressTracker({
//   visible,
//   onClose
// }: UploadProgressTrackerProps) {
//   const {
//     getUploadQueue,
//     getProcessingUploads,
//     removeFromQueue,
//     isProcessing,
//     getUploadStats
//   } = useUploadOperations();

//   const [activeTab, setActiveTab] = useState<'queue' | 'processing' | 'stats'>('processing');
//   const [refreshing, setRefreshing] = useState(false);

//   const uploadQueue = getUploadQueue();
//   const processingUploads = getProcessingUploads();
//   const stats = getUploadStats();
//   const hasActiveUploads = uploadQueue.length > 0 || processingUploads.length > 0;

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     // Simulate refresh delay
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   const handleCancelUpload = (uploadId: string) => {
//     Alert.alert(
//       'Cancel Upload',
//       'Are you sure you want to cancel this upload?',
//       [
//         { text: 'No', style: 'cancel' },
//         {
//           text: 'Yes',
//           style: 'destructive',
//           onPress: () => removeFromQueue(uploadId)
//         }
//       ]
//     );
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'queue':
//         return <QueueTab queue={uploadQueue} onCancel={handleCancelUpload} />;
//       case 'processing':
//         return <ProcessingTab uploads={processingUploads} />;
//       case 'stats':
//         return <StatsTab stats={stats} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="pageSheet"
//       onRequestClose={onClose}
//     >
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Upload Progress</Text>
//           <View style={styles.headerActions}>
//             <TouchableOpacity
//               style={styles.refreshButton}
//               onPress={handleRefresh}
//               disabled={refreshing}
//             >
//               <RefreshCw 
//                 size={20} 
//                 color={COLORS.textSecondary} 
//                 style={refreshing ? styles.spinning : undefined}
//               />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <X size={24} color={COLORS.textPrimary} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Status Bar */}
//         <View style={styles.statusBar}>
//           <StatusIndicator
//             label="Queue"
//             count={uploadQueue.length}
//             color={COLORS.primary}
//             active={activeTab === 'queue'}
//             onPress={() => setActiveTab('queue')}
//           />
//           <StatusIndicator
//             label="Processing"
//             count={processingUploads.length}
//             color={COLORS.warning}
//             active={activeTab === 'processing'}
//             onPress={() => setActiveTab('processing')}
//             animated={processingUploads.length > 0}
//           />
//           <StatusIndicator
//             label="Stats"
//             count={stats.total}
//             color={COLORS.success}
//             active={activeTab === 'stats'}
//             onPress={() => setActiveTab('stats')}
//           />
//         </View>

//         {/* Content */}
//         <View style={styles.content}>
//           {hasActiveUploads || stats.total > 0 ? (
//             renderTabContent()
//           ) : (
//             <EmptyState />
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }

// // Status Indicator Component
// const StatusIndicator = ({
//   label,
//   count,
//   color,
//   active,
//   animated = false,
//   onPress
// }: {
//   label: string;
//   count: number;
//   color: string;
//   active: boolean;
//   animated?: boolean;
//   onPress: () => void;
// }) => {
//   const pulseAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     if (animated && count > 0) {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.2,
//             duration: 1000,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 1000,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     } else {
//       pulseAnim.setValue(1);
//     }
//   }, [animated, count]);

//   return (
//     <TouchableOpacity
//       style={[styles.statusIndicator, active && styles.statusIndicatorActive]}
//       onPress={onPress}
//     >
//       <Animated.View
//         style={[
//           styles.statusCount,
//           { backgroundColor: color },
//           { transform: [{ scale: pulseAnim }] }
//         ]}
//       >
//         <Text style={styles.statusCountText}>{count}</Text>
//       </Animated.View>
//       <Text style={[styles.statusLabel, active && styles.statusLabelActive]}>
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// };

// // Queue Tab Component
// const QueueTab = ({
//   queue,
//   onCancel
// }: {
//   queue: UploadQueueItem[];
//   onCancel: (id: string) => void;
// }) => {
//   if (queue.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Upload size={48} color={COLORS.textSecondary} />
//         <Text style={styles.emptyTitle}>No uploads in queue</Text>
//         <Text style={styles.emptyText}>
//           Files will appear here when you start uploading prescriptions
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
//       {queue.map((item, index) => (
//         <QueueItem
//           key={item.id}
//           item={item}
//           position={index + 1}
//           onCancel={() => onCancel(item.id)}
//         />
//       ))}
//     </ScrollView>
//   );
// };

// // Queue Item Component
// const QueueItem = ({
//   item,
//   position,
//   onCancel
// }: {
//   item: UploadQueueItem;
//   position: number;
//   onCancel: () => void;
// }) => {
//   const getFileIcon = () => {
//     if (item.file.type.startsWith('image/')) {
//       return <ImageIcon size={20} color={COLORS.primary} />;
//     }
//     return <FileText size={20} color={COLORS.primary} />;
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 B';
//     const k = 1024;
//     const sizes = ['B', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   return (
//     <View style={styles.queueItem}>
//       <View style={styles.queueItemHeader}>
//         <View style={styles.queuePosition}>
//           <Text style={styles.queuePositionText}>{position}</Text>
//         </View>
//         <View style={styles.queueItemInfo}>
//           <View style={styles.queueItemTitle}>
//             {getFileIcon()}
//             <Text style={styles.queueItemName}>{item.file.name}</Text>
//           </View>
//           <Text style={styles.queueItemDetails}>
//             {formatFileSize(item.file.size)} • {item.priority} priority
//           </Text>
//           <Text style={styles.queueItemTime}>
//             Added {new Date(item.addedAt).toLocaleTimeString()}
//           </Text>
//         </View>
//         <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
//           <X size={16} color={COLORS.error} />
//         </TouchableOpacity>
//       </View>
      
//       {item.estimatedProcessingTime && (
//         <View style={styles.queueItemFooter}>
//           <Clock size={14} color={COLORS.textSecondary} />
//           <Text style={styles.estimatedTime}>
//             Est. {Math.round(item.estimatedProcessingTime / 1000)}s processing time
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// // Processing Tab Component
// const ProcessingTab = ({ uploads }: { uploads: ProcessingUpload[] }) => {
//   if (uploads.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Brain size={48} color={COLORS.textSecondary} />
//         <Text style={styles.emptyTitle}>No active processing</Text>
//         <Text style={styles.emptyText}>
//           Upload progress will be shown here when files are being processed
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
//       {uploads.map((upload) => (
//         <ProcessingItem key={upload.id} upload={upload} />
//       ))}
//     </ScrollView>
//   );
// };

// // Processing Item Component
// const ProcessingItem = ({ upload }: { upload: ProcessingUpload }) => {
//   const progressAnim = useRef(new Animated.Value(upload.progress)).current;

//   useEffect(() => {
//     Animated.timing(progressAnim, {
//       toValue: upload.progress,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   }, [upload.progress]);

//   const getStatusIcon = () => {
//     switch (upload.status) {
//       case 'uploading':
//         return <Upload size={20} color={COLORS.primary} />;
//       case 'processing':
//         return <Brain size={20} color={COLORS.warning} />;
//       case 'analyzing':
//         return <Target size={20} color={COLORS.secondary} />;
//       case 'finalizing':
//         return <CheckCircle2 size={20} color={COLORS.success} />;
//       default:
//         return <Clock size={20} color={COLORS.textSecondary} />;
//     }
//   };

//   const getStatusText = () => {
//     switch (upload.status) {
//       case 'uploading':
//         return 'Uploading file...';
//       case 'processing':
//         return 'Processing image...';
//       case 'analyzing':
//         return 'Analyzing prescription...';
//       case 'finalizing':
//         return 'Finalizing results...';
//       default:
//         return 'Processing...';
//     }
//   };

//   const elapsedTime = Math.floor((Date.now() - new Date(upload.startedAt).getTime()) / 1000);

//   return (
//     <View style={styles.processingItem}>
//       <View style={styles.processingHeader}>
//         <View style={styles.processingInfo}>
//           <View style={styles.processingTitle}>
//             {getStatusIcon()}
//             <Text style={styles.processingFileName}>{upload.fileName}</Text>
//           </View>
//           <Text style={styles.processingStatus}>{getStatusText()}</Text>
//           <Text style={styles.processingTime}>
//             Elapsed: {elapsedTime}s
//             {upload.estimatedCompletion && (
//               <Text> • ETA: {upload.estimatedCompletion}</Text>
//             )}
//           </Text>
//         </View>
//       </View>

//       {/* Progress Bar */}
//       <View style={styles.progressContainer}>
//         <View style={styles.progressBar}>
//           <Animated.View
//             style={[
//               styles.progressFill,
//               {
//                 width: progressAnim.interpolate({
//                   inputRange: [0, 100],
//                   outputRange: ['0%', '100%'],
//                   extrapolate: 'clamp',
//                 }),
//               },
//             ]}
//           />
//         </View>
//         <Text style={styles.progressText}>{Math.round(upload.progress)}%</Text>
//       </View>

//       {/* Current Step */}
//       {upload.currentStep && (
//         <View style={styles.currentStep}>
//           <Zap size={14} color={COLORS.warning} />
//           <Text style={styles.currentStepText}>
//             {upload.currentStep.name}: {upload.currentStep.description}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// // Stats Tab Component
// const StatsTab = ({ stats }: { stats: ReturnType<typeof useUploadOperations>['getUploadStats'] }) => (
//   <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
//     <View style={styles.statsContainer}>
//       <StatCard
//         title="Total Uploads"
//         value={stats.total.toString()}
//         icon={<Upload size={24} color={COLORS.primary} />}
//         color={COLORS.primary}
//       />
//       <StatCard
//         title="Successful"
//         value={stats.success.toString()}
//         icon={<CheckCircle2 size={24} color={COLORS.success} />}
//         color={COLORS.success}
//       />
//       <StatCard
//         title="Failed"
//         value={stats.failure.toString()}
//         icon={<AlertTriangle size={24} color={COLORS.error} />}
//         color={COLORS.error}
//       />
//       <StatCard
//         title="Success Rate"
//         value={`${stats.successRate.toFixed(1)}%`}
//         icon={<Target size={24} color={COLORS.secondary} />}
//         color={COLORS.secondary}
//       />
//     </View>

//     {/* Progress Chart Placeholder */}
//     <View style={styles.chartContainer}>
//       <Text style={styles.chartTitle}>Upload Activity</Text>
//       <View style={styles.chartPlaceholder}>
//         <Text style={styles.chartPlaceholderText}>
//           Chart visualization would go here
//         </Text>
//       </View>
//     </View>
//   </ScrollView>
// );

// // Stat Card Component
// const StatCard = ({
//   title,
//   value,
//   icon,
//   color
// }: {
//   title: string;
//   value: string;
//   icon: React.ReactNode;
//   color: string;
// }) => (
//   <View style={styles.statCard}>
//     <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
//       {icon}
//     </View>
//     <Text style={styles.statValue}>{value}</Text>
//     <Text style={styles.statTitle}>{title}</Text>
//   </View>
// );

// // Empty State Component
// const EmptyState = () => (
//   <View style={styles.emptyContainer}>
//     <Upload size={64} color={COLORS.textSecondary} />
//     <Text style={styles.emptyTitle}>No Upload Activity</Text>
//     <Text style={styles.emptyText}>
//       Start uploading prescription images to see progress and statistics here
//     </Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: COLORS.white,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   headerTitle: {
//     fontSize: SIZES.lg,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   refreshButton: {
//     width: 36,
//     height: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 18,
//     backgroundColor: COLORS.veryLightGray,
//   },
//   spinning: {
//     transform: [{ rotate: '360deg' }],
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   statusBar: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.white,
//     paddingVertical: 12,
//     paddingHorizontal: 4,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   statusIndicator: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   statusIndicatorActive: {
//     backgroundColor: COLORS.primary + '10',
//   },
//   statusCount: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   statusCountText: {
//     color: COLORS.white,
//     fontSize: SIZES.sm,
//     fontWeight: '600',
//   },
//   statusLabel: {
//     fontSize: SIZES.xs,
//     color: COLORS.textSecondary,
//   },
//   statusLabelActive: {
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   content: {
//     flex: 1,
//   },
//   tabContent: {
//     flex: 1,
//     padding: 16,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyTitle: {
//     fontSize: SIZES.lg,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyText: {
//     fontSize: SIZES.md,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   queueItem: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     ...SHADOWS.small,
//   },
//   queueItemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   queuePosition: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   queuePositionText: {
//     color: COLORS.white,
//     fontSize: SIZES.xs,
//     fontWeight: '600',
//   },
//   queueItemInfo: {
//     flex: 1,
//   },
//   queueItemTitle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//     gap: 8,
//   },
//   queueItemName: {
//     fontSize: SIZES.md,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     flex: 1,
//   },
//   queueItemDetails: {
//     fontSize: SIZES.sm,
//     color: COLORS.textSecondary,
//     marginBottom: 2,
//   },
//   queueItemTime: {
//     fontSize: SIZES.xs,
//     color: COLORS.textSecondary,
//   },
//   cancelButton: {
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.error + '20',
//     borderRadius: 16,
//   },
//   queueItemFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     gap: 6,
//   },
//   estimatedTime: {
//     fontSize: SIZES.xs,
//     color: COLORS.textSecondary,
//   },
//   processingItem: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     ...SHADOWS.small,
//   },
//   processingHeader: {
//     marginBottom: 12,
//   },
//   processingInfo: {
//     flex: 1,
//   },
//   processingTitle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//     gap: 8,
//   },
//   processingFileName: {
//     fontSize: SIZES.md,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     flex: 1,
//   },
//   processingStatus: {
//     fontSize: SIZES.sm,
//     color: COLORS.textSecondary,
//     marginBottom: 2,
//   },
//   processingTime: {
//     fontSize: SIZES.xs,
//     color: COLORS.textSecondary,
//   },
//   progressContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     gap: 12,
//   },
//   progressBar: {
//     flex: 1,
//     height: 6,
//     backgroundColor: COLORS.lightGray,
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: COLORS.primary,
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: SIZES.xs,
//     color: COLORS.textSecondary,
//     fontWeight: '600',
//     minWidth: 35,
//     textAlign: 'right',
//   },
//   currentStep: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.warning + '10',
//     padding: 8,
//     borderRadius: 6,
//     gap: 6,
//   },
//   currentStepText: {
//     fontSize: SIZES.xs,
//     color: COLORS.warning,
//     flex: 1,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//     marginBottom: 24,
//   },
//   statCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     flex: 1,
//     minWidth: (SCREEN_WIDTH - 60) / 2,
//     ...SHADOWS.small,
//   },
//   statIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   statValue: {
//     fontSize: SIZES.xl,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 4,
//   },
//   statTitle: {
//     fontSize: SIZES.sm,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//   },
//   chartContainer: {
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     padding: 16,
//     ...SHADOWS.small,
//   },
//   chartTitle: {
//     fontSize: SIZES.md,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 16,
//   },
//   chartPlaceholder: {
//     height: 200,
//     backgroundColor: COLORS.veryLightGray,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   chartPlaceholderText: {
//     fontSize: SIZES.sm,
//     color: COLORS.textSecondary,
//   },
// });