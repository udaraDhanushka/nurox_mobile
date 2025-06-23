#!/bin/bash

# Navigate to backend and regenerate Prisma client
echo "🔧 Regenerating Prisma Client for Backend..."

# Use pushd to change directory temporarily
pushd ../nurox-backend > /dev/null

echo "📦 Running: npx prisma generate"
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client regenerated successfully!"
    echo ""
    echo "🔍 Checking generated client..."
    if [ -f "node_modules/.prisma/client/index.js" ]; then
        echo "✅ Prisma client files found"
    else
        echo "⚠️  Prisma client files not found in expected location"
    fi
else
    echo "❌ Failed to regenerate Prisma client"
fi

# Return to original directory
popd > /dev/null

echo ""
echo "📋 Next steps:"
echo "1. Start the backend server: cd ../nurox-backend && npm start"
echo "2. Test the token endpoint with a valid doctor ID"
echo ""
echo "🌐 Token endpoint will be available at:"
echo "   GET http://localhost:3000/api/appointments/doctors/:doctorId/tokens?date=YYYY-MM-DD"