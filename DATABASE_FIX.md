# Database Schema Fix: Missing Cart Columns

## Problem
The production database is missing critical columns in the `cart_items` table, causing these errors:
```
NeonDbError: column "add_name_embroidery" does not exist
NeonDbError: column "name_personalization" does not exist
```

## Root Cause
1. The `add_name_embroidery` column was not properly added to the production database during previous migrations
2. The client code was sending `namePersonalization` field which doesn't exist in the database schema

## Fixes Applied

### Client-Side Fix (Code Changes)
- ✅ Removed `namePersonalization` field from client interfaces and components
- ✅ Fixed cart data structure to match database schema exactly
- ✅ Updated TypeScript interfaces to prevent future mismatches

### Database Fix Options

#### Option 1: Run Comprehensive Cart Fix (Recommended)
This is the safest option that fixes all cart schema issues:

```bash
# Set your database URL
export DATABASE_URL="your_neon_database_url"

# Run the comprehensive fix
npm run fix:cart-schema
```

#### Option 2: Run Specific Column Fix
For the specific `add_name_embroidery` column only:

```bash
export DATABASE_URL="your_neon_database_url"
npm run fix:add-name-embroidery
```

#### Option 3: Manual SQL Fix
Execute this SQL directly in your Neon console:

```sql
-- Add missing add_name_embroidery column
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS add_name_embroidery BOOLEAN DEFAULT false NOT NULL;

-- Verify the column was added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
AND column_name = 'add_name_embroidery';
```

#### Option 4: Run Cart Items Migration
Full cart items migration (includes all columns):

```bash
export DATABASE_URL="your_neon_database_url"
npm run migrate:cart
```

## Verification
After running any fix, verify it worked by:

1. **Check application logs** - These errors should no longer appear:
   ```
   Error fetching cart items by session: NeonDbError: column "add_name_embroidery" does not exist
   Error adding cart item: NeonDbError: column "name_personalization" does not exist
   ```

2. **Test cart functionality**:
   - Add products to cart ✅
   - View cart items ✅
   - Update quantities ✅
   - Proceed to checkout ✅

## Files Created/Modified
- ✅ `comprehensive-cart-fix.js` - Complete schema fix script
- ✅ `fix-cart-schema.sql` - Manual SQL script
- ✅ `fix-add-name-embroidery-column.js` - Specific column fix
- ✅ `audit-cart-schema.js` - Schema diagnostic tool
- ✅ `package.json` - Added `fix:cart-schema` script
- ✅ Client-side components - Removed `namePersonalization` references

## Safety Notes
- ✅ All migration scripts use safe SQL patterns (`ADD COLUMN IF NOT EXISTS`, etc.)
- ✅ Scripts can be run multiple times without harm
- ✅ No data loss will occur as these only add missing columns
- ✅ Client code changes are backward compatible