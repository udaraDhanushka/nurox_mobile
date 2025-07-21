#!/usr/bin/env node

/**
 * Script to detect the correct backend IP and update configuration files
 * Run this when you get network connection errors
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Common IP ranges to check
const IP_RANGES = [
  // Current machine's IP (try to detect dynamically)
  null, // Will be filled by IP detection
  // Common development IPs
  '192.168.1.100', '192.168.1.101', '192.168.1.102',
  '192.168.0.100', '192.168.0.101', '192.168.0.102',
  '10.0.0.100', '10.0.0.101', '10.0.0.102',
  '10.83.114.223', // Current detected IP
  // Docker and common ranges
  '172.17.0.1', '172.18.0.1',
  'localhost', '127.0.0.1'
];

// Files to update with new IP
const CONFIG_FILES = [
  {
    path: 'constants/api.ts',
    patterns: [
      { 
        regex: /(DEV_BASE_URL: 'http:\/\/)([^:]+)(:\d+\/api')/,
        replacement: '$1{{IP}}$3'
      },
      {
        regex: /(DEV_SOCKET_URL: 'http:\/\/)([^:]+)(:\d+')/,
        replacement: '$1{{IP}}$3'
      }
    ]
  },
  {
    path: 'constants/config.ts',
    patterns: [
      {
        regex: /(BASE_URL: isDevelopment\s*\?\s*'http:\/\/)([^:]+)(:\d+\/api')/,
        replacement: '$1{{IP}}$3'
      }
    ]
  },
  {
    path: 'config/payhere.ts',
    patterns: [
      {
        regex: /(notifyURL: 'http:\/\/)([^:]+)(:\d+\/api\/payments\/payhere-webhook')/,
        replacement: '$1{{IP}}$3'
      }
    ]
  },
  {
    path: 'debug-login.js',
    patterns: [
      {
        regex: /(fetch\('http:\/\/)([^:]+)(:\d+\/api\/auth\/login')/,
        replacement: '$1{{IP}}$3'
      }
    ]
  }
];

/**
 * Get current machine's IP address
 */
function getCurrentIP() {
  return new Promise((resolve, reject) => {
    // Try multiple methods to get IP
    const methods = [
      // Method 1: ip route (Linux/macOS)
      () => spawn('sh', ['-c', 'ip route get 1 | awk \'{print $7; exit}\'']),
      // Method 2: ifconfig (macOS/Linux)
      () => spawn('sh', ['-c', 'ifconfig | grep -E "inet.*broadcast" | head -n1 | awk \'{print $2}\'']),
      // Method 3: hostname (cross-platform)
      () => spawn('hostname', ['-I']),
    ];

    let methodIndex = 0;

    function tryNextMethod() {
      if (methodIndex >= methods.length) {
        reject(new Error('Could not detect IP address'));
        return;
      }

      const process = methods[methodIndex]();
      let output = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0 && output.trim()) {
          const ip = output.trim().split(' ')[0];
          if (ip && ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            resolve(ip);
            return;
          }
        }
        methodIndex++;
        tryNextMethod();
      });

      process.on('error', () => {
        methodIndex++;
        tryNextMethod();
      });
    }

    tryNextMethod();
  });
}

/**
 * Test if backend is reachable at given IP
 */
function testBackendIP(ip, timeout = 3000) {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    
    // Use curl to test the health endpoint
    const curl = spawn('curl', [
      '-I',
      `http://${ip}:3000/health`,
      '--connect-timeout', '3',
      '--max-time', '5',
      '--silent'
    ]);

    let output = '';
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });

    curl.on('close', (code) => {
      const isReachable = code === 0 && output.includes('200 OK');
      resolve({ ip, isReachable, response: output });
    });

    curl.on('error', () => {
      resolve({ ip, isReachable: false, response: '' });
    });

    // Timeout fallback
    setTimeout(() => {
      curl.kill();
      resolve({ ip, isReachable: false, response: 'timeout' });
    }, timeout);
  });
}

/**
 * Update configuration files with new IP
 */
function updateConfigFiles(newIP) {
  console.log(`\n📝 Updating configuration files with IP: ${newIP}`);
  
  let updatedFiles = 0;

  for (const config of CONFIG_FILES) {
    const filePath = path.join(__dirname, '..', config.path);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${config.path}`);
      continue;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let fileUpdated = false;

      for (const pattern of config.patterns) {
        const newContent = content.replace(pattern.regex, pattern.replacement.replace('{{IP}}', newIP));
        if (newContent !== content) {
          content = newContent;
          fileUpdated = true;
        }
      }

      if (fileUpdated) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated: ${config.path}`);
        updatedFiles++;
      } else {
        console.log(`📋 No changes needed: ${config.path}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${config.path}:`, error.message);
    }
  }

  return updatedFiles;
}

/**
 * Main detection and update process
 */
async function main() {
  console.log('🔍 Detecting backend IP address...\n');

  try {
    // Get current machine IP
    const currentIP = await getCurrentIP();
    console.log(`💻 Current machine IP: ${currentIP}`);
    
    // Add current IP to the beginning of the list
    IP_RANGES[0] = currentIP;
  } catch (error) {
    console.log('⚠️  Could not detect current IP, using fallbacks');
  }

  // Remove null entries and duplicates
  const ipsToTest = [...new Set(IP_RANGES.filter(ip => ip))];
  
  console.log(`🧪 Testing ${ipsToTest.length} potential backend IPs...\n`);

  // Test all IPs in parallel
  const testPromises = ipsToTest.map(ip => testBackendIP(ip));
  const results = await Promise.allSettled(testPromises);

  // Find working IPs
  const workingIPs = results
    .map((result, index) => ({ ...result.value, index }))
    .filter(result => result && result.isReachable);

  if (workingIPs.length === 0) {
    console.log('❌ No working backend found at any IP address');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure the backend server is running on port 3000');
    console.log('   2. Check if the backend is bound to 0.0.0.0 (not just localhost)');
    console.log('   3. Verify firewall settings allow connections on port 3000');
    console.log('   4. Try running: cd ../nurox-backend && npm start');
    process.exit(1);
  }

  // Use the first working IP
  const workingIP = workingIPs[0];
  console.log(`✅ Backend found at: ${workingIP.ip}`);

  if (workingIPs.length > 1) {
    console.log(`📋 Other working IPs: ${workingIPs.slice(1).map(r => r.ip).join(', ')}`);
  }

  // Update configuration files
  const updatedCount = updateConfigFiles(workingIP.ip);

  console.log(`\n🎉 Detection complete!`);
  console.log(`   - Backend IP: ${workingIP.ip}`);
  console.log(`   - Files updated: ${updatedCount}`);
  console.log(`\n🚀 You can now restart your development server`);
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
} else {
  // Export for use as module
  module.exports = {
    getCurrentIP,
    testBackendIP,
    updateConfigFiles,
    main
  };
}