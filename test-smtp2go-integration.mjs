#!/usr/bin/env node
// test-smtp2go-integration.mjs
import { config } from 'dotenv';
config();

// Set SMTP2GO API key from the problem statement
process.env.SMTP2GO_API_KEY = 'api-4CD6CD4114304458A8C441E6FFC36D52';
process.env.EMAIL_FROM = 'info@sigeristluxurybags.com';

console.log('🧪 Testing SMTP2GO Email Integration');
console.log('====================================\n');

// Import EmailService from compiled JS instead
const { EmailService } = await import('./dist/index.cjs');

const emailService = new EmailService();

// Test configuration status
console.log('📧 Email Configuration Status:');
const configStatus = emailService.getConfigurationStatus();
console.log('✅ Configured:', configStatus.configured);
console.log('📡 Provider:', configStatus.config.provider);
console.log('🔑 SMTP2GO API Key:', configStatus.smtp2go.hasApiKey ? '✅ Present' : '❌ Missing');
console.log('🌐 API URL:', configStatus.smtp2go.apiUrl);
console.log('');

// Test connection
console.log('🔍 Testing Email Service Connection:');
try {
  const connectionResult = await emailService.testConnection();
  if (connectionResult) {
    console.log('✅ Email service connection test passed!');
  } else {
    console.log('❌ Email service connection test failed!');
  }
} catch (error) {
  console.error('❌ Connection test error:', error.message);
}
console.log('');

// Test sending a sample email
console.log('📧 Testing Email Sending:');
const testEmail = {
  to: 'test@example.com',
  subject: 'Test Email - SMTP2GO Integration',
  html: `
    <h1>Test Email</h1>
    <p>This is a test email to verify SMTP2GO integration.</p>
    <p>If you receive this, the integration is working correctly!</p>
    <p>Sent at: ${new Date().toISOString()}</p>
  `
};

try {
  const sendResult = await emailService.sendEmail(testEmail);
  if (sendResult) {
    console.log('✅ Test email sent successfully!');
  } else {
    console.log('❌ Test email failed to send!');
  }
} catch (error) {
  console.error('❌ Email sending error:', error.message);
}
console.log('');

// Test all email methods
console.log('🔄 Testing Specific Email Methods:');

try {
  console.log('📝 Testing registration confirmation email...');
  const regResult = await emailService.sendRegistrationConfirmation('test@example.com', 'Test User');
  console.log(regResult ? '✅ Registration email test passed' : '❌ Registration email test failed');
} catch (error) {
  console.error('❌ Registration email error:', error.message);
}

try {
  console.log('🔑 Testing password reset email...');
  const resetResult = await emailService.sendPasswordResetCode('test@example.com', 'Test User', '123456');
  console.log(resetResult ? '✅ Password reset email test passed' : '❌ Password reset email test failed');
} catch (error) {
  console.error('❌ Password reset email error:', error.message);
}

try {
  console.log('🛍️ Testing purchase confirmation email...');
  const purchaseResult = await emailService.sendPurchaseConfirmation(
    'test@example.com', 
    'Test User',
    { id: 'TEST123', total: 150000 },
    [{ name: 'Test Bag', quantity: 1, price: 150000 }]
  );
  console.log(purchaseResult ? '✅ Purchase confirmation email test passed' : '❌ Purchase confirmation email test failed');
} catch (error) {
  console.error('❌ Purchase confirmation email error:', error.message);
}

console.log('\n🎉 SMTP2GO Integration Testing Complete!');
console.log('💡 Note: Test emails are sent to test@example.com and may not be delivered.');
console.log('📧 To test with real emails, update the email addresses in this script.');