import { appointmentService } from './appointmentService';
import { Patient, DetailedPatient, ApiAppointment } from '../types/appointment';
import { patientDataService } from './patientDataService';
import { calculateAge, formatAge } from '../utils/dateUtils';


  private transformAppointmentPatientsToPatientList(
    appointments: ApiAppointment[],
    doctorId: string
  ): Patient[] {
    const patientMap = new Map<string, Patient>();
    
    // Filter appointments for this doctor and extract unique patients
    appointments
      .filter(appointment => appointment.doctorId === doctorId && appointment.patient)
      .forEach(appointment => {
        const apiPatient = appointment.patient!;
        const patientId = apiPatient.id;
        
        if (!patientMap.has(patientId)) {
          
          // Determine patient status based on recent appointment activity
          const status = this.determinePatientStatus(appointment);
          
          // Extract condition from appointment description or type
          const conditions = this.extractConditionsFromAppointment(appointment);
          
          patientMap.set(patientId, {
            id: apiPatient.id,
            firstName: apiPatient.firstName,
            lastName: apiPatient.lastName,
            name: `${apiPatient.firstName} ${apiPatient.lastName}`,
            email: apiPatient.email,
            phone: apiPatient.phone,
            profileImage: apiPatient.profileImage || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
            age,
            lastVisit: appointment.appointmentDate,
            conditions,
            status,
            appointmentCount: 1
          });
        } else {
          // Update existing patient with latest appointment info
          const existingPatient = patientMap.get(patientId)!;
          
          // Update last visit if this appointment is more recent
          if (new Date(appointment.appointmentDate) > new Date(existingPatient.lastVisit!)) {
            existingPatient.lastVisit = appointment.appointmentDate;
          }
          
          // Increment appointment count
          existingPatient.appointmentCount = (existingPatient.appointmentCount || 0) + 1;
          
          // Update conditions if new ones found
          const newConditions = this.extractConditionsFromAppointment(appointment);
          if (newConditions.length > 0) {
            existingPatient.conditions = [...new Set([
              ...(existingPatient.conditions || []),
              ...newConditions
            ])];
          }
        }
      });
    
    return Array.from(patientMap.values())
      .sort((a, b) => new Date(b.lastVisit!).getTime() - new Date(a.lastVisit!).getTime());
  }
  }

  // Determine patient status based on appointment info
  private determinePatientStatus(appointment: ApiAppointment): 'active' | 'stable' | 'monitoring' | 'critical' {
    const type = appointment.type.toLowerCase();
    const status = appointment.status.toUpperCase();
    
    if (type.includes('emergency') || status === 'URGENT') {
      return 'critical';
    } else if (type.includes('follow-up') || type.includes('monitoring')) {
      return 'monitoring';
    } else if (status === 'COMPLETED') {
      return 'stable';
    } else {
      return 'active';
    }
  }

  // Extract conditions from appointment description and type
  private extractConditionsFromAppointment(appointment: ApiAppointment): string[] {
    const conditions: string[] = [];
    const type = appointment.type.toLowerCase();
    const description = appointment.description?.toLowerCase() || '';
    
    // Map appointment types to likely conditions
    const typeConditionMap: { [key: string]: string[] } = {
      'consultation': ['General Consultation'],
      'follow-up': ['Ongoing Treatment'],
      'emergency': ['Emergency Care'],
      'routine_checkup': ['Routine Checkup'],
      'specialist_visit': ['Specialist Care']
    };
    
    // Add condition based on appointment type
    if (typeConditionMap[type]) {
      conditions.push(...typeConditionMap[type]);
    }
    
    // Extract conditions from description keywords
    const conditionKeywords = {
      'diabetes': 'Diabetes Type 2',
      'hypertension': 'Hypertension',
      'blood pressure': 'Hypertension',
      'heart': 'Cardiac Care',
      'asthma': 'Asthma',
      'arthritis': 'Arthritis',
      'pain': 'Pain Management',
      'headache': 'Headache',
      'migraine': 'Migraine'
    };
    
    Object.entries(conditionKeywords).forEach(([keyword, condition]) => {
      if (description.includes(keyword)) {
        conditions.push(condition);
      }
    });
    
    return [...new Set(conditions)]; // Remove duplicates
  }

  // Get all patients for a specific doctor from their appointments
  async getDoctorPatients(doctorId: string): Promise<Patient[]> {
    try {
      // Get all appointments for analysis
      const response = await appointmentService.getAppointments({
        limit: 100 // Get a larger set to find all patients
      });
      
      if (!response.appointments) {
        return [];
      }
      
    } catch (error) {
      console.error('Failed to get doctor patients:', error);
      return [];
    }
  }

  // Get recent patients (last 30 days) for a specific doctor
  async getRecentPatients(doctorId: string, limit: number = 10): Promise<Patient[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await appointmentService.getAppointments({
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        limit: 50
      });
      
      if (!response.appointments) {
        return [];
      }
      
      const recentPatients = this.transformAppointmentPatientsToPatientList(
        response.appointments,
        doctorId
      );
      
      return recentPatients.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent patients:', error);
      return [];
    }
  }

  // Get detailed patient information by ID
  async getPatientById(patientId: string, doctorId: string): Promise<DetailedPatient | null> {
    try {
      // Get all appointments for this patient with this doctor
      const response = await appointmentService.getAppointments({
        limit: 100
      });
      
      if (!response.appointments) {
        return null;
      }
      
      const patientAppointments = response.appointments.filter(
        apt => apt.patient?.id === patientId && apt.doctorId === doctorId
      );
      
      if (patientAppointments.length === 0) {
        return null;
      }
      
      const latestAppointment = patientAppointments
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())[0];
      
      const apiPatient = latestAppointment.patient!;
      
        gender: this.inferGender(apiPatient.firstName),
        lastVisit: latestAppointment.appointmentDate,
        status: this.determinePatientStatus(latestAppointment),
        appointmentCount: patientAppointments.length,
        
        // Extract conditions from all appointments
        conditions: [...new Set(
          patientAppointments.flatMap(apt => this.extractConditionsFromAppointment(apt))
        )],
        
        // Build appointment history
        appointmentHistory: patientAppointments
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
          .map(apt => ({
            id: apt.id,
            date: apt.appointmentDate,
            type: apt.type.toLowerCase().replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase()),
            notes: apt.notes || apt.description || 'No notes provided',
            status: apt.status.toLowerCase()
          })),
        
        // Find upcoming appointments
        upcomingAppointments: patientAppointments
          .filter(apt => new Date(apt.appointmentDate) > new Date())
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
          .map(apt => ({
            id: apt.id,
            date: apt.appointmentDate,
            time: apt.tokenNumber ? this.generateEstimatedTime(apt.tokenNumber) : 
              new Date(apt.appointmentDate).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              }),
            type: apt.type.toLowerCase().replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase()),
            status: apt.status.toLowerCase()
          }))
      };
      
      return detailedPatient;
    } catch (error) {
      console.error('Failed to get patient by ID:', error);
      return null;
    }
  }

  // Infer gender from first name (basic implementation)
  private inferGender(firstName: string): 'Male' | 'Female' | 'Other' {
    const maleNames = ['john', 'michael', 'robert', 'david', 'james', 'william', 'richard', 'thomas', 'daniel', 'matthew'];
    const femaleNames = ['mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen', 'emily', 'lisa'];
    
    const name = firstName.toLowerCase();
    
    if (maleNames.includes(name)) return 'Male';
    if (femaleNames.includes(name)) return 'Female';
    
    return 'Other';
  }

  // Generate estimated time from token number
  private generateEstimatedTime(tokenNumber: number): string {
    const startHour = 9;
    const minutesPerToken = 15;
    const totalMinutes = (tokenNumber - 1) * minutesPerToken;
    const hours = startHour + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours;
    
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // Search patients by name or condition
  async searchPatients(doctorId: string, query: string): Promise<Patient[]> {
    try {
      const allPatients = await this.getDoctorPatients(doctorId);
      
      if (!query.trim()) {
        return allPatients;
      }
      
      const searchTerm = query.toLowerCase();
      
      return allPatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm) ||
        patient.conditions?.some(condition => 
          condition.toLowerCase().includes(searchTerm)
        )
      );
    } catch (error) {
      console.error('Failed to search patients:', error);
      return [];
    }
  }
}

export const patientService = new PatientService();
export default patientService;