# Payment Setup Guide

## Razorpay Integration Setup

### 1. Create Razorpay Account
1. Go to [https://razorpay.com](https://razorpay.com)
2. Sign up for a free account
3. Complete the verification process

### 2. Get Test API Keys
1. Log in to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Under **Test Mode**, generate new API keys
4. Copy the Key ID and Key Secret

### 3. Configure Environment Variables

Update the `.env` file in the `backend` folder:

```env
# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
```

**Replace the X's with your actual test keys from Razorpay Dashboard**

### 4. Test Payment Flow

1. Restart the backend server: `npm start`
2. Start the frontend: `npm run dev`
3. Try purchasing a course
4. Use Razorpay test cards for testing:
   - **Success**: 4111 1111 1111 1111
   - **Failure**: 4000 0000 0000 0002

### 5. Webhook Setup (Optional for Production)

1. In Razorpay Dashboard, go to **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret and update `RAZORPAY_WEBHOOK_SECRET`

### 6. Production Setup

1. Complete KYC verification in Razorpay
2. Get live API keys from **Live Mode** in dashboard
3. Update environment variables with live keys
4. Test thoroughly before going live

## Current Status

✅ Backend payment routes configured
✅ Frontend payment service with error handling
✅ Payment model and database schema
✅ Test payment endpoint for development
⚠️ **Need actual Razorpay API keys for full functionality**

## Error Messages

- "Payment system not configured": Missing Razorpay API keys
- "Authentication required": User not logged in
- "Failed to load Razorpay script": Internet connection issue
- "Payment verification failed": Invalid payment response

## Support

For issues with payment integration, check:
1. Console logs in browser (F12)
2. Backend server logs
3. Razorpay dashboard for failed payments