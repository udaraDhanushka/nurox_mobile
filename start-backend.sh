#!/bin/bash

echo "🚀 Starting Nurox Backend Server..."
echo ""

# Navigate to backend directory
pushd ../nurox-backend > /dev/null

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in backend directory"
    popd > /dev/null
    exit 1
fi

# Kill any processes using port 3000
echo "🔄 Cleaning up port 3000..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "nodemon.*server.js" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start the server
echo "🌟 Starting server..."
npm start

popd > /dev/null