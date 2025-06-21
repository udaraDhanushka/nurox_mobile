import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_CONFIG } from '../constants/api';

const SOCKET_URL = __DEV__ 
  ? API_CONFIG.DEV_SOCKET_URL  // Development - Use network IP for mobile devices
  : API_CONFIG.PROD_SOCKET_URL; // Production

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isConnecting = false;

  async connect(userId: string): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.userId = userId;

    try {
      // Get auth token
      const authData = await AsyncStorage.getItem('auth-storage');
      let token = null;
      
      if (authData) {
        const parsed = JSON.parse(authData);
        token = parsed.state?.token;
      }

      // Create socket connection
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
          userId
        },
        transports: ['polling', 'websocket'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        forceNew: true,
      });

      this.setupEventListeners();
      
      // Join user room for notifications
      this.socket.emit('join', userId);
      
      console.log('Initiating socket connection for user:', userId);
      console.log('Using socket URL:', SOCKET_URL);
    } catch (error) {
      console.error('Socket connection error:', error);
    } finally {
      this.isConnecting = false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      console.log('Transport used:', this.socket?.io.engine?.transport?.name);
      console.log('Socket ID:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      
      // Rejoin user room on reconnection
      if (this.userId) {
        this.socket?.emit('join', this.userId);
        console.log('Joined user room:', this.userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        description: error.description,
        context: error.context,
        transport: this.socket?.io.engine?.transport?.name
      });
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        console.log('Final transport used:', this.socket?.io.engine?.transport?.name);
        this.isConnecting = false;
        this.socket?.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Notification listeners
  onNewNotification(callback: (notification: any) => void): void {
    this.socket?.on('new_notification', callback);
  }

  offNewNotification(): void {
    this.socket?.off('new_notification');
  }

  // Chat message listeners
  onNewMessage(callback: (message: any) => void): void {
    this.socket?.on('new_message', callback);
  }

  offNewMessage(): void {
    this.socket?.off('new_message');
  }

  // Prescription update listeners
  onPrescriptionUpdate(callback: (data: any) => void): void {
    this.socket?.on('prescription_updated', callback);
  }

  offPrescriptionUpdate(): void {
    this.socket?.off('prescription_updated');
  }

  // Send chat message
  sendMessage(data: {
    receiverId: string;
    message: string;
    attachments?: string[];
    metadata?: any;
  }): void {
    this.socket?.emit('send_message', data);
  }

  // Send notification
  sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): void {
    this.socket?.emit('send_notification', data);
  }

  // Send prescription update
  sendPrescriptionUpdate(data: {
    userId: string;
    prescriptionId: string;
    status: string;
    message?: string;
  }): void {
    this.socket?.emit('prescription_update', data);
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Remove all listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Rejoin user room (useful after authentication)
  rejoinUserRoom(userId: string): void {
    this.userId = userId;
    if (this.socket?.connected) {
      this.socket.emit('join', userId);
    }
  }
}

// Create and export socket service instance
export const socketService = new SocketService();
export default socketService;