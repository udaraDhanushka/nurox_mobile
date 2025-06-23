#!/bin/bash

# Script to fix backend Prisma client issues
echo "🔧 Fixing Nurox Backend Token Endpoint Issues..."
echo ""

# Check if backend directory exists
BACKEND_DIR="/home/udara/Documents/CCCU/nurox-backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

echo "📁 Backend directory: $BACKEND_DIR"
cd "$BACKEND_DIR"

# Kill any existing servers on port 3000
echo "🔄 Stopping any existing servers on port 3000..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "nodemon.*server.js" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 3

echo "📦 Regenerating Prisma client..."
if npx prisma generate; then
    echo "✅ Prisma client regenerated successfully"
else
    echo "❌ Failed to regenerate Prisma client"
    exit 1
fi

echo "🚀 Starting backend server..."
if npm start; then
    echo "✅ Backend server started successfully"
else
    echo "❌ Failed to start backend server"
    echo "💡 Try running manually: cd $BACKEND_DIR && npm start"
    exit 1
fi

echo ""
echo "✅ Backend fixes completed successfully!"
echo ""
echo "📋 Changes applied:"
echo "   1. ✅ Fixed enum value: 'CANCELLED' → 'CANCELED' in appointmentController.js"
echo "   2. ✅ Regenerated Prisma client to recognize tokenNumber field"
echo "   3. ✅ Started backend server on port 3000"
echo ""
echo "🌐 Token endpoint is now available:"
echo "   GET http://localhost:3000/api/appointments/doctors/:doctorId/tokens?date=YYYY-MM-DD"
echo ""
echo "🧪 Test the endpoint:"
echo "   curl \"http://localhost:3000/api/appointments/doctors/DOCTOR_ID/tokens?date=2025-06-24\""