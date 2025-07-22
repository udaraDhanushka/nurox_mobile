#!/bin/bash

echo "🔄 Restarting Backend Server with Updated Validation..."

# Kill any existing processes
pkill -f "node.*server.js" 2>/dev/null || true
sleep 2

# Navigate to backend and start server
pushd ../nurox-backend > /dev/null

echo "🚀 Starting backend server..."
nohup npm start > server.log 2>&1 &

# Wait a moment for startup
sleep 3

# Check if server started
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Backend server started successfully!"
    echo "📋 Validation schema now includes 'location' field"
    echo "🌐 Server running on http://localhost:3000"
else
    echo "❌ Failed to start backend server"
    echo "📄 Check server.log for details"
fi

popd > /dev/null