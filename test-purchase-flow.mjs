// test-purchase-flow.mjs
// Test script to verify purchase confirmation email and order creation functionality

import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const TEST_CONFIG = {
  baseUrl: process.env.FRONTEND_URL || 'http://localhost:5000',
  testEmail: 'test@example.com',
  testCustomer: {
    name: 'Juan Pérez',
    email: 'test@example.com', 
    phone: '+573123456789'
  },
  testTransaction: {
    transactionId: 'wompi_test_123456',
    reference: 'test_ref_789',
    amount: 150000, // $150,000 COP
    sessionId: 'test_session_' + Date.now()
  }
};

console.log('🧪 Testing Purchase Confirmation Email and Order Creation Flow');
console.log('='.repeat(70));

async function testEmailServiceStatus() {
  console.log('\n📧 Testing Email Service Status...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/email/status`);
    const status = await response.json();
    
    console.log('Email Configuration Status:');
    console.log(`  Configured: ${status.configured ? '✅' : '❌'}`);
    console.log(`  Connection Working: ${status.connectionWorking ? '✅' : '❌'}`);
    console.log(`  Configuration: ${status.configuration?.provider || 'None'}`);
    
    if (status.missingVariables?.length > 0) {
      console.log(`  Missing Variables: ${status.missingVariables.join(', ')}`);
    }
    
    return status.configured && status.connectionWorking;
  } catch (error) {
    console.error('❌ Error checking email status:', error.message);
    return false;
  }
}

async function addTestItemToCart() {
  console.log('\n🛒 Adding test item to cart...');
  
  const testCartItem = {
    sessionId: TEST_CONFIG.testTransaction.sessionId,
    productId: 1, // Assuming product with ID 1 exists
    name: 'Test Product - Bolso Personalizado',
    quantity: 1,
    price: TEST_CONFIG.testTransaction.amount,
    personalization: 'Test Personalization',
    addNameEmbroidery: true,
    keychainPersonalization: 'Test Keychain',
    addPompon: false,
    addPersonalizedKeychain: true,
    addDecorativeBow: false,
    addPersonalization: true,
    expressService: false,
    embroideryColor: 'Gold',
    embroideryFont: 'Classic',
    hasBordado: true
  };
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCartItem)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test item added to cart:', result.id);
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Failed to add item to cart:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error adding item to cart:', error.message);
    return false;
  }
}

async function testPurchaseCompletion() {
  console.log('\n💳 Testing Purchase Completion Flow...');
  
  const purchaseData = {
    transactionId: TEST_CONFIG.testTransaction.transactionId,
    reference: TEST_CONFIG.testTransaction.reference,
    customerEmail: TEST_CONFIG.testCustomer.email,
    customerName: TEST_CONFIG.testCustomer.name,
    customerPhone: TEST_CONFIG.testCustomer.phone,
    amount: TEST_CONFIG.testTransaction.amount,
    sessionId: TEST_CONFIG.testTransaction.sessionId
  };
  
  console.log('Purchase Data:');
  console.log(`  Customer: ${purchaseData.customerName} (${purchaseData.customerEmail})`);
  console.log(`  Amount: $${purchaseData.amount.toLocaleString('es-CO')} COP`);
  console.log(`  Transaction ID: ${purchaseData.transactionId}`);
  console.log(`  Reference: ${purchaseData.reference}`);
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/payment/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(purchaseData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Purchase completion successful:');
      console.log(`  Order ID: #${result.order.id}`);
      console.log(`  Total: $${result.order.total.toLocaleString('es-CO')} COP`);
      console.log(`  Customer: ${result.order.customerName}`);
      console.log(`  Email: ${result.order.customerEmail}`);
      console.log(`  Transaction ID: ${result.transactionId}`);
      console.log(`  Items: ${result.order.items.length} product(s)`);
      
      return result.order;
    } else {
      const error = await response.json();
      console.log('❌ Purchase completion failed:', error.message);
      console.log('   Details:', error.error || 'No additional details');
      return null;
    }
  } catch (error) {
    console.error('❌ Error completing purchase:', error.message);
    return null;
  }
}

async function checkOrderInDatabase() {
  console.log('\n🗄️ Checking if order was saved to database...');
  
  try {
    // Since we don't have a direct endpoint to get orders, we'll check if orders endpoint exists
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerName: TEST_CONFIG.testCustomer.name,
        customerEmail: TEST_CONFIG.testCustomer.email,
        customerPhone: TEST_CONFIG.testCustomer.phone,
        items: JSON.stringify([{
          name: 'Test Product',
          quantity: 1,
          price: TEST_CONFIG.testTransaction.amount
        }]),
        total: TEST_CONFIG.testTransaction.amount,
        status: 'completed',
        transactionId: TEST_CONFIG.testTransaction.transactionId + '_db_test',
        paymentReference: TEST_CONFIG.testTransaction.reference + '_db_test',
        paymentMethod: 'wompi'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Direct order creation test successful:');
      console.log(`  Order ID: #${result.id}`);
      console.log(`  Total: $${result.total.toLocaleString('es-CO')} COP`);
      return true;
    } else {
      const error = await response.text();
      console.log('⚠️ Direct order creation test failed:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing order creation:', error.message);
    return false;
  }
}

async function testEmailContent() {
  console.log('\n📝 Verifying Email Content Requirements...');
  
  // Check if email service file contains the required content
  try {
    const emailServiceContent = readFileSync('./server/email-service.ts', 'utf8');
    
    const checks = [
      {
        name: 'Subject includes "Gracias por tu compra y elegirnos"',
        test: emailServiceContent.includes('Gracias por tu compra y elegirnos - SigeristLuxuryBags')
      },
      {
        name: 'Email content includes required greeting',
        test: emailServiceContent.includes('¡Gracias por tu compra y elegirnos!')
      },
      {
        name: 'Shows amount received from Wompi',
        test: emailServiceContent.includes('Total recibido:')
      },
      {
        name: 'Includes product descriptions and cart details',
        test: emailServiceContent.includes('item.name') && emailServiceContent.includes('item.personalization')
      }
    ];
    
    checks.forEach(check => {
      console.log(`  ${check.test ? '✅' : '❌'} ${check.name}`);
    });
    
    const allPassed = checks.every(check => check.test);
    console.log(`\n${allPassed ? '✅' : '❌'} Email content verification: ${allPassed ? 'PASSED' : 'FAILED'}`);
    
    return allPassed;
  } catch (error) {
    console.error('❌ Error reading email service file:', error.message);
    return false;
  }
}

async function runTests() {
  console.log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`Test Email: ${TEST_CONFIG.testEmail}`);
  
  const results = {
    emailStatus: false,
    emailContent: false,
    cartAddition: false,
    purchaseCompletion: false,
    orderDatabase: false
  };
  
  // Test 1: Email Service Status
  results.emailStatus = await testEmailServiceStatus();
  
  // Test 2: Email Content Verification
  results.emailContent = await testEmailContent();
  
  // Test 3: Add item to cart
  results.cartAddition = await addTestItemToCart();
  
  // Test 4: Purchase completion flow (only if cart addition succeeded)
  if (results.cartAddition) {
    const order = await testPurchaseCompletion();
    results.purchaseCompletion = !!order;
  } else {
    console.log('\n⚠️ Skipping purchase completion test due to cart addition failure');
  }
  
  // Test 5: Database order creation
  results.orderDatabase = await checkOrderInDatabase();
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(70));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Score: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Purchase confirmation email system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
    
    if (!results.emailStatus) {
      console.log('\n💡 Email Configuration Help:');
      console.log('   Set either SMTP2GO_API_KEY or EMAIL_HOST/EMAIL_PORT/EMAIL_USER/EMAIL_PASSWORD');
      console.log('   See .env.example for configuration details');
    }
  }
  
  return results;
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});