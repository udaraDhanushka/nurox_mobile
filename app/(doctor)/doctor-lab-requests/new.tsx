import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, X, User, FileText, Calendar, AlertCircle } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { useMedicalStore } from '../../../store/medicalStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { LabTestTemplate, LabTestRequest } from '../../../types/medical';

export default function NewLabRequestScreen() {
  const router = useRouter();
  const { patientId, patientName } = useLocalSearchParams();
  const { addLabTestRequest, getLabTestTemplates, addNotification } = useMedicalStore();
  const { addNotification: addAppNotification } = useNotificationStore();
  
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [showTestSearch, setShowTestSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const labTestTemplates = getLabTestTemplates();
  const [filteredTemplates, setFilteredTemplates] = useState<LabTestTemplate[]>(labTestTemplates);
  const customTestInputRef = useRef<TextInput>(null);

  // Pre-fill patient information if coming from patient detail screen
  useEffect(() => {
    if (patientName && typeof patientName === 'string') {
      setPatientNameInput(patientName);
    }
    if (patientId && typeof patientId === 'string') {
      setPatientIdInput(patientId);
    }
  }, [patientName, patientId]);

  const handleTestSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = labTestTemplates.filter(template =>
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.description.toLowerCase().includes(query.toLowerCase()) ||
        template.tests.some(test => test.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(labTestTemplates);
    }
  };

  const addTestFromTemplate = (template: LabTestTemplate) => {
    const newTests = template.tests.filter(test => !selectedTests.includes(test));
    if (newTests.length === 0) {
      Alert.alert('Tests Already Added', 'All tests from this template are already selected.');
      return;
    }

    setSelectedTests([...selectedTests, ...newTests]);
    setShowTestSearch(false);
    setSearchQuery('');
    setFilteredTemplates(labTestTemplates);
  };

  const addCustomTest = (testName: string) => {
    if (selectedTests.includes(testName)) {
      Alert.alert('Test Already Added', 'This test is already in the request.');
      return;
    }

    setSelectedTests([...selectedTests, testName]);
  };

  const removeTest = (testName: string) => {
    setSelectedTests(selectedTests.filter(test => test !== testName));
  };

  const validateForm = () => {
    if (!patientNameInput.trim()) {
      Alert.alert('Validation Error', 'Please enter patient name.');
      return false;
    }
    if (!patientIdInput.trim()) {
      Alert.alert('Validation Error', 'Please enter patient ID.');
      return false;
    }
    if (selectedTests.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one test.');
      return false;
    }
    if (!clinicalNotes.trim()) {
      Alert.alert('Validation Error', 'Please provide clinical notes or indication for the tests.');
      return false;
    }
    return true;
  };

  const handleCreateLabRequest = () => {
    if (!validateForm()) return;

    const newLabRequest: LabTestRequest = {
      id: Math.random().toString(36).substring(2, 9),
      patientId: patientIdInput,
      patientName: patientNameInput,
      doctorId: 'doctor_123', // This would come from auth context
      doctorName: 'Dr. Sarah Johnson', // This would come from auth context
      requestedTests: selectedTests,
      priority,
      clinicalNotes,
      symptoms,
      requestDate: new Date().toISOString(),
      expectedDate: expectedDate || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addLabTestRequest(newLabRequest);
    
    // Add notification for the patient
    addAppNotification({
      title: 'New Lab Test Request',
      message: `Dr. Sarah Johnson has requested lab tests: ${selectedTests.slice(0, 2).join(', ')}${selectedTests.length > 2 ? ` +${selectedTests.length - 2} more` : ''}`,
      type: 'lab',
      priority: priority === 'stat' ? 'high' : priority === 'urgent' ? 'medium' : 'low'
    });

    Alert.alert(
      'Lab Request Created',
      'The lab test request has been successfully created and sent to the patient.',
      [
        {
          text: 'OK',
          onPress: () => {
            // If we came from a patient detail screen, go back to it
            if (patientId) {
              router.push(`/(doctor)/doctor-patients/${patientId}`);
            } else {
              router.back();
            }
          }
        }
      ]
    );
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'stat':
        return COLORS.error;
      case 'urgent':
        return COLORS.warning;
      case 'routine':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Lab Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient Name *</Text>
            <TextInput
              style={styles.textInput}
              value={patientNameInput}
              onChangeText={setPatientNameInput}
              placeholder="Enter patient name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient ID *</Text>
            <TextInput
              style={styles.textInput}
              value={patientIdInput}
              onChangeText={setPatientIdInput}
              placeholder="Enter patient ID"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        {/* Priority Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {(['routine', 'urgent', 'stat'] as const).map((priorityLevel) => (
              <TouchableOpacity
                key={priorityLevel}
                style={[
                  styles.priorityOption,
                  priority === priorityLevel && { 
                    backgroundColor: getPriorityColor(priorityLevel) + '20',
                    borderColor: getPriorityColor(priorityLevel)
                  }
                ]}
                onPress={() => setPriority(priorityLevel)}
              >
                <Text style={[
                  styles.priorityText,
                  priority === priorityLevel && { color: getPriorityColor(priorityLevel) }
                ]}>
                  {priorityLevel.charAt(0).toUpperCase() + priorityLevel.slice(1)}
                </Text>
                {priorityLevel === 'stat' && (
                  <AlertCircle size={16} color={priority === priorityLevel ? COLORS.error : COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lab Tests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lab Tests</Text>
            <TouchableOpacity
              style={styles.addTestButton}
              onPress={() => setShowTestSearch(true)}
            >
              <Plus size={20} color={COLORS.white} />
              <Text style={styles.addTestText}>Add Tests</Text>
            </TouchableOpacity>
          </View>

          {selectedTests.length > 0 ? (
            <View style={styles.selectedTestsContainer}>
              {selectedTests.map((test, index) => (
                <View key={index} style={styles.testTag}>
                  <Text style={styles.testTagText}>{test}</Text>
                  <TouchableOpacity
                    onPress={() => removeTest(test)}
                    style={styles.removeTestButton}
                  >
                    <X size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noTestsText}>No tests selected. Tap "Add Tests" to choose lab tests.</Text>
          )}
        </View>

        {/* Clinical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Clinical Notes/Indication *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={clinicalNotes}
              onChangeText={setClinicalNotes}
              placeholder="Enter clinical indication for the requested tests"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Symptoms (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Enter relevant symptoms or patient complaints"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Expected Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expected Date (Optional)</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.textInput}
              value={expectedDate}
              onChangeText={setExpectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.inputHint}>When do you expect the tests to be completed?</Text>
          </View>
        </View>

        <Button
          title="Create Lab Request"
          onPress={handleCreateLabRequest}
          style={styles.createButton}
        />
      </ScrollView>

      {/* Test Search Modal */}
      {showTestSearch && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Lab Tests</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowTestSearch(false);
                  setSearchQuery('');
                  setFilteredTemplates(labTestTemplates);
                }}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Search size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleTestSearch}
                placeholder="Search test templates..."
                placeholderTextColor={COLORS.textSecondary}
                autoFocus
              />
            </View>
            
            <ScrollView style={styles.searchResults}>
              {filteredTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateItem}
                  onPress={() => addTestFromTemplate(template)}
                >
                  <View style={styles.templateHeader}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <View style={styles.templateMeta}>
                      {template.fastingRequired && (
                        <Text style={styles.fastingText}>Fasting Required</Text>
                      )}
                      <Text style={styles.priceText}>${template.price}</Text>
                    </View>
                  </View>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                  <Text style={styles.templateTests}>
                    Tests: {template.tests.join(', ')}
                  </Text>
                  {template.preparationInstructions && template.preparationInstructions.length > 0 && (
                    <Text style={styles.preparationText}>
                      Preparation: {template.preparationInstructions.join(', ')}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
              
              {/* Custom test input */}
              <View style={styles.customTestContainer}>
                <Text style={styles.customTestTitle}>Add Custom Test</Text>
                <View style={styles.customTestInputContainer}>
                  <TextInput
                    ref={customTestInputRef}
                    style={styles.customTestInput}
                    placeholder="Enter custom test name"
                    placeholderTextColor={COLORS.textSecondary}
                    onSubmitEditing={(event) => {
                      const testName = event.nativeEvent.text.trim();
                      if (testName) {
                        addCustomTest(testName);
                        customTestInputRef.current?.clear();
                      }
                    }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  backButton: {
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  priorityText: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  addTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addTestText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '500',
  },
  selectedTestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  testTagText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  removeTestButton: {
    padding: 2,
  },
  noTestsText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  createButton: {
    marginBottom: 24,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  templateItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  templateName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fastingText: {
    fontSize: SIZES.xs,
    color: COLORS.warning,
    fontWeight: '500',
  },
  priceText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  templateTests: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  preparationText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  customTestContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  customTestTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  customTestInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  customTestInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});