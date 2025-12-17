// Test script to simulate a payment record in database
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5001/api';
const COURSE_ID = '68d2d007e422fbaccf02ef5b';

async function simulatePayment() {
    console.log('🧪 Simulating payment for testing...\n');

    // You'll need to replace this with a valid auth token from localStorage
    // To get this: Open browser console on frontend and run: localStorage.getItem('authToken')
    const authToken = 'YOUR_AUTH_TOKEN_HERE'; // Replace with real token

    if (authToken === 'YOUR_AUTH_TOKEN_HERE') {
        console.log('❌ Please update the authToken variable with your real auth token');
        console.log('   1. Open browser console on frontend (F12)');
        console.log('   2. Run: localStorage.getItem("authToken")');
        console.log('   3. Copy the token and paste it in this script');
        return;
    }

    try {
        // Test payment endpoint (this will use test card)
        const response = await fetch(`${API_BASE_URL}/debug/test-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                courseId: COURSE_ID,
                amount: 2700, // ₹27 in paise
                paymentId: 'test_payment_' + Date.now(),
                orderId: 'test_order_' + Date.now()
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Payment simulation successful!');
            console.log('   Payment ID:', result.payment._id);
            console.log('   Course ID:', result.payment.courseId);
            console.log('   Amount:', result.payment.amount);
            console.log('   Status:', result.payment.status);
            console.log('\n🎯 Now try accessing the course page - purchase button should be hidden!');
        } else {
            console.log('❌ Payment simulation failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

console.log('This script will simulate a payment to test the "already paid" scenario');
console.log('Make sure to update the authToken variable first!\n');

simulatePayment();