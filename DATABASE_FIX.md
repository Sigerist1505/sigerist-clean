# Database Schema Fix: Missing add_name_embroidery Column

## Problem
The production database is missing the `add_name_embroidery` column in the `cart_items` table, causing this error:
```
NeonDbError: column "add_name_embroidery" does not exist
```

## Root Cause
The application code expects this column (defined in `shared/schema.ts`) but it was not properly added to the production database during previous migrations.

## Solution Options

### Option 1: Run Specific Column Fix (Recommended)
This is the safest option for production:

```bash
# Set your database URL
export DATABASE_URL="your_neon_database_url"

# Run the focused fix
npm run fix:add-name-embroidery
```

### Option 2: Run Cart Items Migration
This runs the full cart items migration which includes the missing column:

```bash
export DATABASE_URL="your_neon_database_url"
npm run migrate:cart
```

### Option 3: Schema Audit (Diagnostic)
To check what columns are missing before fixing:

```bash
export DATABASE_URL="your_neon_database_url"
npm run audit:cart-schema
```

### Option 4: Drizzle Schema Push
Use Drizzle's built-in schema synchronization:

```bash
export DATABASE_URL="your_neon_database_url"
npm run db:push
```

### Option 5: Manual SQL (Direct Database Access)
If you have direct access to the Neon console:

```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
AND column_name = 'add_name_embroidery';

-- Add the column if it doesn't exist
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS add_name_embroidery BOOLEAN DEFAULT false NOT NULL;
```

## Verification
After running the fix, verify it worked by checking the application logs. The error:
```
Error fetching cart items by session: NeonDbError: column "add_name_embroidery" does not exist
```
should no longer appear.

## Files Created/Modified
- `fix-add-name-embroidery-column.js` - Focused migration script
- `audit-cart-schema.js` - Schema diagnostic tool
- `fix-add-name-embroidery.sql` - Manual SQL script
- `package.json` - Added convenience scripts

## Safety Notes
- All migration scripts use safe SQL patterns (`ADD COLUMN IF NOT EXISTS`, etc.)
- Scripts can be run multiple times without harm
- No data loss should occur as these only add missing columns
- Test in staging environment first if available