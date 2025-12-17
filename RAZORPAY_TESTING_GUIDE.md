# 💳 Razorpay Payment Integration Testing Guide

## 🚀 Quick Start

Your Razorpay payment system is now configured with test API keys and ready for testing!

### Current Configuration
- **Razorpay Key ID**: `rzp_test_RKjVY9b5n2bPLf`
- **Mode**: Test Mode (Safe for testing)
- **Currency**: INR (Indian Rupees)

## 🧪 Testing the Integration

### 1. Run Backend Tests

```bash
cd backend
node ../test_payment_integration.js
```

This will test all payment endpoints and verify the integration is working.

### 2. Start Your Server

```bash
cd backend
npm run dev
```

## 🎯 Testing Payment Flow

### Step 1: Create Payment Order
**Endpoint**: `POST /api/payments/create-order`

```javascript
// Example request
const response = await fetch('/api/payments/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    courseId: 'your-course-id'
  })
});

const orderData = await response.json();
// Returns: orderId, amount, currency, key, prefill data
```

### Step 2: Initialize Razorpay Checkout

```javascript
// Frontend integration (React/HTML)
const options = {
  key: orderData.key, // Your Razorpay key
  amount: orderData.amount, // Amount in paisa
  currency: orderData.currency,
  name: 'Course Purchase',
  description: orderData.description,
  order_id: orderData.orderId,
  prefill: orderData.prefill,
  theme: orderData.theme,
  handler: function(response) {
    // Success callback
    verifyPayment(response);
  },
  modal: {
    ondismiss: function() {
      // Payment modal closed
      console.log('Payment cancelled');
    }
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### Step 3: Verify Payment

```javascript
// Verify payment after successful transaction
const verifyPayment = async (response) => {
  const verifyResponse = await fetch('/api/payments/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      courseId: courseId
    })
  });

  const result = await verifyResponse.json();
  if (result.success) {
    // Payment verified, user enrolled
    console.log('Payment successful!');
  }
};
```

## 🧾 Test Card Numbers

Use these Razorpay test card numbers for testing:

### ✅ Successful Payments
| Card Number | Expiry | CVV | Description |
|-------------|---------|-----|-------------|
| 4111 1111 1111 1111 | Any future date | Any 3 digits | Visa - Success |
| 5555 5555 5555 4444 | Any future date | Any 3 digits | Mastercard - Success |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Visa - Success |

### ❌ Failed Payments (for testing error handling)
| Card Number | Expiry | CVV | Description |
|-------------|---------|-----|-------------|
| 4000 0000 0000 0002 | Any past date | Any 3 digits | Expired card |
| 4000 0000 0000 0119 | Any future date | Any 3 digits | Processing error |

### 🏦 Net Banking & UPI
- **Test UPI ID**: `success@razorpay`
- **Test Net Banking**: Select any bank and use dummy credentials

## 📋 API Endpoints Reference

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create payment order |
| POST | `/api/payments/verify-payment` | Verify payment signature |
| GET | `/api/payments/status/:courseId` | Check payment status |
| GET | `/api/payments/history` | Get user payment history |
| POST | `/api/payments/webhook` | Razorpay webhook (for production) |

### Test Endpoints (Development Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/test-payment` | Simulate successful payment |
| POST | `/api/payments/payment-failed` | Handle payment failures |

## 🔍 Testing Checklist

### ✅ Basic Flow
- [ ] Create payment order successfully
- [ ] Razorpay checkout opens with correct details
- [ ] Test successful payment with test card
- [ ] Payment verification works
- [ ] User gets enrolled in course after payment
- [ ] Payment history shows the transaction

### ✅ Error Handling
- [ ] Test payment failure scenarios
- [ ] Test duplicate payment prevention
- [ ] Test free course enrollment (no payment needed)
- [ ] Test unauthorized access prevention

### ✅ Edge Cases
- [ ] Test payment for already purchased course
- [ ] Test payment with invalid course ID
- [ ] Test payment without authentication
- [ ] Test payment verification with wrong signature

## 🐛 Troubleshooting

### Common Issues & Solutions

#### ❌ "Payment system not configured"
**Solution**: Check if Razorpay keys are properly set in `.env` file

#### ❌ "Invalid signature" error
**Solution**: Ensure `RAZORPAY_KEY_SECRET` is correct and matches your account

#### ❌ "Course not found" error
**Solution**: Verify the course ID exists and is a paid course (price > 0)

#### ❌ Payment order creation fails
**Solution**: 
1. Check Razorpay dashboard for API errors
2. Verify test mode is enabled
3. Check server logs for detailed errors

### 🔧 Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env.RAZORPAY_KEY_ID)"

# Test API connection
curl -X POST http://localhost:5001/api/health

# Check payment route
curl -X GET http://localhost:5001/api/payments/status/test-course-id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🌐 Frontend Integration

### React Component Example

```jsx
import { useState } from 'react';

const PaymentButton = ({ course, user }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create payment order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ courseId: course._id })
      });
      
      const orderData = await orderResponse.json();
      
      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Course Purchase',
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        theme: { color: '#3B82F6' },
        handler: async (response) => {
          // Verify payment
          const verifyResponse = await fetch('/api/payments/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              ...response,
              courseId: course._id
            })
          });
          
          const result = await verifyResponse.json();
          if (result.success) {
            alert('Payment successful! Course enrolled.');
            window.location.reload();
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
    >
      {loading ? 'Processing...' : `Buy Course - ₹${course.price}`}
    </button>
  );
};
```

## 📊 Monitoring & Logs

### Check Payment Status
```bash
# View payment logs
tail -f backend/logs/payment.log

# Check specific payment
node -e "
const Payment = require('./backend/models/Payment');
Payment.findOne({razorpayOrderId: 'order_id'}).then(console.log);
"
```

### Razorpay Dashboard
- Monitor test transactions: [https://dashboard.razorpay.com/app/payments](https://dashboard.razorpay.com/app/payments)
- Check webhook logs: [https://dashboard.razorpay.com/app/webhooks](https://dashboard.razorpay.com/app/webhooks)

## 🚀 Going Live

When ready for production:

1. **Switch to Live Mode** in Razorpay dashboard
2. **Generate Live API Keys** (starts with `rzp_live_`)
3. **Update Environment Variables** with live keys
4. **Configure Webhooks** for production URL
5. **Test thoroughly** with small amounts first

## 📞 Support

- **Razorpay Documentation**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Test Integration**: [https://razorpay.com/docs/payment-gateway/web-integration/standard/](https://razorpay.com/docs/payment-gateway/web-integration/standard/)
- **API Reference**: [https://razorpay.com/docs/api/](https://razorpay.com/docs/api/)

---

🎉 **Your Razorpay integration is complete and ready for testing!**