import { Language } from '@/store/languageStore';

// Define the structure of our translations
export type TranslationKey = 
  // Common
  | 'language'
  | 'darkMode'
  | 'lightMode'
  | 'selectLanguage'
  | 'cancel'
  | 'logout'
  | 'version'
  | 'personalInformation'
  | 'privacyPolicy'
  | 'helpSupport'
  | 'labReports'
  | 'moreItems'
  
  // Roles
  | 'patient'
  | 'doctor'
  | 'pharmacist'
  
  // Tab navigation - Patient
  | 'home'
  | 'appointments'
  | 'newClaim'
  | 'records'
  | 'notifications'
  
  // Tab navigation - Doctor
  | 'dashboard'
  | 'patients'
  | 'schedule'
  | 'prescriptions'
  | 'profile'
  
  // Tab navigation - Pharmacist
  | 'inventory'
  
  // Profile - Patient
  | 'medicalHistory'
  | 'insuranceInformation'
  | 'paymentMethods'
  
  // Profile - Doctor
  | 'medicalLicense'
  | 'specializations'
  | 'hospitalAffiliations'
  | 'professionalSettings'
  
  // Profile - Pharmacist
  | 'pharmacyLicense'
  | 'pharmacyAffiliations'
  | 'inventoryPreferences'

  // Patient Home Screen
  | 'hello'
  | 'firstName'
  | 'lastName'
  | 'bookAppointment'
  | 'medicalRecords'
  | 'healthTips'
  | 'insurance'
  | 'upcomingAppointments'
  | 'activePrescriptions'
  | 'recentLabReports'
  | 'seeAll'
  | 'noUpcomingAppointments'
  | 'bookNow'
  | 'noActivePrescriptions'
  | 'noRecentLabReports'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'refills'
  | 'orderedBy'
  | 'expired'
  | 'all'

  // Medical Records Screen
  | 'accessManageRecords'
  | 'viewCurrentPastMedications'
  | 'accessLabResults'
  | 'viewPastMedicalConditions'
  | 'trackVitalSigns'
  | 'manageAllergiesConditions'
  | 'accessUploadDocuments'
  | 'addCondition'
  | 'noMedicalHistory'
  | 'medicalHistoryWillAppear'
  | 'diagnosed'
  | 'treatment'
  | 'active'
  | 'chronic'
  | 'resolved'
  | 'allergies'
  | 'conditions'
  | 'addAllergy'
  | 'noAllergiesRecorded'
  | 'addKnownAllergies'
  | 'noConditionsRecorded'
  | 'addChronicConditions'
  | 'symptoms'
  | 'notes'
  | 'added'
  | 'medication'
  | 'food'
  | 'environmental'
  | 'other'
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'managed'
  | 'recordVitals'
  | 'latestReadings'
  | 'recentHistory'
  | 'bloodPressure'
  | 'heartRate'
  | 'temperature'
  | 'weight'
  | 'oxygenSaturation'
  | 'normal'
  | 'high'
  | 'low'
  | 'uploadDocument'
  | 'storeManageDocuments'
  | 'noDocuments'
  | 'uploadMedicalDocuments'
  | 'labReport'
  | 'imaging'
  | 'referral'
  | 'document'
  | 'view'
  | 'download'
  | 'share'
  | 'delete'
  | 'uploaded'
  | 'vitalSigns'
  | 'upload'
  | 'no'

  // Notifications
  | 'markAllAsRead'
  | 'noNotificationsYet'
  | 'appointmentReminder'
  | 'prescriptionRefill'
  | 'labResultsReady'
  | 'insuranceClaim'
  | 'paymentDue'
  
  // Doctor Specializations
  | 'cardiologist'
  | 'dermatologist'
  | 'neurologist'
  | 'pediatrician'
  | 'orthopedist'
  | 'gynecologist'
  | 'ophthalmologist'
  | 'psychiatrist'
  | 'urologist'
  | 'endocrinologist'
  | 'gastroenterologist'
  | 'oncologist'
  | 'rheumatologist'
  | 'pulmonologist'
  | 'nephrologist'
  | 'generalPractitioner'
  | 'familyMedicine';

// Define the translations for each language
type TranslationsType = {
  [key in Language]: {
    [key in TranslationKey]: string;
  };
};

export const translations: TranslationsType = {
  en: {
    // Common
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    selectLanguage: 'Select Language',
    cancel: 'Cancel',
    logout: 'Logout',
    version: 'Version',
    personalInformation: 'Personal Information',
    privacyPolicy: 'Privacy & Policy',
    helpSupport: 'Help & Support',
    labReports: 'Lab Reports',
    moreItems: 'more items',
    
    // Roles
    patient: 'Patient',
    doctor: 'Doctor',
    pharmacist: 'Pharmacist',
    
    // Tab navigation - Patient
    home: 'Home',
    appointments: 'Appointments',
    newClaim: 'New Claim',
    records: 'Records',
    notifications: 'Notifications',
    
    // Tab navigation - Doctor
    dashboard: 'Dashboard',
    patients: 'Patients',
    schedule: 'Schedule',
    prescriptions: 'Prescriptions',
    profile: 'Profile',
    
    // Tab navigation - Pharmacist
    inventory: 'Inventory',
    
    // Profile - Patient
    medicalHistory: 'Medical History',
    insuranceInformation: 'Insurance Information',
    paymentMethods: 'Payment Methods',
    
    // Profile - Doctor
    medicalLicense: 'Medical License',
    specializations: 'Specializations',
    hospitalAffiliations: 'Hospital Affiliations',
    professionalSettings: 'Professional Settings',
    
    // Profile - Pharmacist
    pharmacyLicense: 'Pharmacy License',
    pharmacyAffiliations: 'Pharmacy Affiliations',
    inventoryPreferences: 'Inventory Preferences',

    // Patient Home Screen
    hello: 'Hello,',
    firstName: 'First Name',
    lastName: 'Last Name',
    bookAppointment: 'Book Appointment',
    medicalRecords: 'Medical Records',
    healthTips: 'Health Tips',
    insurance: 'Insurance',
    upcomingAppointments: 'Upcoming Appointments',
    activePrescriptions: 'Active Prescriptions',
    recentLabReports: 'Recent Lab Reports',
    seeAll: 'See All',
    noUpcomingAppointments: 'No upcoming appointments',
    bookNow: 'Book Now',
    noActivePrescriptions: 'No active prescriptions',
    noRecentLabReports: 'No recent lab reports',
    confirmed: 'confirmed',
    pending: 'pending',
    cancelled: 'cancelled',
    completed: 'completed',
    refills: 'Refills',
    orderedBy: 'Ordered by',
    expired: 'expired',
    all: 'All',

    // Medical Records Screen
    accessManageRecords: 'Access and manage all your health records in one place',
    viewCurrentPastMedications: 'View your current and past medications',
    accessLabResults: 'Access your laboratory test results',
    viewPastMedicalConditions: 'View your past medical conditions and treatments',
    trackVitalSigns: 'Track your blood pressure, heart rate, and more',
    manageAllergiesConditions: 'Manage your allergies and chronic conditions',
    accessUploadDocuments: 'Access and upload important medical documents',
    addCondition: 'Add Condition',
    noMedicalHistory: 'No Medical History',
    medicalHistoryWillAppear: 'Your medical history will appear here once you add conditions or visit healthcare providers.',
    diagnosed: 'Diagnosed',
    treatment: 'Treatment',
    active: 'Active',
    chronic: 'Chronic',
    resolved: 'Resolved',
    allergies: 'Allergies',
    conditions: 'Conditions',
    addAllergy: 'Add Allergy',
    noAllergiesRecorded: 'No Allergies Recorded',
    addKnownAllergies: 'Add your known allergies to help healthcare providers provide safer care.',
    noConditionsRecorded: 'No Conditions Recorded',
    addChronicConditions: 'Add your chronic conditions to help track your health better.',
    symptoms: 'Symptoms',
    notes: 'Notes',
    added: 'Added',
    medication: 'Medication',
    food: 'Food',
    environmental: 'Environmental',
    other: 'Other',
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',
    managed: 'Managed',
    recordVitals: 'Record Vitals',
    latestReadings: 'Latest Readings',
    recentHistory: 'Recent History',
    bloodPressure: 'Blood Pressure',
    heartRate: 'Heart Rate',
    temperature: 'Temperature',
    weight: 'Weight',
    oxygenSaturation: 'Oxygen Saturation',
    normal: 'Normal',
    high: 'High',
    low: 'Low',
    uploadDocument: 'Upload Document',
    storeManageDocuments: 'Store and manage your important medical documents',
    noDocuments: 'No Documents',
    uploadMedicalDocuments: 'Upload your medical documents to keep them organized and easily accessible.',
    labReport: 'Lab Report',
    imaging: 'Imaging',
    referral: 'Referral',
    document: 'Document',
    view: 'View',
    download: 'Download',
    share: 'Share',
    delete: 'Delete',
    uploaded: 'Uploaded',
    vitalSigns: 'Vital Signs',
    upload: 'Upload',
    no: 'No',

    // Notifications
    markAllAsRead: 'Mark all as read',
    noNotificationsYet: 'No notifications yet',
    appointmentReminder: 'Appointment Reminder',
    prescriptionRefill: 'Prescription Refill',
    labResultsReady: 'Lab Results Ready',
    insuranceClaim: 'Insurance Claim',
    paymentDue: 'Payment Due',
    
    // Doctor Specializations
    cardiologist: 'Cardiologist',
    dermatologist: 'Dermatologist',
    neurologist: 'Neurologist',
    pediatrician: 'Pediatrician',
    orthopedist: 'Orthopedist',
    gynecologist: 'Gynecologist',
    ophthalmologist: 'Ophthalmologist',
    psychiatrist: 'Psychiatrist',
    urologist: 'Urologist',
    endocrinologist: 'Endocrinologist',
    gastroenterologist: 'Gastroenterologist',
    oncologist: 'Oncologist',
    rheumatologist: 'Rheumatologist',
    pulmonologist: 'Pulmonologist',
    nephrologist: 'Nephrologist',
    generalPractitioner: 'General Practitioner',
    familyMedicine: 'Family Medicine'
  },
  
  si: {
    // Common
    language: 'භාෂාව',
    darkMode: 'අඳුරු මාදිලිය',
    lightMode: 'ආලෝක මාදිලිය',
    selectLanguage: 'භාෂාව තෝරන්න',
    cancel: 'අවලංගු කරන්න',
    logout: 'පිටවීම',
    version: 'අනුවාදය',
    personalInformation: 'පෞද්ගලික තොරතුරු',
    privacyPolicy: 'රහස්යතාව සහ ප්‍රතිපත්තිය',
    helpSupport: 'උපකාර සහ සහාය',
    labReports: 'රසායනාගාර වාර්තා',
    moreItems: 'තවත් අයිතම',
    
    // Roles
    patient: 'රෝගියා',
    doctor: 'වෛද්‍යවරයා',
    pharmacist: 'ඖෂධවේදියා',
    
    // Tab navigation - Patient
    home: 'මුල් පිටුව',
    appointments: 'හමුවීම්',
    newClaim: 'නව හිමිකම්',
    records: 'වාර්තා',
    notifications: 'දැනුම්දීම්',
    
    // Tab navigation - Doctor
    dashboard: 'උපකරණ පුවරුව',
    patients: 'රෝගීන්',
    schedule: 'කාලසටහන',
    prescriptions: 'බෙහෙත් වට්ටෝරු',
    profile: 'පැතිකඩ',
    
    // Tab navigation - Pharmacist
    inventory: 'තොග',
    
    // Profile - Patient
    medicalHistory: 'වෛද්‍ය ඉතිහාසය',
    insuranceInformation: 'රක්ෂණ තොරතුරු',
    paymentMethods: 'ගෙවීම් ක්‍රම',
    
    // Profile - Doctor
    medicalLicense: 'වෛද්‍ය බලපත්‍රය',
    specializations: 'විශේෂඥතා',
    hospitalAffiliations: 'රෝහල් අනුබද්ධතා',
    professionalSettings: 'වෘත්තීය සැකසුම්',
    
    // Profile - Pharmacist
    pharmacyLicense: 'ඖෂධ බලපත්‍රය',
    pharmacyAffiliations: 'ඖෂධාලය අනුබද්ධතා',
    inventoryPreferences: 'තොග මනාපයන්',

    // Patient Home Screen
    hello: 'ආයුබෝවන්,',
    firstName: 'මුල් නම',
    lastName: 'අවසන් නම',
    bookAppointment: 'හමුවීමක් වෙන් කරන්න',
    medicalRecords: 'වෛද්‍ය වාර්තා',
    healthTips: 'සෞඛ්‍ය උපදෙස්',
    insurance: 'රක්ෂණය',
    upcomingAppointments: 'ඉදිරි හමුවීම්',
    activePrescriptions: 'ක්‍රියාත්මක බෙහෙත් වට්ටෝරු',
    recentLabReports: 'මෑත රසායනාගාර වාර්තා',
    seeAll: 'සියල්ල බලන්න',
    noUpcomingAppointments: 'ඉදිරි හමුවීම් නැත',
    bookNow: 'දැන් වෙන් කරන්න',
    noActivePrescriptions: 'ක්‍රියාත්මක බෙහෙත් වට්ටෝරු නැත',
    noRecentLabReports: 'මෑත රසායනාගාර වාර්තා නැත',
    confirmed: 'තහවුරු කළ',
    pending: 'අපේක්ෂිත',
    cancelled: 'අවලංගු කළ',
    completed: 'සම්පූර්ණ කළ',
    refills: 'නැවත පිරවීම්',
    orderedBy: 'ඇණවුම් කළේ',
    expired: 'කල් ඉකුත් වූ',
    all: 'සියල්ල',

    // Medical Records Screen
    accessManageRecords: 'ඔබේ සියලුම සෞඛ්‍ය වාර්තා එක තැනකින් ප්‍රවේශ වී කළමනාකරණය කරන්න',
    viewCurrentPastMedications: 'ඔබේ වත්මන් සහ පසුගිය ඖෂධ බලන්න',
    accessLabResults: 'ඔබේ රසායනාගාර පරීක්ෂණ ප්‍රතිඵල වෙත ප්‍රවේශ වන්න',
    viewPastMedicalConditions: 'ඔබේ පසුගිය වෛද්‍ය තත්ත්වයන් සහ ප්‍රතිකාර බලන්න',
    trackVitalSigns: 'ඔබේ රුධිර පීඩනය, හෘද ස්පන්දන වේගය සහ තවත් දේ නිරීක්ෂණය කරන්න',
    manageAllergiesConditions: 'ඔබේ ආසාත්මිකතා සහ නිදන්ගත තත්ත්වයන් කළමනාකරණය කරන්න',
    accessUploadDocuments: 'වැදගත් වෛද්‍ය ලේඛන වෙත ප්‍රවේශ වී උඩුගත කරන්න',
    addCondition: 'තත්ත්වයක් එකතු කරන්න',
    noMedicalHistory: 'වෛද්‍ය ඉතිහාසයක් නැත',
    medicalHistoryWillAppear: 'ඔබ තත්ත්වයන් එකතු කළ විට හෝ සෞඛ්‍ය සේවා සපයන්නන් හමු වූ විට ඔබේ වෛද්‍ය ඉතිහාසය මෙහි දිස් වනු ඇත.',
    diagnosed: 'රෝග විනිශ්චය කළ',
    treatment: 'ප්‍රතිකාරය',
    active: 'ක්‍රියාකාරී',
    chronic: 'නිදන්ගත',
    resolved: 'විසඳුනු',
    allergies: 'ආසාත්මිකතා',
    conditions: 'තත්ත්වයන්',
    addAllergy: 'ආසාත්මිකතාවයක් එකතු කරන්න',
    noAllergiesRecorded: 'ආසාත්මිකතා වාර්තා කර නැත',
    addKnownAllergies: 'සෞඛ්‍ය සේවා සපයන්නන්ට වඩාත් ආරක්ෂිත සේවාවක් සැපයීමට උපකාර කිරීමට ඔබේ දන්නා ආසාත්මිකතා එකතු කරන්න.',
    noConditionsRecorded: 'තත්ත්වයන් වාර්තා කර නැත',
    addChronicConditions: 'ඔබේ සෞඛ්‍යය වඩා හොඳින් නිරීක්ෂණය කිරීමට උපකාර කිරීමට ඔබේ නිදන්ගත තත්ත්වයන් එකතු කරන්න.',
    symptoms: 'රෝග ලක්ෂණ',
    notes: 'සටහන්',
    added: 'එකතු කළ',
    medication: 'ඖෂධ',
    food: 'ආහාර',
    environmental: 'පාරිසරික',
    other: 'වෙනත්',
    mild: 'මෘදු',
    moderate: 'මධ්‍යස්ථ',
    severe: 'දරුණු',
    managed: 'කළමනාකරණය කළ',
    recordVitals: 'ප්‍රාණ ලක්ෂණ වාර්තා කරන්න',
    latestReadings: 'නවතම කියවීම්',
    recentHistory: 'මෑත ඉතිහාසය',
    bloodPressure: 'රුධිර පීඩනය',
    heartRate: 'හෘද ස්පන්දන වේගය',
    temperature: 'උෂ්ණත්වය',
    weight: 'බර',
    oxygenSaturation: 'ඔක්සිජන් සංතෘප්තිය',
    normal: 'සාමාන්‍ය',
    high: 'ඉහළ',
    low: 'පහළ',
    uploadDocument: 'ලේඛනයක් උඩුගත කරන්න',
    storeManageDocuments: 'ඔබේ වැදගත් වෛද්‍ය ලේඛන ගබඩා කර කළමනාකරණය කරන්න',
    noDocuments: 'ලේඛන නැත',
    uploadMedicalDocuments: 'ඔබේ වෛද්‍ය ලේඛන සංවිධානාත්මකව සහ පහසුවෙන් ප්‍රවේශ විය හැකි ලෙස තබා ගැනීමට උඩුගත කරන්න.',
    labReport: 'රසායනාගාර වාර්තාව',
    imaging: 'රූප ගැනීම',
    referral: 'යොමු කිරීම',
    document: 'ලේඛනය',
    view: 'බලන්න',
    download: 'බාගත කරන්න',
    share: 'බෙදාගන්න',
    delete: 'මකන්න',
    uploaded: 'උඩුගත කළ',
    vitalSigns: 'ප්‍රාණ ලක්ෂණ',
    upload: 'උඩුගත කරන්න',
    no: 'නැත',

    // Notifications
    markAllAsRead: 'සියල්ල කියවූ ලෙස සලකුණු කරන්න',
    noNotificationsYet: 'තවම දැනුම්දීම් නැත',
    appointmentReminder: 'හමුවීම් සිහිකැඳවීම',
    prescriptionRefill: 'බෙහෙත් වට්ටෝරු නැවත පිරවීම',
    labResultsReady: 'රසායනාගාර ප්‍රතිඵල සූදානම්',
    insuranceClaim: 'රක්ෂණ හිමිකම',
    paymentDue: 'ගෙවීම් නියමිත',
    
    // Doctor Specializations
    cardiologist: 'හෘද රෝග විශේෂඥ',
    dermatologist: 'චර්ම රෝග විශේෂඥ',
    neurologist: 'ස්නායු රෝග විශේෂඥ',
    pediatrician: 'ළමා රෝග විශේෂඥ',
    orthopedist: 'අස්ථි රෝග විශේෂඥ',
    gynecologist: 'නාරිවේද විශේෂඥ',
    ophthalmologist: 'අක්ෂි රෝග විශේෂඥ',
    psychiatrist: 'මානසික රෝග විශේෂඥ',
    urologist: 'මුත්‍රා රෝග විශේෂඥ',
    endocrinologist: 'අන්තඃස්‍රාවී විශේෂඥ',
    gastroenterologist: 'ආහාර ජීර්ණ පද්ධති රෝග විශේෂඥ',
    oncologist: 'පිළිකා රෝග විශේෂඥ',
    rheumatologist: 'වාත රෝග විශේෂඥ',
    pulmonologist: 'පෙනහළු රෝග විශේෂඥ',
    nephrologist: 'වකුගඩු රෝග විශේෂඥ',
    generalPractitioner: 'සාමාන්‍ය වෛද්‍යවරයා',
    familyMedicine: 'පවුල් වෛද්‍ය විශේෂඥ'
  },
  
  ta: {
    // Common
    language: 'மொழி',
    darkMode: 'இருள் பயன்முறை',
    lightMode: 'ஒளி பயன்முறை',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    cancel: 'ரத்து செய்',
    logout: 'வெளியேறு',
    version: 'பதிப்பு',
    personalInformation: 'தனிப்பட்ட தகவல்',
    privacyPolicy: 'தனியுரிமை & கொள்கை',
    helpSupport: 'உதவி & ஆதரவு',
    labReports: 'ஆய்வக அறிக்கைகள்',
    moreItems: 'மேலும் பொருட்கள்',
    
    // Roles
    patient: 'நோயாளி',
    doctor: 'மருத்துவர்',
    pharmacist: 'மருந்தாளுநர்',
    
    // Tab navigation - Patient
    home: 'முகப்பு',
    appointments: 'சந்திப்புகள்',
    newClaim: 'புதிய கோரிக்கை',
    records: 'பதிவுகள்',
    notifications: 'அறிவிப்புகள்',
    
    // Tab navigation - Doctor
    dashboard: 'டாஷ்போர்டு',
    patients: 'நோயாளிகள்',
    schedule: 'அட்டவணை',
    prescriptions: 'மருந்து சீட்டுகள்',
    profile: 'சுயவிவரம்',
    
    // Tab navigation - Pharmacist
    inventory: 'சரக்கு',
    
    // Profile - Patient
    medicalHistory: 'மருத்துவ வரலாறு',
    insuranceInformation: 'காப்பீட்டு தகவல்',
    paymentMethods: 'கட்டண முறைகள்',
    
    // Profile - Doctor
    medicalLicense: 'மருத்துவ உரிமம்',
    specializations: 'சிறப்புத் துறைகள்',
    hospitalAffiliations: 'மருத்துவமனை இணைப்புகள்',
    professionalSettings: 'தொழில்முறை அமைப்புகள்',
    
    // Profile - Pharmacist
    pharmacyLicense: 'மருந்தகம் உரிமம்',
    pharmacyAffiliations: 'மருந்தகம் இணைப்புகள்',
    inventoryPreferences: 'சரக்கு விருப்பங்கள்',

    // Patient Home Screen
    hello: 'வணக்கம்,',
    firstName: 'முதல் பெயர்',
    lastName: 'கடைசி பெயர்',
    bookAppointment: 'சந்திப்பை பதிவு செய்',
    medicalRecords: 'மருத்துவ பதிவுகள்',
    healthTips: 'ஆரோக்கிய குறிப்புகள்',
    insurance: 'காப்பீடு',
    upcomingAppointments: 'வரவிருக்கும் சந்திப்புகள்',
    activePrescriptions: 'செயலில் உள்ள மருந்து சீட்டுகள்',
    recentLabReports: 'சமீபத்திய ஆய்வக அறிக்கைகள்',
    seeAll: 'அனைத்தையும் காண்க',
    noUpcomingAppointments: 'வரவிருக்கும் சந்திப்புகள் இல்லை',
    bookNow: 'இப்போது பதிவு செய்',
    noActivePrescriptions: 'செயலில் உள்ள மருந்து சீட்டுகள் இல்லை',
    noRecentLabReports: 'சமீபத்திய ஆய்வக அறிக்கைகள் இல்லை',
    confirmed: 'உறுதிப்படுத்தப்பட்டது',
    pending: 'நிலுவையில் உள்ளது',
    cancelled: 'ரத்து செய்யப்பட்டது',
    completed: 'முடிக்கப்பட்டது',
    refills: 'மறுநிரப்புகள்',
    orderedBy: 'உத்தரவிட்டவர்',
    expired: 'காலாவதியானது',
    all: 'அனைத்தும்',

    // Medical Records Screen
    accessManageRecords: 'உங்கள் அனைத்து சுகாதார பதிவுகளையும் ஒரே இடத்தில் அணுகவும் நிர்வகிக்கவும்',
    viewCurrentPastMedications: 'உங்கள் தற்போதைய மற்றும் கடந்த மருந்துகளைப் பார்க்கவும்',
    accessLabResults: 'உங்கள் ஆய்வக சோதனை முடிவுகளை அணுகவும்',
    viewPastMedicalConditions: 'உங்கள் கடந்த மருத்துவ நிலைமைகள் மற்றும் சிகிச்சைகளைப் பார்க்கவும்',
    trackVitalSigns: 'உங்கள் இரத்த அழுத்தம், இதய துடிப்பு மற்றும் பலவற்றைக் கண்காணிக்கவும்',
    manageAllergiesConditions: 'உங்கள் ஒவ்வாமைகள் மற்றும் நாள்பட்ட நிலைமைகளை நிர்வகிக்கவும்',
    accessUploadDocuments: 'முக்கியமான மருத்துவ ஆவணங்களை அணுகவும் பதிவேற்றவும்',
    addCondition: 'நிலைமையைச் சேர்க்கவும்',
    noMedicalHistory: 'மருத்துவ வரலாறு இல்லை',
    medicalHistoryWillAppear: 'நீங்கள் நிலைமைகளைச் சேர்க்கும்போது அல்லது சுகாதார பராமரிப்பு வழங்குநர்களைப் பார்வையிடும்போது உங்கள் மருத்துவ வரலாறு இங்கே தோன்றும்.',
    diagnosed: 'கண்டறியப்பட்டது',
    treatment: 'சிகிச்சை',
    active: 'செயலில்',
    chronic: 'நாள்பட்ட',
    resolved: 'தீர்க்கப்பட்டது',
    allergies: 'ஒவ்வாமைகள்',
    conditions: 'நிலைமைகள்',
    addAllergy: 'ஒவ்வாமையைச் சேர்க்கவும்',
    noAllergiesRecorded: 'ஒவ்வாமைகள் பதிவு செய்யப்படவில்லை',
    addKnownAllergies: 'சுகாதார பராமரிப்பு வழங்குநர்கள் பாதுகாப்பான பராமரிப்பை வழங்க உதவ உங்களுக்குத் தெரிந்த ஒவ்வாமைகளைச் சேர்க்கவும்.',
    noConditionsRecorded: 'நிலைமைகள் பதிவு செய்யப்படவில்லை',
    addChronicConditions: 'உங்கள் ஆரோக்கியத்தை சிறப்பாக கண்காணிக்க உதவ உங்கள் நாள்பட்ட நிலைமைகளைச் சேர்க்கவும்.',
    symptoms: 'அறிகுறிகள்',
    notes: 'குறிப்புகள்',
    added: 'சேர்க்கப்பட்டது',
    medication: 'மருந்து',
    food: 'உணவு',
    environmental: 'சுற்றுச்சூழல்',
    other: 'மற்றவை',
    mild: 'லேசான',
    moderate: 'மிதமான',
    severe: 'கடுமையான',
    managed: 'நிர்வகிக்கப்பட்டது',
    recordVitals: 'உயிர்ச்சத்துக்களைப் பதிவு செய்',
    latestReadings: 'சமீபத்திய அளவீடுகள்',
    recentHistory: 'சமீபத்திய வரலாறு',
    bloodPressure: 'இரத்த அழுத்தம்',
    heartRate: 'இதய துடிப்பு',
    temperature: 'வெப்பநிலை',
    weight: 'எடை',
    oxygenSaturation: 'ஆக்சிஜன் செறிவு',
    normal: 'சாதாரண',
    high: 'உயர்',
    low: 'குறைந்த',
    uploadDocument: 'ஆவணத்தைப் பதிவேற்றவும்',
    storeManageDocuments: 'உங்கள் முக்கியமான மருத்துவ ஆவணங்களை சேமித்து நிர்வகிக்கவும்',
    noDocuments: 'ஆவணங்கள் இல்லை',
    uploadMedicalDocuments: 'உங்கள் மருத்துவ ஆவணங்களை ஒழுங்கமைத்து எளிதாக அணுகக்கூடியதாக வைத்திருக்க பதிவேற்றவும்.',
    labReport: 'ஆய்வக அறிக்கை',
    imaging: 'படமாக்கல்',
    referral: 'பரிந்துரை',
    document: 'ஆவணம்',
    view: 'பார்வை',
    download: 'பதிவிறக்கம்',
    share: 'பகிர்',
    delete: 'நீக்கு',
    uploaded: 'பதிவேற்றப்பட்டது',
    vitalSigns: 'உயிர்ச்சத்துக்கள்',
    upload: 'பதிவேற்று',
    no: 'இல்லை',

    // Notifications
    markAllAsRead: 'அனைத்தையும் படித்ததாகக் குறி',
    noNotificationsYet: 'இன்னும் அறிவிப்புகள் இல்லை',
    appointmentReminder: 'சந்திப்பு நினைவூட்டல்',
    prescriptionRefill: 'மருந்து சீட்டு மறுநிரப்பல்',
    labResultsReady: 'ஆய்வக முடிவுகள் தயார்',
    insuranceClaim: 'காப்பீட்டு கோரிக்கை',
    paymentDue: 'கட்டணம் நிலுவையில் உள்ளது',
    
    // Doctor Specializations
    cardiologist: 'இதய மருத்துவர்',
    dermatologist: 'தோல் மருத்துவர்',
    neurologist: 'நரம்பியல் மருத்துவர்',
    pediatrician: 'குழந்தை மருத்துவர்',
    orthopedist: 'எலும்பியல் மருத்துவர்',
    gynecologist: 'மகளிர் மருத்துவர்',
    ophthalmologist: 'கண் மருத்துவர்',
    psychiatrist: 'மனநல மருத்துவர்',
    urologist: 'சிறுநீரக மருத்துவர்',
    endocrinologist: 'நாளமில்லா சுரப்பி மருத்துவர்',
    gastroenterologist: 'இரைப்பை குடல் மருத்துவர்',
    oncologist: 'புற்றுநோய் மருத்துவர்',
    rheumatologist: 'மூட்டு வாத மருத்துவர்',
    pulmonologist: 'நுரையீரல் மருத்துவர்',
    nephrologist: 'சிறுநீரக மருத்துவர்',
    generalPractitioner: 'பொது மருத்துவர்',
    familyMedicine: 'குடும்ப மருத்துவர்'
  }
};