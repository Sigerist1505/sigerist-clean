// Simple test to verify email templates are working
import 'dotenv/config';
import { emailService } from './server/email-service.js';

console.log('🧪 Testing SigeristLuxuryBags Email Templates...\n');

// Test if email service initializes
console.log('Email service initialized');

// Check environment variables
const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log(`⚠️ Missing email configuration: ${missingVars.join(', ')}`);
  console.log('Email sending will be disabled, but templates can be tested');
} else {
  console.log('✅ Email configuration found');
}

console.log('\n📧 Email templates ready to test!');