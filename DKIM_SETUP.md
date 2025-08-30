# 🔐 DKIM Configuration for SigeristLuxuryBags

## What is DKIM?

DKIM (DomainKeys Identified Mail) is an email authentication method that allows the receiver to check that an email was indeed sent and authorized by the owner of the domain. It adds a digital signature to your emails, significantly improving email deliverability and preventing your emails from being marked as spam.

## Why DKIM is Important

✅ **Better Email Deliverability** - Major email providers (Gmail, Outlook, etc.) prefer DKIM-signed emails
✅ **Spam Prevention** - Reduces chances of emails ending up in spam folders
✅ **Brand Protection** - Prevents email spoofing using your domain
✅ **Professional Reputation** - Shows you follow email security best practices

## DKIM Configuration for SigeristLuxuryBags

### Step 1: DNS Configuration

You need to add a DNS TXT record to your domain `sigeristluxurybags.com`:

**Record Details:**
- **Type**: TXT
- **Name**: `default._domainkey` (or `default._domainkey.sigeristluxurybags.com`)
- **Value**: `"v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwPQ768gJQnO/uV1GpwXC4Jq1d7zgI25YP1OoN5EcwJ16Ak+jRmLIT2B3C8HAdbagtJDuWaC2IL2AKxHkLDoC4QytRWVYkAIuaAKEt7vs4ZUTpuRpjAmGSus0d3jX4b4wX2htzLTqa6NKLjPR9hII0VbKP0g0yeC6AheIcs46BaDNkddUPzr5fv9HtQDNe1cMSVZWEhKggVR2kTzJNaS0ray+bcWmiXysHf1MJlARdxHJ1CtZS2JCXhTqALqCyuQNBHNl+9IfWTQQqKn6rTi0Ur4vNQBGMKBrLovtK9y/pr7g6kTrTs75kyxVGZiqc9S8sC1ApuqFT0SEq///Cyjk4wIDAQAB"`

### Step 2: Environment Variables

Add these variables to your `.env` file:

```env
# DKIM Configuration (Optional - for better email deliverability)
DKIM_DOMAIN=sigeristluxurybags.com
DKIM_SELECTOR=default
DKIM_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT_HERE
-----END RSA PRIVATE KEY-----"
```

**Important Notes:**
- Replace `YOUR_PRIVATE_KEY_CONTENT_HERE` with your actual DKIM private key
- The private key should include the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` headers
- Use escaped newlines (`\n`) if putting the key on a single line

### Step 3: Verify Configuration

1. **Test DNS Record**:
   ```bash
   # Check if DNS record is properly set
   nslookup -q=TXT default._domainkey.sigeristluxurybags.com
   ```

2. **Test Email Configuration**:
   ```bash
   # Run email diagnostics
   npm run diagnose:email
   ```

3. **Send Test Email**:
   ```bash
   # Test complete email functionality
   curl -X POST http://localhost:5000/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"to": "your-email@gmail.com"}'
   ```

### Step 4: Verify DKIM Signing

1. **Send a test email** using the system
2. **Check email headers** in the received email
3. **Look for DKIM-Signature header** - should be present if working correctly
4. **Use email testing tools** like:
   - [Mail Tester](https://www.mail-tester.com/)
   - [DKIMValidator](https://dkimvalidator.com/)

## Troubleshooting

### DNS Record Issues
- **Record not found**: Wait 24-48 hours for DNS propagation
- **Wrong format**: Ensure the TXT record value is exactly as specified
- **Multiple records**: Only have one DKIM record per selector

### Private Key Issues
- **Invalid format**: Ensure proper BEGIN/END headers
- **Wrong key**: Must match the public key in DNS record
- **Permissions**: Ensure the private key is properly escaped in the .env file

### Email Delivery Issues
- **Still going to spam**: DKIM is one factor; also check SPF and DMARC records
- **Headers missing**: Check server logs for DKIM configuration errors
- **Authentication failing**: Verify domain name matches exactly

## Additional Email Authentication (Recommended)

For maximum email deliverability, also configure:

### SPF Record
```
v=spf1 include:_spf.mail.privateemail.com ~all
```

### DMARC Record
```
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@sigeristluxurybags.com
```

## Verification Commands

```bash
# Check all DNS records
dig TXT sigeristluxurybags.com
dig TXT default._domainkey.sigeristluxurybags.com
dig TXT _dmarc.sigeristluxurybags.com

# Test email configuration
npm run diagnose:email

# Check email service status
curl http://localhost:5000/api/email/status
```

## Security Notes

⚠️ **Keep Private Key Secure**:
- Never commit the private key to version control
- Use environment variables only
- Rotate keys periodically
- Limit access to production environment

⚠️ **Monitor Email Delivery**:
- Check spam rates regularly
- Monitor DMARC reports
- Update DNS records promptly if keys change

## Support

For additional help:
- Check `EMAIL_SETUP.md` for general email configuration
- Run `npm run diagnose:email` for specific issues
- Contact domain provider for DNS-related issues

---

**© 2024 SigeristLuxuryBags - Professional Email Security Configuration**