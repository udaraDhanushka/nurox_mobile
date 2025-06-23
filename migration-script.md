# Database Migration for Token Number Support

## Steps to Add Token Number Support to Backend

### 1. Navigate to Backend Directory
```bash
cd /home/udara/Documents/CCCU/nurox-backend
```

### 2. Generate and Run Migration
```bash
# Generate migration for the schema changes
npx prisma migrate dev --name add_token_number_to_appointments

# Generate Prisma client with new schema
npx prisma generate
```

### 3. Verify Migration
```bash
# Check migration was created
ls prisma/migrations/

# Check database schema
npx prisma db pull
```

### 4. Restart Backend Server
```bash
# If running with npm
npm restart

# If running with pm2
pm2 restart nurox-backend

# If running manually
node src/server.js
```

## Alternative Manual Migration (if needed)

If automated migration fails, you can run this SQL directly on your database:

```sql
-- Add tokenNumber column to appointments table
ALTER TABLE appointments ADD COLUMN tokenNumber INTEGER;

-- Add index for better performance on token queries
CREATE INDEX idx_appointments_token_doctor_date 
ON appointments(doctorId, DATE(appointmentDate), tokenNumber) 
WHERE tokenNumber IS NOT NULL;
```

## Verification Steps

1. Test appointment creation with token number from mobile app
2. Check that token numbers appear in database
3. Verify token availability queries work correctly
4. Test appointment updates with token number changes

## Database Schema Changes Made

- Added `tokenNumber Int?` to Appointment model in `prisma/schema.prisma`
- Updated appointment controller to handle tokenNumber in create/update operations
- Added validation for tokenNumber field (1-100 range)
- Backend now stores and returns token numbers in all appointment operations