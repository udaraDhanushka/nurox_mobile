import { appointmentService } from './appointmentService';
import { TokenSlot } from '../types/appointment';

// Patient-specific token management service
// This service handles token availability and booking logic for patients only
class TokenService {
  
  // Generate estimated times for tokens (starting from 9 AM, 15 minutes per token)
  private generateEstimatedTime(tokenNumber: number): string {
    const startHour = 9;
    const minutesPerToken = 15;
    const totalMinutes = (tokenNumber - 1) * minutesPerToken;
    const hours = startHour + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    let displayHour = hours > 12 ? hours - 12 : hours;
    
    // Fix midnight display: 0 should be 12
    if (displayHour === 0) {
      displayHour = 12;
    }
    
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // Get token availability for a specific doctor and date (PATIENT USE ONLY)
  async getTokenAvailability(doctorId: string, date: string, totalTokens: number = 30): Promise<TokenSlot[]> {
    try {
      console.log(`Getting token availability for doctor ${doctorId} on ${date}`);
      
      let bookedTokens: number[] = [];
      
      try {
        // Try the dedicated token endpoint first
        const tokenResponse = await appointmentService.getTokenAvailability(doctorId, date);
        bookedTokens = tokenResponse.bookedTokens;
        console.log(`Token availability loaded for doctor ${doctorId} on ${date}:`, bookedTokens);
      } catch (tokenError) {
        console.warn('Token endpoint failed with error:', tokenError.message);
        console.log('Using appointments endpoint as fallback (this is expected until backend token endpoint is implemented)');
        
        try {
          // Fallback to appointments endpoint - this is the primary method until backend is fixed
          const appointmentsResponse = await appointmentService.getAppointments({
            startDate: date,
            endDate: date
          });

          // Filter appointments for this specific doctor and date
          const existingAppointments = appointmentsResponse.appointments.filter(
            apt => apt.doctorId === doctorId && 
                   new Date(apt.appointmentDate).toISOString().split('T')[0] === date &&
                   apt.status !== 'CANCELLED' && apt.status !== 'CANCELED'
          );

          bookedTokens = existingAppointments
            .map(apt => apt.tokenNumber)
            .filter(token => token !== undefined && token !== null) as number[];
          
          console.log(`Fallback token data loaded for doctor ${doctorId} on ${date}:`, bookedTokens);
          console.log(`Found ${existingAppointments.length} existing appointments for this doctor on ${date}`);
        } catch (fallbackError) {
          console.error('Both token and appointments endpoints failed:', fallbackError);
          console.warn('Defaulting to empty token list - all tokens will show as available');
          bookedTokens = []; // Default to empty if both fail
        }
      }

      // Generate token slots
      const tokens: TokenSlot[] = [];
      for (let i = 1; i <= totalTokens; i++) {
        const isBooked = bookedTokens.includes(i);
        
        tokens.push({
          tokenNumber: i,
          isBooked,
          patientName: isBooked ? 'Booked' : undefined,
          time: this.generateEstimatedTime(i)
        });
      }

      console.log(`Generated ${tokens.length} tokens, ${tokens.filter(t => t.isBooked).length} booked`);
      return tokens;
    } catch (error) {
      console.error('Failed to fetch token availability:', error);
      
      // Fallback to empty tokens if everything fails
      const tokens: TokenSlot[] = [];
      for (let i = 1; i <= totalTokens; i++) {
        tokens.push({
          tokenNumber: i,
          isBooked: false,
          patientName: undefined,
          time: this.generateEstimatedTime(i)
        });
      }
      
      return tokens;
    }
  }

  // Book a specific token (this would typically trigger payment flow)
  async bookToken(doctorId: string, date: string, tokenNumber: number): Promise<boolean> {
    try {
      // This would integrate with the appointment booking API
      console.log(`Booking token ${tokenNumber} for doctor ${doctorId} on ${date}`);
      
      // For now, this is handled by the appointment creation API
      // In the future, this could be a separate token booking endpoint
      return true;
    } catch (error) {
      console.error('Failed to book token:', error);
      return false;
    }
  }

  // Validate token selection
  validateTokenSelection(selectedToken: TokenSlot | null): { isValid: boolean; error?: string } {
    if (!selectedToken) {
      return { isValid: false, error: 'Please select a token number' };
    }
    
    if (selectedToken.isBooked) {
      return { isValid: false, error: 'This token is already booked. Please select another.' };
    }
    
    return { isValid: true };
  }

  // Convert token time to 24-hour format for API
  convertTokenTimeTo24Hour(tokenTime: string): string {
    console.log('Converting token time:', tokenTime);
    
    // Handle edge case where time might not have AM/PM
    if (!tokenTime.includes('AM') && !tokenTime.includes('PM')) {
      console.error('Time format error: Missing AM/PM in:', tokenTime);
      return '09:00'; // Default fallback
    }
    
    const [time, modifier] = tokenTime.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}

export const tokenService = new TokenService();
export default tokenService;