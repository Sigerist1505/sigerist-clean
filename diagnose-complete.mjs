#!/usr/bin/env node

/**
 * Comprehensive Email & Server Diagnosis Script for SigeristLuxuryBags
 * 
 * This script provides:
 * 1. Environment variable validation
 * 2. Email configuration testing  
 * 3. Server connection verification
 * 4. Port configuration guidance
 * 5. Troubleshooting recommendations
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🔧 SigeristLuxuryBags - Comprehensive Email & Server Diagnosis\n');

// Get server configuration
const PORT = Number(process.env.PORT) || (process.env.NODE_ENV === "production" ? 3000 : 5000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('🖥️  Server Configuration:');
console.log(`   Environment: ${NODE_ENV}`);
console.log(`   Expected Port: ${PORT}`);
console.log(`   Frontend URL: ${FRONTEND_URL}`);
console.log(`   Server URL: http://localhost:${PORT}`);
console.log('');

// Email configuration check
console.log('📧 Email Configuration Check:\n');

const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
const optionalVars = ['EMAIL_FROM', 'EMAIL_SECURE'];
const dkimVars = ['DKIM_DOMAIN', 'DKIM_SELECTOR', 'DKIM_PRIVATE_KEY'];

console.log('Required Email Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? (varName === 'EMAIL_PASSWORD' ? '[HIDDEN]' : value) : 'NOT SET';
  console.log(`  ${status} ${varName}: ${display}`);
});

console.log('\nOptional Email Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const display = value || 'USING DEFAULT';
  console.log(`  ${status} ${varName}: ${display}`);
});

console.log('\nDKIM Variables (for better deliverability):');
dkimVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const display = value ? (varName === 'DKIM_PRIVATE_KEY' ? '[HIDDEN]' : value) : 'NOT SET';
  console.log(`  ${status} ${varName}: ${display}`);
});

const missingVars = requiredVars.filter(varName => !process.env[varName]);
const dkimConfigured = dkimVars.every(varName => process.env[varName]);

// Server connectivity check
console.log('\n🔗 Server Connectivity Check:');

async function checkServerConnection() {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Server is running on port ${PORT}`);
      console.log(`   ✅ Health check: ${data.status || 'OK'}`);
      return true;
    } else {
      console.log(`   ❌ Server health check failed (status: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Server is not running on port ${PORT}`);
    console.log(`   💡 Start the server with: npm start`);
    return false;
  }
}

async function checkEmailAPI() {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/email/status`);
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Email API endpoint accessible`);
      console.log(`   📧 Email configured: ${data.configured ? 'YES' : 'NO'}`);
      if (data.missingVariables?.length > 0) {
        console.log(`   ⚠️  Missing variables: ${data.missingVariables.join(', ')}`);
      }
      return true;
    } else {
      console.log(`   ❌ Email API endpoint failed (status: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot access email API endpoint`);
    return false;
  }
}

// Email connection test
async function testEmailConnection() {
  if (missingVars.length > 0) {
    console.log(`\n❌ Cannot test email connection - missing: ${missingVars.join(', ')}`);
    return false;
  }

  console.log('\n📬 Email Connection Test:');
  
  const transportConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  if (dkimConfigured) {
    transportConfig.dkim = {
      domainName: process.env.DKIM_DOMAIN,
      keySelector: process.env.DKIM_SELECTOR,
      privateKey: process.env.DKIM_PRIVATE_KEY,
    };
    console.log('   🔐 DKIM signing enabled');
  }

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    await transporter.verify();
    console.log('   ✅ Email connection successful!');
    return true;
  } catch (error) {
    console.log('   ❌ Email connection failed:', error.message);
    
    // Provide specific troubleshooting guidance
    if (error.message.includes('ETIMEOUT') || error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network/DNS Issues - Try these solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Try alternative email hosts:');
      console.log('      EMAIL_HOST=mail.privateemail.com (instead of smtp.privateemail.com)');
      console.log('      EMAIL_HOST=smtp.namecheap.com');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication Issues:');
      console.log('   1. Verify EMAIL_USER and EMAIL_PASSWORD');
      console.log('   2. Check if 2FA is enabled on your email account');
      console.log('   3. Try generating an app-specific password');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Port/Connection Issues - Try these settings:');
      console.log('   Configuration A (TLS):');
      console.log('      EMAIL_PORT=587');
      console.log('      EMAIL_SECURE=false');
      console.log('   Configuration B (SSL):');
      console.log('      EMAIL_PORT=465');
      console.log('      EMAIL_SECURE=true');
    }
    return false;
  }
}

// Main diagnosis flow
async function runDiagnosis() {
  console.log('\n🔍 Running Comprehensive Diagnosis...\n');
  
  const serverRunning = await checkServerConnection();
  const emailAPIWorking = serverRunning ? await checkEmailAPI() : false;
  const emailConnectionWorking = await testEmailConnection();

  console.log('\n📊 Diagnosis Summary:');
  console.log(`   Server Status: ${serverRunning ? '✅ Running' : '❌ Not Running'}`);
  console.log(`   Email API: ${emailAPIWorking ? '✅ Working' : '❌ Not Working'}`);
  console.log(`   Email Connection: ${emailConnectionWorking ? '✅ Working' : '❌ Not Working'}`);
  console.log(`   DKIM Configured: ${dkimConfigured ? '✅ Yes' : '⚠️ No'}`);

  // Provide next steps
  console.log('\n🚀 Next Steps:');
  
  if (!serverRunning) {
    console.log('   1. Start the server: npm start');
    console.log('   2. Verify it\'s running on the correct port');
  }
  
  if (missingVars.length > 0) {
    console.log(`   3. Configure missing email variables: ${missingVars.join(', ')}`);
    console.log('   4. Update your .env file with valid email credentials');
  }
  
  if (!emailConnectionWorking && missingVars.length === 0) {
    console.log('   5. Test different email host configurations');
    console.log('   6. Check firewall and network settings');
  }
  
  if (!dkimConfigured) {
    console.log('   7. Consider setting up DKIM for better email deliverability');
  }
  
  console.log('\n💡 Quick Commands:');
  console.log('   • Test email only: npm run diagnose:email');
  console.log('   • Check server status: curl http://localhost:' + PORT + '/api/health');
  console.log('   • Check email API: curl http://localhost:' + PORT + '/api/email/status');
  console.log('   • Send test email: curl -X POST http://localhost:' + PORT + '/api/test-email -H "Content-Type: application/json" -d \'{"to":"your-email@example.com"}\'');
  
  console.log('\n📚 Documentation:');
  console.log('   • Email setup: see EMAIL_SETUP.md');
  console.log('   • DKIM setup: see DKIM_SETUP.md');
  console.log('   • Troubleshooting: see EMAIL_TROUBLESHOOTING.md');
}

// Run the diagnosis
runDiagnosis().catch(error => {
  console.error('\n❌ Diagnosis failed:', error);
  process.exit(1);
});