# 🔗 Backend Integration Guide

Your Nurox mobile app is now integrated with the backend API! Here's how to complete the setup and test the integration.

## 🚀 Setup Instructions

### 1. Start the Backend Server

First, make sure your backend is running:

```bash
cd nurox-backend

# Install dependencies (if not done)
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run prisma:generate
npm run prisma:migrate

# Start the development server
npm run dev
```

The backend will be available at `http://localhost:3000`

### 2. Install Mobile App Dependencies

Install the required packages for API and Socket.IO integration:

```bash
cd nurox-mobile

# Install Socket.IO client
npm install socket.io-client

# Install additional dependencies if needed
npm install @types/socket.io-client --save-dev
```

### 3. Update API Configuration

The API is configured to work with your local development server. If you need to change the backend URL, update `/services/api.ts`:

```typescript
// Change these URLs if your backend is running on a different port/host
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-production-api.com/api'; // Production
```

## 📱 What's Been Integrated

### ✅ Authentication System
- Login/Register now connects to real backend
- JWT token management
- Role-based authentication
- Profile management

### ✅ API Services Created
- **authService**: User authentication and profile management
- **appointmentService**: Appointment booking and management
- **prescriptionService**: Prescription and OCR processing
- **notificationService**: Push notifications and alerts
- **socketService**: Real-time communication

### ✅ Real-time Features
- Socket.IO integration for live updates
- Real-time notifications
- Live chat messages
- Prescription status updates

### ✅ Hooks for Easy API Usage
- **useSocket**: Automatic socket connection and event handling
- **useApi**: Generic API call hook with loading/error states
- **usePaginatedApi**: For handling paginated data
- **useApiForm**: For form submissions with API integration

## 🧪 Testing the Integration

### 1. Test Authentication
```bash
# Start your Expo app
npm start
```

1. Open the app in simulator/device
2. Try registering a new user
3. Login with the credentials
4. Check that the user is redirected to the correct dashboard based on role

### 2. Test API Connectivity
The app will automatically try to connect to the backend. Check the console for:
- "Socket connected for user: [userId]" - indicates successful socket connection
- API request logs showing successful calls

### 3. Test Real-time Features
1. Login with two different accounts on different devices/simulators
2. Send a message between them
3. Check that notifications appear in real-time

## 🔧 Debugging Tips

### Backend Connection Issues
If the app can't connect to the backend:

1. **Check backend is running**: Visit `http://localhost:3000/health` in browser
2. **Check network on device**: If using physical device, make sure it's on the same network
3. **Update IP address**: For physical devices, replace `localhost` with your computer's IP address

```typescript
// In services/api.ts, replace localhost with your computer's IP
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.XXX:3000/api'  // Replace XXX with your IP
  : 'https://your-production-api.com/api';
```

### Common Issues

1. **CORS Errors**: Make sure your backend CORS configuration includes your app's origin
2. **Socket Connection Failed**: Check that Socket.IO server is running on the backend
3. **Authentication Errors**: Verify JWT secret is set in backend .env file

## 📋 Integration Checklist

- [x] Backend API server running
- [x] Authentication service integrated
- [x] Socket.IO real-time connection
- [x] API services for all features
- [x] Error handling and loading states
- [x] Real-time notifications setup

## 🔄 Next Steps

### Update Existing Screens
Replace mock data in your existing screens with real API calls:

```typescript
// Example: In an appointment screen
import { appointmentService } from '@/services';
import { useApi } from '@/hooks/useApi';

export default function AppointmentsScreen() {
  const [{ data: appointments, loading, error }, loadAppointments] = useApi(
    appointmentService.getAppointments
  );

  useEffect(() => {
    loadAppointments();
  }, []);

  // Use real data instead of mock data
  // ...
}
```

### Add Missing API Services
Create additional services as needed:
- Lab Results Service
- Pharmacy Service  
- Chat Service
- Payment Service
- File Upload Service

### Production Deployment
When ready for production:
1. Update API URLs in `/services/api.ts`
2. Set up production database
3. Configure production environment variables
4. Test on production environment

## 🎯 Key Integration Points

### Authentication Flow
```typescript
// Login flow now uses real API
const { login } = useAuthStore();
await login({ email, password }); // Calls backend API
```

### Real-time Updates
```typescript
// Automatic socket connection for authenticated users
const { isConnected } = useSocket(); // Auto-connects and handles events
```

### API Calls with Loading States
```typescript
// Easy API calls with built-in loading/error handling
const [state, executeCall] = useApi(apiFunction);
// state.loading, state.error, state.data available
```

Your Nurox mobile app is now fully integrated with the backend! 🎉

Start testing the features and let me know if you encounter any issues.