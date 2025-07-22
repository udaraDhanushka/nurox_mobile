import { create } from 'zustand';
import { Platform, Linking } from 'react-native';

export interface PharmacyMedicine {
  medicineId: string;
  medicineName: string;
  price: number;
  inStock: boolean;
  quantity: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  rating: number;
  distance?: number; // calculated based on user location
  medicines: PharmacyMedicine[];
  workingHours: {
    open: string;
    close: string;
  };
}

interface PharmacyStore {
  pharmacies: Pharmacy[];
  findNearbyPharmacies: (userLat: number, userLng: number, medicineIds: string[]) => Pharmacy[];
  getPharmacyById: (id: string) => Pharmacy | undefined;
  openDirections: (pharmacy: Pharmacy) => Promise<void>;
  openPharmacyCall: (phone: string) => Promise<void>;
  openGoogleMapsDirections: (pharmacy: Pharmacy, userLocation?: { latitude: number; longitude: number }) => Promise<void>;
}

const mockPharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'Healthguard Pharmacy',
    address: 'No 139/A, Dharmapala Mawatha, Colombo 07',
    phone: '+94 70 150 5100',
    latitude: 6.9148993,
    longitude: 79.7067352,
    rating: 4.5,
    workingHours: { open: '07:00', close: '20:00' },
    medicines: [
      { medicineId: '1', medicineName: 'Lisinopril', price: 15.99, inStock: true, quantity: 50 },
      { medicineId: '2', medicineName: 'Metformin', price: 12.50, inStock: true, quantity: 30 },
      { medicineId: '3', medicineName: 'Ibuprofen', price: 8.99, inStock: true, quantity: 100 },
      { medicineId: '4', medicineName: 'Albuterol', price: 45.00, inStock: false, quantity: 0 },
    ]
  },
  {
    id: '2',
    name: 'Union Chemists - Union Place',
    address: '460 Union Pl, Colombo 00200',
    phone: '+94 11 269 2532',
    latitude: 6.9176976,
    longitude: 79.7806859,
    rating: 4.2,
    workingHours: { open: '09:00', close: '23:00' },
    medicines: [
      { medicineId: '1', medicineName: 'Lisinopril', price: 14.99, inStock: true, quantity: 25 },
      { medicineId: '2', medicineName: 'Metformin', price: 13.00, inStock: true, quantity: 40 },
      { medicineId: '4', medicineName: 'Albuterol', price: 42.50, inStock: true, quantity: 15 },
      { medicineId: '5', medicineName: 'Amoxicillin', price: 18.99, inStock: true, quantity: 20 },
    ]
  },
  {
    id: '3',
    name: 'Central Pharmacy - Koswatte',
    address: '250 B240, Sri Jayawardenepura Kotte 10120',
    phone: '+94 11 287 5711',
    latitude: 6.9061875,
    longitude: 79.8463783,
    rating: 4.7,
    workingHours: { open: '07:00', close: '23:00' },
    medicines: [
      { medicineId: '1', medicineName: 'Lisinopril', price: 16.50, inStock: true, quantity: 35 },
      { medicineId: '3', medicineName: 'Ibuprofen', price: 7.99, inStock: true, quantity: 80 },
      { medicineId: '5', medicineName: 'Amoxicillin', price: 17.50, inStock: true, quantity: 45 },
      { medicineId: '6', medicineName: 'Atorvastatin', price: 25.99, inStock: true, quantity: 30 },
    ]
  }
];

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export const usePharmacyStore = create<PharmacyStore>((set, get) => ({
  pharmacies: mockPharmacies,
  
  findNearbyPharmacies: (userLat: number, userLng: number, medicineIds: string[]) => {
    const pharmacies = get().pharmacies;
    
    // Calculate distances and filter pharmacies that have at least one required medicine
    const pharmaciesWithDistance = pharmacies
      .map(pharmacy => ({
        ...pharmacy,
        distance: calculateDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude)
      }))
      .filter(pharmacy => 
        medicineIds.some(medicineId => 
          pharmacy.medicines.some(med => med.medicineId === medicineId && med.inStock)
        )
      )
      .sort((a, b) => a.distance - b.distance); // Sort by distance
    
    return pharmaciesWithDistance;
  },
  
  getPharmacyById: (id: string) => {
    return get().pharmacies.find(pharmacy => pharmacy.id === id);
  },

  openDirections: async (pharmacy: Pharmacy) => {
    try {
      if (Platform.OS === 'web') {
        // On web, open Google Maps
        const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
        window.open(url, '_blank');
        return;
      }

      // On mobile, try native maps first
      const nativeUrl = Platform.select({
        ios: `maps:0,0?q=${pharmacy.latitude},${pharmacy.longitude}`,
        android: `geo:0,0?q=${pharmacy.latitude},${pharmacy.longitude}`,
      });

      if (nativeUrl) {
        const supported = await Linking.canOpenURL(nativeUrl);
        if (supported) {
          await Linking.openURL(nativeUrl);
          return;
        }
      }

      // Fallback to Google Maps
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
      await Linking.openURL(googleMapsUrl);
    } catch (error) {
      console.error('Error opening directions:', error);
      throw new Error('Unable to open directions');
    }
  },

  openGoogleMapsDirections: async (pharmacy: Pharmacy, userLocation?: { latitude: number; longitude: number }) => {
    try {
      let url: string;
      
      if (userLocation) {
        // Include origin if user location is available
        url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${pharmacy.latitude},${pharmacy.longitude}`;
      } else {
        // Just destination
        url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
      }

      if (Platform.OS === 'web') {
        window.open(url, '_blank');
        return;
      }

      // On mobile, try to open Google Maps app first
      const googleMapsAppUrl = Platform.select({
        ios: `comgooglemaps://?daddr=${pharmacy.latitude},${pharmacy.longitude}${userLocation ? `&saddr=${userLocation.latitude},${userLocation.longitude}` : ''}`,
        android: `google.navigation:q=${pharmacy.latitude},${pharmacy.longitude}`,
      });

      if (googleMapsAppUrl) {
        const supported = await Linking.canOpenURL(googleMapsAppUrl);
        if (supported) {
          await Linking.openURL(googleMapsAppUrl);
          return;
        }
      }

      // Fallback to web Google Maps
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening Google Maps directions:', error);
      throw new Error('Unable to open Google Maps directions');
    }
  },

  openPharmacyCall: async (phone: string) => {
    try {
      if (Platform.OS === 'web') {
        // On web, just show the phone number
        alert(`Call ${phone}`);
        return;
      }

      // On mobile, open phone dialer
      const phoneUrl = `tel:${phone}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        throw new Error('Phone calls not supported');
      }
    } catch (error) {
      console.error('Error making phone call:', error);
      throw new Error('Unable to make phone call');
    }
  }
}));