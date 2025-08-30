# 📧 Email Troubleshooting Guide - SigeristLuxuryBags

## Quick Fix for "Emails Not Being Sent"

If your system is working but emails are not being sent, follow these steps:

### Step 1: Check Email Configuration

Run the diagnostic tool:
```bash
npm run diagnose:email
```

### Step 2: Configure Email Variables

If the diagnostic shows missing variables, update your `.env` file with:

```env
# Namecheap Private Email Configuration
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@sigeristluxurybags.com
EMAIL_PASSWORD=your-actual-email-password-here
EMAIL_FROM=info@sigeristluxurybags.com
```

**Important:** Replace `your-actual-email-password-here` with your real Namecheap email password.

### Step 3: Alternative Configuration

If the above doesn't work, try:

```env
EMAIL_HOST=smtp.privateemail.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

### Step 4: Test Email Configuration

Use the API endpoints to test:

```bash
# Check email status
curl http://localhost:5000/api/email/status

# Send test email
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-test-email@gmail.com"}'
```

## Common Issues and Solutions

### 1. "Email service not configured"
- **Cause:** Missing environment variables
- **Solution:** Follow Step 2 above

### 2. "Connection refused"
- **Cause:** Wrong host or port
- **Solution:** Try alternative configuration in Step 3

### 3. "Authentication failed"
- **Cause:** Wrong username or password
- **Solution:** 
  - Verify EMAIL_USER is correct (should be your full email)
  - Verify EMAIL_PASSWORD is your email account password
  - Check if 2FA is enabled (may need app-specific password)

### 4. Emails sent but not received
- **Cause:** Emails going to spam
- **Solution:**
  1. Check spam/junk folder
  2. Add sender to whitelist
  3. Configure SPF/DKIM records in Namecheap
  4. Test with different email providers

## Testing Steps

1. **Run diagnostics:**
   ```bash
   npm run diagnose:email
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Test registration email:**
   - Register a new account on the website
   - Check if welcome email arrives

4. **Test password reset:**
   - Use "Forgot Password" feature
   - Check if reset code email arrives

5. **Test API endpoints:**
   ```bash
   # Check status
   curl http://localhost:5000/api/email/status
   
   # Send test email
   curl -X POST http://localhost:5000/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"to": "test@example.com"}'
   ```

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| EMAIL_HOST | Yes | `mail.privateemail.com` | SMTP server host |
| EMAIL_PORT | Yes | `587` | SMTP server port |
| EMAIL_USER | Yes | `info@sigeristluxurybags.com` | Email username |
| EMAIL_PASSWORD | Yes | `your-password` | Email password |
| EMAIL_FROM | No | `info@sigeristluxurybags.com` | From address |
| EMAIL_SECURE | No | `false` | Use SSL/TLS |

## Getting Help

If emails still don't work after following this guide:

1. **Check server logs** for detailed error messages
2. **Contact Namecheap support** to verify email account status
3. **Try different email providers** for testing
4. **Check firewall/network settings** that might block SMTP

## Recent Changes

✅ Added `/api/email/status` endpoint for configuration checking
✅ Added `/api/test-email` endpoint for testing emails
✅ Added `npm run diagnose:email` command
✅ Improved error logging and debugging
✅ Added detailed troubleshooting guide

The email system is fully implemented and just needs proper configuration!