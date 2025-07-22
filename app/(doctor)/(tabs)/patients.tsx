import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Plus, User, Phone, Calendar } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { patientService } from '../../../services/patientService';
import { useAuthStore } from '../../../store/authStore';
import { Patient } from '../../../types/appointment';


export default function DoctorPatientsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user?.id) {
      loadPatients();
    }
  }, [user]);
  
  const loadPatients = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const patients = await patientService.getDoctorPatients(user.id);
      setAllPatients(patients);
      setFilteredPatients(patients);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setAllPatients([]);
      setFilteredPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!user?.id) return;
    
    if (query.trim() === '') {
      setFilteredPatients(allPatients);
    } else {
      try {
        const searchResults = await patientService.searchPatients(user.id, query);
        setFilteredPatients(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to local filtering
        const filtered = allPatients.filter(patient =>
          patient.name.toLowerCase().includes(query.toLowerCase()) ||
          patient.conditions?.some(condition => 
            condition.toLowerCase().includes(query.toLowerCase())
          )
        );
        setFilteredPatients(filtered);
      }
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
          onPress={() => router.push('/(doctor)/doctor-patients/add')}
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading patients...</Text>
          </View>
        ) : filteredPatients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No patients found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Patients will appear here when they book appointments with you'}
            </Text>
          </View>
        ) : (
          filteredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientCard}
              onPress={() => router.push({
                pathname: '/(doctor)/doctor-patients/[id]',
                params: {id: patient.id}
              })}
            >
              <Image 
                source={{ uri: patient.profileImage || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop' }} 
                style={styles.patientImage} 
              />
              
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
                  {patient.age ? `${patient.age} years` : 'Age unknown'}
                  {patient.gender && ` • ${patient.gender}`}
                </Text>
                
                <Text style={styles.patientCondition}>
                  {patient.conditions && patient.conditions.length > 0 
                    ? patient.conditions.slice(0, 2).join(', ')
                    : 'No conditions recorded'
                  }
                  {patient.conditions && patient.conditions.length > 2 && ` +${patient.conditions.length - 2} more`}
                </Text>
                
                <View style={styles.patientMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color={COLORS.textSecondary} />
                    <Text style={styles.metaText}>
                      Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </View>
                  {patient.appointmentCount && (
                    <View style={styles.metaItem}>
                      <User size={14} color={COLORS.textSecondary} />
                      <Text style={styles.metaText}>
                        {patient.appointmentCount} appointment{patient.appointmentCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});