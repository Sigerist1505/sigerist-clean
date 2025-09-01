#!/usr/bin/env node
// verify-production-flow.mjs
// Production verification script for email and order functionality

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const PROD_CONFIG = {
  baseUrl: process.env.FRONTEND_URL || 'http://localhost:5000',
  testEmail: process.env.TEST_EMAIL || 'test@example.com'
};

console.log('🔍 PRODUCTION FLOW VERIFICATION');
console.log('='.repeat(40));

async function verifyEmailConfiguration() {
  console.log('📧 Checking email configuration...');
  
  try {
    const response = await fetch(`${PROD_CONFIG.baseUrl}/api/email/status`);
    const status = await response.json();
    
    console.log(`   Configured: ${status.configured ? '✅' : '❌'}`);
    console.log(`   Connection: ${status.connectionWorking ? '✅' : '❌'}`);
    console.log(`   Provider: ${status.configuration?.provider || 'Not configured'}`);
    
    if (!status.configured) {
      console.log('   ⚠️ Email not configured. Set EMAIL_* or SMTP2GO_API_KEY variables');
      return false;
    }
    
    if (!status.connectionWorking) {
      console.log('   ⚠️ Email connection not working. Check credentials/network');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error checking email status: ${error.message}`);
    return false;
  }
}

async function verifyDatabaseConnection() {
  console.log('\n🗄️ Checking database connection...');
  
  try {
    const response = await fetch(`${PROD_CONFIG.baseUrl}/api/health`);
    const health = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Server is running');
      console.log(`   📊 Status: ${health.status}`);
      return true;
    } else {
      console.log('   ❌ Server health check failed');
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ Cannot connect to server: ${error.message}`);
    console.log('   💡 Make sure the server is running with: npm start');
    return false;
  }
}

async function verifyOrderCreation() {
  console.log('\n📋 Testing order creation...');
  
  const testOrder = {
    customerName: 'Test Production User',
    customerEmail: PROD_CONFIG.testEmail,
    customerPhone: '+573999999999',
    items: JSON.stringify([{
      name: 'Test Order - Production Verification',
      quantity: 1,
      price: 1000 // Minimal test amount
    }]),
    total: 1000,
    status: 'test',
    transactionId: 'prod_test_' + Date.now(),
    paymentReference: 'prod_ref_' + Date.now(),
    paymentMethod: 'wompi'
  };
  
  try {
    const response = await fetch(`${PROD_CONFIG.baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrder)
    });
    
    if (response.ok) {
      const order = await response.json();
      console.log(`   ✅ Test order created: #${order.id}`);
      console.log(`   📧 Email attempted for: ${order.customerEmail}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`   ❌ Order creation failed: ${error}`);
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ Error creating test order: ${error.message}`);
    return false;
  }
}

async function runVerification() {
  console.log(`🎯 Verifying production setup at: ${PROD_CONFIG.baseUrl}\n`);
  
  const results = {
    database: await verifyDatabaseConnection(),
    email: await verifyEmailConfiguration(),
    orders: await verifyOrderCreation()
  };
  
  console.log('\n📊 VERIFICATION RESULTS');
  console.log('='.repeat(30));
  console.log(`🗄️ Database: ${results.database ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📧 Email Config: ${results.email ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📋 Order Creation: ${results.orders ? '✅ WORKING' : '❌ FAILED'}`);
  
  const allWorking = Object.values(results).every(Boolean);
  
  if (allWorking) {
    console.log('\n🎉 ALL SYSTEMS WORKING!');
    console.log('✅ Your purchase flow is ready for production');
    console.log('📧 Emails will be sent after each purchase');
    console.log('📋 Orders will be saved to the database');
  } else {
    console.log('\n⚠️ SOME ISSUES DETECTED');
    console.log('Please fix the failed checks above before going to production');
    
    if (!results.email) {
      console.log('\n📧 Email Setup Help:');
      console.log('   - For SMTP2GO: Set SMTP2GO_API_KEY in .env');
      console.log('   - For SMTP: Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD');
      console.log('   - See EMAIL_SETUP.md for detailed instructions');
    }
  }
  
  process.exit(allWorking ? 0 : 1);
}

runVerification().catch(error => {
  console.error('\n💥 Verification failed:', error);
  process.exit(1);
});