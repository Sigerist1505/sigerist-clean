# Email Diagnosis and Troubleshooting Guide

## Quick Diagnosis Commands

The SigeristLuxuryBags application now includes several diagnosis commands to help troubleshoot email and server configuration issues:

### Available Commands

1. **Basic Email Diagnosis**
   ```bash
   npm run diagnose:email
   ```
   - Checks environment variables
   - Tests email connection
   - Provides configuration guidance
   - Offers to send test email

2. **Comprehensive Diagnosis**
   ```bash
   npm run diagnose:complete
   ```
   - Server status check
   - Email configuration validation
   - API endpoint testing
   - Network connectivity analysis
   - Detailed troubleshooting recommendations

3. **Server Status Check**
   ```bash
   npm run diagnose:server
   ```
   - Quick health check
   - Email API status verification

4. **Manual API Testing**
   ```bash
   # Check server health
   curl http://localhost:5000/api/health
   
   # Check email configuration status
   curl http://localhost:5000/api/email/status
   
   # Send test email
   curl -X POST http://localhost:5000/api/test-email \
        -H "Content-Type: application/json" \
        -d '{"to":"your-email@example.com"}'
   ```

## Common Issues and Solutions

### 1. Port Configuration Mismatch

**Problem**: Server running on different port than expected
- User tries to access `localhost:5000` but server runs on `localhost:8080`

**Solution**: 
- Check your `.env` file's `PORT` setting
- In development, the default port is 5000
- In production, the default port is 3000
- If `PORT` environment variable is set, that value is used

**Configuration**:
```env
PORT=5000
NODE_ENV=development
```

### 2. Email Configuration Issues

**Problem**: Email service not working

**Solutions**:

For **Namecheap Private Email**:
```env
# Configuration A (recommended)
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Configuration B (alternative)
EMAIL_HOST=smtp.privateemail.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

### 3. Missing diagnose:email Script

**Problem**: `npm error Missing script: "diagnose:email"`

**Solutions**:
1. Ensure you're in the correct directory
2. Run `npm install` to ensure all dependencies are installed
3. Check that `package.json` contains the script (should be there now)
4. Try running directly: `node diagnose-email.mjs`

### 4. Connection Timeouts

**Problem**: `ETIMEOUT` or `ENOTFOUND` errors

**Solutions**:
1. Check internet connectivity
2. Try alternative hosts:
   - `mail.privateemail.com`
   - `smtp.namecheap.com`
3. Verify firewall settings
4. Test different ports (587, 465)

### 5. DKIM Configuration

**DKIM improves email deliverability**:
```env
DKIM_DOMAIN=sigeristluxurybags.com
DKIM_SELECTOR=default
DKIM_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
your-private-key-here
-----END RSA PRIVATE KEY-----"
```

## Environment Setup

Create a `.env` file with these settings:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sigerist_db

# Email Configuration
EMAIL_HOST=smtp.privateemail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=info@sigeristluxurybags.com
EMAIL_PASSWORD=your-password-here
EMAIL_FROM=info@sigeristluxurybags.com

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Optional: Use mock storage for testing without database
USE_MOCK_STORAGE=true

# Session
SESSION_SECRET=your-secure-session-secret

# Optional: DKIM for better deliverability
DKIM_DOMAIN=sigeristluxurybags.com
DKIM_SELECTOR=default
DKIM_PRIVATE_KEY="your-dkim-private-key"
```

## Testing Workflow

1. **Start with basic diagnosis**:
   ```bash
   npm run diagnose:email
   ```

2. **If server-related issues, run comprehensive check**:
   ```bash
   npm run diagnose:complete
   ```

3. **Verify server is accessible**:
   ```bash
   npm run diagnose:server
   ```

4. **Start the server if needed**:
   ```bash
   npm start
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health check: http://localhost:5000/api/health

## Troubleshooting Steps

1. **Check environment variables** are properly set
2. **Verify port configuration** matches your access attempts
3. **Test email connection** with different host configurations
4. **Ensure server is running** before testing API endpoints
5. **Check firewall/network settings** if connection issues persist
6. **Review logs** for specific error messages
7. **Try mock storage** if database connectivity is an issue

## Getting Help

If issues persist:
1. Review the detailed error messages from diagnosis scripts
2. Check the documentation files:
   - `EMAIL_SETUP.md`
   - `EMAIL_TROUBLESHOOTING.md`
   - `DKIM_SETUP.md`
3. Ensure all dependencies are installed: `npm install`
4. Try rebuilding: `npm run build`