# 🔐 Authentication System Setup Guide

## Overview

This project contains a **secure authentication system** with comprehensive user registration, login, and OTP verification features.

## 🚀 Features

### **Authentication Features:**
- **User Registration** - Complete signup process with validation
- **Email/SMS OTP Verification** - Secure account verification
- **Login System** - Email/password authentication
- **Password Reset** - Forgot password functionality with OTP
- **JWT Tokens** - Secure session management
- **Input Validation** - Comprehensive form validation

### **Security Features:**
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ OTP verification for account security
- ✅ Email and SMS services integration
- ✅ Input sanitization and validation

## 🔧 Setup Instructions

### **1. Configure Environment Variables**

Add to your `.env` file in the backend directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_SERVICE_API_KEY=your_email_service_key
SMS_SERVICE_API_KEY=your_sms_service_key
```

### **2. Install Dependencies**

Install required packages:

```bash
cd backend
npm install
```

### **3. Start the Services**

1. **Start your backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start your frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### **4. Test the Authentication System**

1. **Open your browser** and go to `http://localhost:5173`
2. **Test Registration**:
   - Click on "Signup" tab
   - Fill in the registration form
   - Verify OTP sent to your email
3. **Test Login**:
   - Use your registered credentials
   - Complete OTP verification if required

## 🎯 How to Use

### **Available Features:**

1. **User Registration**:
   - Complete signup form with validation
   - Email OTP verification
   - Secure password requirements
2. **User Login**:
   - Email/password authentication
   - Optional OTP verification
   - JWT token management
3. **Password Reset**:
   - Forgot password functionality
   - OTP-based password reset
   - Secure password update

### **API Endpoints:**

**Authentication Routes:**
- `POST /api/auth/signup/request-otp` - Request signup OTP
- `POST /api/auth/signup/verify-otp` - Verify signup OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/login/request-otp` - Request login OTP
- `POST /api/auth/verify-otp` - Verify login OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

## 🔒 Security Features

### **Password Security:**
- Minimum 8 characters with uppercase, lowercase, and numbers
- Bcrypt hashing with salt rounds
- Secure password reset with OTP verification

### **OTP Security:**
- 6-digit numeric codes
- 10-minute expiration time
- Email and SMS delivery options
- Single-use verification codes

### **JWT Security:**
- Secure token generation
- Configurable expiration times
- Role-based access control
- Token validation middleware
## 🚀 What's Next

Your Authentication System now offers:

1. **Secure user registration** with email verification
2. **Multi-factor authentication** with OTP verification
3. **Password security** with bcrypt hashing
4. **JWT token management** for secure sessions
5. **Comprehensive validation** for all user inputs

The **Auth System** provides a solid foundation for secure user management! 🔐

## 🎉 Ready to Use

Your system now supports:
- **Secure user registration**
- **Email/SMS OTP verification**
- **Password reset functionality**
- **JWT-based authentication**
- **Comprehensive input validation**

Your application is now secure and ready for users! 🌟
