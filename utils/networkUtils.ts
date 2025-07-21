import { Platform } from 'react-native';

// Optional NetInfo import - will gracefully handle if not installed
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo');
} catch (error) {
  console.log('NetInfo not available - continuing without network details');
}

/**
 * Dynamic IP detection and network utilities
 */

// Fallback IP addresses to try in order of preference
const FALLBACK_IPS = [
  '10.83.114.223', // Current detected IP
  '192.168.0.102', // Previous IP
  '192.168.1.100', // Common router IP range
  '10.0.0.100',    // Alternative common range
  'localhost',     // Last resort for simulators
];

// Cache for detected working IP
let cachedWorkingIP: string | null = null;
let lastDetectionTime = 0;
const DETECTION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Test if an IP address is reachable
 */
async function testIPAddress(ip: string, port: number = 3000, timeout: number = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`http://${ip}:${port}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Detect the working backend IP address
 */
export async function detectBackendIP(): Promise<string> {
  const now = Date.now();
  
  // Return cached IP if still valid
  if (cachedWorkingIP && (now - lastDetectionTime) < DETECTION_CACHE_DURATION) {
    return cachedWorkingIP;
  }

  console.log('🔍 Detecting backend IP address...');

  // Test IPs in parallel for faster detection
  const testPromises = FALLBACK_IPS.map(async (ip) => {
    const isReachable = await testIPAddress(ip);
    return { ip, isReachable };
  });

  const results = await Promise.allSettled(testPromises);
  
  // Find the first working IP
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.isReachable) {
      const workingIP = result.value.ip;
      console.log(`✅ Backend found at: ${workingIP}`);
      
      // Cache the working IP
      cachedWorkingIP = workingIP;
      lastDetectionTime = now;
      
      return workingIP;
    }
  }

  // If no IP works, return the first fallback and log warning
  const fallbackIP = FALLBACK_IPS[0];
  console.warn(`⚠️ No backend found, using fallback: ${fallbackIP}`);
  return fallbackIP;
}

/**
 * Get the dynamic API base URL
 */
export async function getDynamicAPIBaseURL(): Promise<string> {
  if (__DEV__) {
    const ip = await detectBackendIP();
    return `http://${ip}:3000/api`;
  } else {
    return 'https://your-production-api.com/api';
  }
}

/**
 * Get the dynamic Socket URL
 */
export async function getDynamicSocketURL(): Promise<string> {
  if (__DEV__) {
    const ip = await detectBackendIP();
    return `http://${ip}:3000`;
  } else {
    return 'https://your-production-api.com';
  }
}

/**
 * Get current network information
 */
export async function getNetworkInfo() {
  try {
    if (!NetInfo) {
      return {
        isConnected: true, // Assume connected if NetInfo not available
        type: 'unknown',
        isInternetReachable: true,
        details: null,
      };
    }

    const netInfo = await NetInfo.fetch();
    return {
      isConnected: netInfo.isConnected,
      type: netInfo.type,
      isInternetReachable: netInfo.isInternetReachable,
      details: netInfo.details,
    };
  } catch (error) {
    console.error('Failed to get network info:', error);
    return {
      isConnected: true, // Assume connected on error
      type: 'unknown',
      isInternetReachable: true,
      details: null,
    };
  }
}

/**
 * Check if the app can reach the backend
 */
export async function checkBackendConnectivity(): Promise<{
  isReachable: boolean;
  ip: string;
  responseTime?: number;
}> {
  const startTime = Date.now();
  const ip = await detectBackendIP();
  const isReachable = await testIPAddress(ip);
  const responseTime = Date.now() - startTime;

  return {
    isReachable,
    ip,
    responseTime: isReachable ? responseTime : undefined,
  };
}

/**
 * Initialize network detection on app start
 */
export async function initializeNetworkDetection(): Promise<void> {
  console.log('🚀 Initializing network detection...');
  
  const networkInfo = await getNetworkInfo();
  console.log('📶 Network Info:', {
    connected: networkInfo.isConnected,
    type: networkInfo.type,
    internet: networkInfo.isInternetReachable,
  });

  const backendInfo = await checkBackendConnectivity();
  console.log('🔗 Backend Connectivity:', {
    reachable: backendInfo.isReachable,
    ip: backendInfo.ip,
    responseTime: backendInfo.responseTime ? `${backendInfo.responseTime}ms` : 'N/A',
  });

  if (!backendInfo.isReachable) {
    console.warn('⚠️ Backend is not reachable. App may not function correctly.');
  }
}

/**
 * Force refresh the cached IP (useful for debugging)
 */
export function refreshIPCache(): void {
  cachedWorkingIP = null;
  lastDetectionTime = 0;
  console.log('🔄 IP cache refreshed');
}

/**
 * Get debug information
 */
export async function getNetworkDebugInfo() {
  const networkInfo = await getNetworkInfo();
  const backendInfo = await checkBackendConnectivity();
  
  return {
    platform: Platform.OS,
    networkInfo,
    backendInfo,
    cachedIP: cachedWorkingIP,
    cacheAge: cachedWorkingIP ? Date.now() - lastDetectionTime : null,
    fallbackIPs: FALLBACK_IPS,
  };
}