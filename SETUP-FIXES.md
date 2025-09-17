# Setup Fixes for Common 404/400 Errors

This document explains how to fix the common 404 and 400 errors you might encounter when running the application.

## ✅ Fixed Issues

### 1. Missing Images (404 errors for iphone1.jpg, image1.jpg, etc.)
**Status: FIXED**
- Created `/public` directory with placeholder images
- Added product images, banners, and social media images
- All image references now have fallback placeholders

### 2. Missing Database Functions (404 error for get_user_stats)
**Status: REQUIRES SETUP**

The `get_user_stats` function is a Supabase RPC that needs to be created in your database.

**To fix:**
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the script: `/workspace/scripts/setup-database-functions.sql`

**What this fixes:**
- User statistics in account pages
- Dashboard analytics
- Profile completion data

## ✅ Additional Fixed Issues

### 3. API Route Errors (404 for /api/products, /api/orders)
**Status: FIXED**
- Created API routes at `/app/api/products/route.ts` and `/app/api/orders/route.ts`
- Routes proxy requests to the appropriate services
- Support GET and POST methods with proper error handling

### 4. Orders API 400 Error
**Status: FIXED**
- API route now validates required fields
- Proper error messages for missing data
- Handles both order creation and retrieval

## 🚀 Quick Setup Commands

```bash
# 1. Ensure public directory exists (already done)
ls -la public/images/

# 2. Set up database functions
# Copy the content of scripts/setup-database-functions.sql
# and run it in your Supabase SQL Editor

# 3. Check for any remaining API references
grep -r "fetch.*api" . --exclude-dir=node_modules
```

## 📋 Verification Steps

After applying fixes:

1. **Images**: Check that placeholder images load correctly
   - Visit `/iphone1.jpg` and `/image1.jpg` - should show placeholders
   - Check product images in `/images/products/`

2. **Database Functions**: Test user stats in account page
   - Run the SQL script in Supabase
   - Check account page for user statistics

3. **API Routes**: Verify no more 404 errors for API endpoints
   - Test `/api/health` for system status
   - Test `/api/products` for product data
   - Test `/api/orders` for order operations

4. **Orders**: Test order creation and viewing
   - Try creating an order through the checkout process
   - View orders in the account section

## 🔍 Debugging Tips

If you still see errors:

1. **Check browser console** for detailed error messages
2. **Check Supabase logs** for database function errors
3. **Check Network tab** to see exact requests being made
4. **Verify environment variables** are set correctly

## 📝 Notes

- All placeholder images are SVG-based for lightweight loading
- Database functions include proper RLS policies
- Images use semantic naming for easy identification
- Functions are marked as SECURITY DEFINER for proper access control