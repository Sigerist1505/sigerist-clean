# 🔧 Wompi Configuration Setup

## Current Issue
You're getting a 503 error: "El servicio de pagos no está configurado correctamente" because your Wompi credentials are not properly configured.

## Required Steps

### 1. Get Your Wompi Credentials
Visit [Wompi Merchant Dashboard](https://comercios.wompi.co/) and obtain:
- **Public Key** (starts with `pub_prod_`)
- **Private Key** (starts with `prv_prod_`)

### 2. Update .env File
Replace the placeholder values in your `.env` file:

```env
# Replace these with your actual Wompi keys:
WOMPI_PUBLIC_KEY=pub_prod_YOUR_ACTUAL_PUBLIC_KEY_HERE
WOMPI_PRIVATE_KEY=prv_prod_YOUR_ACTUAL_PRIVATE_KEY_HERE

# These are already configured correctly:
WOMPI_INTEGRITY_SECRET=prod_integrity_gHG8Po5YjKQmGpWm8fkgxANED7motlc7
WOMPI_WEBHOOK_SECRET=prod_events_AfftM4juoszPyNV4YdhCqyfb6BhNWK9L
```

### 3. Verify Configuration
Run the verification script:
```bash
npm run verify:wompi
```

Or check the configuration endpoint:
```bash
curl http://localhost:5000/api/wompi/config
```

### 4. Test Payment Processing
Once properly configured, the payment processing should work without 503 errors.

## Important Notes
- The `WOMPI_INTEGRITY_SECRET` and `WOMPI_WEBHOOK_SECRET` are already set with your provided values
- You only need to replace the PUBLIC and PRIVATE keys with your actual Wompi credentials
- Make sure you're using **production** keys (`pub_prod_` and `prv_prod_`) for live payments
- For testing, you can use test keys (`pub_test_` and `prv_test_`)

## Documentation Reference
- [Wompi Quick Start Guide](https://docs.wompi.co/docs/colombia/inicio-rapido/)
- [Get your credentials](https://comercios.wompi.co/)