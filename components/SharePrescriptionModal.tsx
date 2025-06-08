// File: components/SharePrescriptionModal.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  Linking,
  Share,
  Platform,
  SafeAreaView
} from 'react-native';
import { 
  X, 
  MessageCircle, 
  Send, 
  Copy, 
  FileText, 
  Download,
  ExternalLink
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Button } from './Button';

interface SharePrescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  prescription: any;
}

// Mock internal chat contacts
const internalContacts = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    role: 'Cardiologist',
    department: 'Cardiology',
    status: 'online'
  },
  {
    id: '2',
    name: 'Dr. Michael Brown',
    role: 'Pharmacist',
    department: 'Pharmacy',
    status: 'online'
  },
  {
    id: '3',
    name: 'Nurse Janet Davis',
    role: 'Head Nurse',
    department: 'General Ward',
    status: 'away'
  },
  {
    id: '4',
    name: 'Dr. Emily Johnson',
    role: 'Endocrinologist',
    department: 'Endocrinology',
    status: 'offline'
  }
];

export const SharePrescriptionModal: React.FC<SharePrescriptionModalProps> = ({
  visible,
  onClose,
  prescription
}) => {
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState(`Prescription for ${prescription?.patientName}\n\nDiagnosis: ${prescription?.diagnosis}\n\nPlease review and provide feedback.`);

  const generatePrescriptionText = () => {
    if (!prescription) return '';
    
    let text = `📋 PRESCRIPTION\n`;
    text += `Patient: ${prescription.patientName}\n`;
    text += `Age: ${prescription.patientAge}\n`;
    text += `Date: ${prescription.date}\n\n`;
    text += `🔍 Diagnosis: ${prescription.diagnosis}\n\n`;
    text += `💊 Medications:\n`;
    
    prescription.medications.forEach((med: any, index: number) => {
      text += `${index + 1}. ${med.name} - ${med.dosage}\n`;
      text += `   Frequency: ${med.frequency}\n`;
      text += `   Duration: ${med.duration}\n`;
      if (med.instructions) {
        text += `   Instructions: ${med.instructions}\n`;
      }
      text += `\n`;
    });
    
    if (prescription.notes) {
      text += `📝 Notes: ${prescription.notes}\n\n`;
    }
    
    text += `Prescribed by: ${prescription.doctorSignature}`;
    return text;
  };

  const handleSelectContact = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleSendToInternalChat = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Contacts Selected', 'Please select at least one contact to share with.');
      return;
    }

    // Here you would integrate with your internal chat system
    Alert.alert(
      'Prescription Shared',
      `Prescription has been shared with ${selectedContacts.length} contact(s) in the internal chat.`,
      [
        {
          text: 'OK',
          onPress: onClose
        }
      ]
    );
  };

  const handleCopyToClipboard = async () => {
    const prescriptionText = generatePrescriptionText();
    
    if (Platform.OS === 'web') {
      // Web clipboard API
      try {
        await navigator.clipboard.writeText(prescriptionText);
        Alert.alert('Copied!', 'Prescription details copied to clipboard.');
      } catch (error) {
        Alert.alert('Error', 'Failed to copy to clipboard.');
      }
    } else {
      // React Native Clipboard (you'll need @react-native-clipboard/clipboard)
      // import Clipboard from '@react-native-clipboard/clipboard';
      // Clipboard.setString(prescriptionText);
      Alert.alert('Copied!', 'Prescription details copied to clipboard.');
    }
  };

  const handleShareWhatsApp = () => {
    const prescriptionText = generatePrescriptionText();
    const phoneNumber = ''; // You can preset a phone number or ask user to input
    
    // WhatsApp URL scheme
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(prescriptionText)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          // Fallback to web WhatsApp
          const webWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(prescriptionText)}`;
          return Linking.openURL(webWhatsAppUrl);
        }
      })
      .catch(() => {
        Alert.alert('Error', 'WhatsApp is not installed on this device.');
      });
  };

  const handleShareNative = () => {
    const prescriptionText = generatePrescriptionText();
    
    Share.share({
      message: prescriptionText,
      title: `Prescription for ${prescription?.patientName}`,
    })
    .then((result) => {
      if (result.action === Share.sharedAction) {
        Alert.alert('Shared!', 'Prescription has been shared successfully.');
      }
    })
    .catch((error) => {
      Alert.alert('Error', 'Failed to share prescription.');
    });
  };

  const handleGeneratePDF = () => {
    // Here you would implement PDF generation
    Alert.alert('Generate PDF', 'PDF generation feature would be implemented here.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return COLORS.success;
      case 'away': return COLORS.warning;
      case 'offline': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share Prescription</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={activeTab === 'internal' ? [styles.tab, styles.activeTab] : styles.tab}
            onPress={() => setActiveTab('internal')}
          >
            <MessageCircle size={20} color={activeTab === 'internal' ? COLORS.white : COLORS.textSecondary} />
            <Text style={activeTab === 'internal' ? [styles.tabText, styles.activeTabText] : styles.tabText}>
              Internal Chat
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={activeTab === 'external' ? [styles.tab, styles.activeTab] : styles.tab}
            onPress={() => setActiveTab('external')}
          >
            <ExternalLink size={20} color={activeTab === 'external' ? COLORS.white : COLORS.textSecondary} />
            <Text style={activeTab === 'external' ? [styles.tabText, styles.activeTabText] : styles.tabText}>
              External
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'internal' ? (
            /* Internal Chat Tab */
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Select Contacts</Text>
              
              {internalContacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={
                    selectedContacts.includes(contact.id) 
                      ? [styles.contactItem, styles.selectedContact]
                      : styles.contactItem
                  }
                  onPress={() => handleSelectContact(contact.id)}
                >
                  <View style={styles.contactInfo}>
                    <View style={styles.contactHeader}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(contact.status) }]} />
                    </View>
                    <Text style={styles.contactRole}>{contact.role}</Text>
                    <Text style={styles.contactDepartment}>{contact.department}</Text>
                  </View>
                  
                  {selectedContacts.includes(contact.id) && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <View style={styles.messageSection}>
                <Text style={styles.sectionTitle}>Message</Text>
                <TextInput
                  style={styles.messageInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Add a message..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Button
                title={`Send to ${selectedContacts.length} Contact(s)`}
                onPress={handleSendToInternalChat}
                style={selectedContacts.length === 0 ? styles.disabledButton : styles.sendButton}
                disabled={selectedContacts.length === 0}
                icon={<Send size={20} color={COLORS.white} />}
              />
            </View>
          ) : (
            /* External Tab */
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Share Options</Text>

              {/* Copy to Clipboard */}
              <TouchableOpacity style={styles.shareOption} onPress={handleCopyToClipboard}>
                <View style={styles.shareOptionIcon}>
                  <Copy size={24} color={COLORS.primary} />
                </View>
                <View style={styles.shareOptionContent}>
                  <Text style={styles.shareOptionTitle}>Copy to Clipboard</Text>
                  <Text style={styles.shareOptionDescription}>Copy prescription text to share anywhere</Text>
                </View>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity style={styles.shareOption} onPress={handleShareWhatsApp}>
                <View style={[styles.shareOptionIcon, { backgroundColor: '#25D366' + '20' }]}>
                  <MessageCircle size={24} color="#25D366" />
                </View>
                <View style={styles.shareOptionContent}>
                  <Text style={styles.shareOptionTitle}>Share via WhatsApp</Text>
                  <Text style={styles.shareOptionDescription}>Send prescription through WhatsApp</Text>
                </View>
              </TouchableOpacity>

              {/* Native Share */}
              <TouchableOpacity style={styles.shareOption} onPress={handleShareNative}>
                <View style={[styles.shareOptionIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                  <Send size={24} color={COLORS.secondary} />
                </View>
                <View style={styles.shareOptionContent}>
                  <Text style={styles.shareOptionTitle}>Share</Text>
                  <Text style={styles.shareOptionDescription}>Share via SMS, Email, or other apps</Text>
                </View>
              </TouchableOpacity>

              {/* Generate PDF */}
              <TouchableOpacity style={styles.shareOption} onPress={handleGeneratePDF}>
                <View style={[styles.shareOptionIcon, { backgroundColor: COLORS.error + '20' }]}>
                  <FileText size={24} color={COLORS.error} />
                </View>
                <View style={styles.shareOptionContent}>
                  <Text style={styles.shareOptionTitle}>Generate PDF</Text>
                  <Text style={styles.shareOptionDescription}>Create a PDF document to share</Text>
                </View>
              </TouchableOpacity>

              {/* Prescription Preview */}
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Preview</Text>
                <View style={styles.previewContainer}>
                  <Text style={styles.previewText}>{generatePrescriptionText()}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  contactItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  selectedContact: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  contactRole: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  contactDepartment: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: 'bold',
  },
  messageSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  messageInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    minHeight: 80,
    ...SHADOWS.small,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
    marginBottom: 20,
  },
  shareOption: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  shareOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareOptionContent: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  shareOptionDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  previewSection: {
    marginTop: 16,
  },
  previewContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    maxHeight: 200,
    ...SHADOWS.small,
  },
  previewText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});