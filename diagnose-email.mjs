#!/usr/bin/env node

// Email diagnostic script for SigeristLuxuryBags
// This script helps diagnose email configuration issues

import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🧪 SigeristLuxuryBags Email Diagnostics\n');

// Check environment variables
console.log('📋 Checking Email Configuration...\n');

const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
const optionalVars = ['EMAIL_FROM', 'EMAIL_SECURE'];

console.log('Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? (varName === 'EMAIL_PASSWORD' ? '[HIDDEN]' : value) : 'NOT SET';
  console.log(`  ${status} ${varName}: ${display}`);
});

console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const display = value || 'USING DEFAULT';
  console.log(`  ${status} ${varName}: ${display}`);
});

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log(`\n❌ Email service is NOT configured!`);
  console.log(`Missing variables: ${missingVars.join(', ')}\n`);
  
  console.log('📝 To fix this:');
  console.log('1. Update the EMAIL_* variables in your .env file with your real credentials');
  console.log('2. For Namecheap, use:');
  console.log('   EMAIL_HOST=mail.privateemail.com');
  console.log('   EMAIL_PORT=587');
  console.log('   EMAIL_SECURE=false');
  console.log('   EMAIL_USER=info@sigeristluxurybags.com');
  console.log('   EMAIL_PASSWORD=your-namecheap-email-password');
  console.log('   EMAIL_FROM=info@sigeristluxurybags.com\n');
  
  console.log('3. Alternative configuration (if the above doesn\'t work):');
  console.log('   EMAIL_HOST=smtp.privateemail.com');
  console.log('   EMAIL_PORT=465');
  console.log('   EMAIL_SECURE=true\n');
  
  process.exit(1);
}

console.log('\n✅ All required email variables are configured!\n');

// Create transporter for testing
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test connection
console.log('🔍 Testing email connection...');
try {
  await transporter.verify();
  console.log('✅ Email connection test passed!\n');
  
  // Ask if user wants to send test email
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('📧 Would you like to send a test email? Enter email address (or press Enter to skip): ', async (email) => {
    if (email && email.includes('@')) {
      console.log(`\n📤 Sending test email to ${email}...`);
      
      try {
        const info = await transporter.sendMail({
          from: `"SigeristLuxuryBags" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
          to: email,
          subject: '🧪 Email Test - SigeristLuxuryBags',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; background: #000; color: #ebc005; padding: 20px;">
                <h1>SigeristLuxuryBags</h1>
                <p>Email Configuration Test ✅</p>
              </div>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h2>Success!</h2>
                <p>Your email configuration is working correctly.</p>
                <p><strong>Test completed at:</strong> ${new Date().toLocaleString('es-CO')}</p>
                <p><strong>Message ID:</strong> ${info?.messageId || 'N/A'}</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>© 2024 SigeristLuxuryBags - Email System Test</p>
              </div>
            </div>
          `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log('📧 Check your inbox (and spam folder)');
      } catch (error) {
        console.log('❌ Failed to send test email:', error.message);
        console.log('💡 Check your email configuration and try again');
      }
    } else {
      console.log('📧 Test email skipped');
    }
    
    console.log('\n🎉 Email diagnostics complete!');
    console.log('\n📚 For more help, see EMAIL_SETUP.md');
    rl.close();
  });
  
} catch (error) {
  console.log('❌ Email connection test failed!');
  console.error('Error:', error.message);
  
  console.log('\n💡 Common solutions:');
  if (error.message.includes('ENOTFOUND')) {
    console.log('- Check EMAIL_HOST value (try mail.privateemail.com or smtp.privateemail.com)');
  } else if (error.message.includes('ECONNREFUSED')) {
    console.log('- Check EMAIL_HOST and EMAIL_PORT (try 587 or 465)');
  } else if (error.message.includes('authentication')) {
    console.log('- Check EMAIL_USER and EMAIL_PASSWORD');
  } else if (error.message.includes('timeout')) {
    console.log('- Check network connectivity and EMAIL_HOST');
  }
  
  console.log('\n📝 Try these alternative configurations:');
  console.log('Configuration 1 (recommended):');
  console.log('  EMAIL_HOST=mail.privateemail.com');
  console.log('  EMAIL_PORT=587');
  console.log('  EMAIL_SECURE=false');
  console.log('\nConfiguration 2 (if first fails):');
  console.log('  EMAIL_HOST=smtp.privateemail.com');
  console.log('  EMAIL_PORT=465');
  console.log('  EMAIL_SECURE=true');
  
  process.exit(1);
}