import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Plus, User, Phone, Calendar } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';

// Mock patient data for doctors
const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    age: 42,
    gender: 'Male',
    // phone: '+1 (555) 123-4567',
    lastVisit: '2023-11-10',
    condition: 'Hypertension',
    status: 'stable',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Emily Johnson',
    age: 35,
    gender: 'Female',
    // phone: '+1 (555) 234-5678',
    lastVisit: '2023-11-08',
    condition: 'Diabetes Type 2',
    status: 'monitoring',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Michael Smith',
    age: 58,
    gender: 'Male',
    // phone: '+1 (555) 345-6789',
    lastVisit: '2023-11-05',
    condition: 'Arthritis',
    status: 'stable',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    age: 29,
    gender: 'Female',
    // phone: '+1 (555) 456-7890',
    lastVisit: '2023-11-12',
    condition: 'Asthma',
    status: 'stable',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1974&auto=format&fit=crop'
  }
];

export default function DoctorPatientsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(mockPatients);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPatients(mockPatients);
    } else {
      const filtered = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.condition.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return COLORS.success;
      case 'monitoring':
        return COLORS.warning;
      case 'critical':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Patients</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(doctor)/patients/add')}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Patient List */}
      <ScrollView style={styles.patientList} showsVerticalScrollIndicator={false}>
        {filteredPatients.map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={styles.patientCard}
            onPress={() => router.push(`/(doctor)/patients/${patient.id}`)}
          >
            <Image source={{ uri: patient.image }} style={styles.patientImage} />
            
            <View style={styles.patientInfo}>
              <View style={styles.patientHeader}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(patient.status) }]}>
                    {patient.status}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.patientDetails}>
                {patient.age} years • {patient.gender}
              </Text>
              
              <Text style={styles.patientCondition}>{patient.condition}</Text>
              
              <View style={styles.patientMeta}>
                {/* <View style={styles.metaItem}>
                  <Phone size={14} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>{patient.phone}</Text>
                </View> */}
                <View style={styles.metaItem}>
                  <Calendar size={14} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>Last visit: {patient.lastVisit}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingVertical: 16,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  patientList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  patientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  patientDetails: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  patientCondition: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  patientMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
});