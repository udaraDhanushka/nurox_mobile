// Export all services from a central location
export { api, checkApiHealth } from './api';
export { authService } from './authService';
export { appointmentService } from './appointmentService';
export { prescriptionService } from './prescriptionService';
export { notificationService } from './notificationService';
export { socketService } from './socketService';
export { medicineService } from './medicineService';
export { testService } from './testService';

// You can add more services here as you create them:
// export { labResultService } from './labResultService';
// export { pharmacyService } from './pharmacyService';
// export { chatService } from './chatService';
// export { paymentService } from './paymentService';
// export { fileService } from './fileService';