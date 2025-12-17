# 🚀 Backend Startup Guide - Auth System
# Quick Fix for Connection Error

The `ERR_CONNECTION_REFUSED` error means your backend server is not running. Here's how to fix it:

## 📋 Step-by-Step Solution

{{ ... }}
```bash
cd "travel planner/backend"
```

### **Step 2: Install Dependencies (if not done)**
```bash
npm install
```

### **Step 3: Start the Backend Server**
```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
⚠️  Warning: MONGO_URI is not defined in .env file. Some features may not work.
```

### **Step 4: Test the Server**
Open another terminal and run:
```bash
cd "travel planner/backend"
node test-server.js
```

You should see:
```
🧪 Testing backend server...

1. Testing server health...
✅ Server is responding
Response: { places: [...], note: 'Mock data - Configure GOOGLE_PLACES_API_KEY for real data' }

2. Testing search functionality...
✅ Search endpoint working
Found places: 2

3. Testing place details...
✅ Place details endpoint working
Place name: Sample Place Details

🎉 All tests passed! Backend is working correctly.
```

### **Step 5: Test Frontend Connection**
1. Keep the backend running
2. Go to your frontend: `http://localhost:3000`
3. Click "🌍 Wander Guide"
4. Try searching for "Paris" or "Tokyo"
5. You should see mock results (no more connection errors!)

## 🔧 Configuration Options

### **Option 1: Basic Setup (Mock Data)**
Your backend is now configured to work with mock data when Google Places API is not set up. This is perfect for testing!

### **Option 2: Full Setup (Real Google Places Data)**
If you want real Google Places data:

1. **Get Google Places API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Places API (New)"
   - Create an API key

2. **Update .env file**:
   ```env
   GOOGLE_PLACES_API_KEY=your_actual_api_key_here
   ```

3. **Restart the server**:
   ```bash
   npm start
   ```

### **Option 3: Full Database Setup**
If you want user authentication and booking features:

1. **Install MongoDB** (if not installed)
2. **Update .env file**:
   ```env
   MONGO_URI=mongodb://localhost:27017/travel_planner
   ```

3. **Restart the server**

## 🐛 Troubleshooting

### **Error: Port 5000 already in use**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <process_id> /F

# Or use a different port
PORT=5001 npm start
```

### **Error: Cannot find module**
```bash
# Reinstall dependencies
npm install
```

### **Error: Permission denied**
```bash
# Run as administrator or use different port
PORT=3001 npm start
```

## ✅ Success Indicators

### **Backend Running Successfully:**
- Terminal shows: "🚀 Server running on http://localhost:5000"
- No error messages in terminal
- Test script passes all tests

### **Frontend Connected:**
- No "ERR_CONNECTION_REFUSED" errors in browser console
- Wander Guide search shows results (even if mock data)
- No red error messages in browser

### **API Working:**
- Search returns results
- Place details load
- Photos display (placeholder images for mock data)

## 🎯 What You Get

### **With Mock Data (No API Key):**
- ✅ Backend server running
- ✅ Frontend connection working
- ✅ Search functionality working
- ✅ Mock place results
- ✅ No connection errors

### **With Google Places API:**
- ✅ All of the above
- ✅ Real place data from Google
- ✅ Real photos and reviews
- ✅ Accurate place information

### **With Full Database:**
- ✅ All of the above
- ✅ User authentication
- ✅ Booking system
- ✅ User profiles

## 🚀 Quick Commands

```bash
# Start backend
cd "travel planner/backend"
npm start

# Test backend (in another terminal)
cd "travel planner/backend"
node test-server.js

# Start frontend (in another terminal)
cd "travel planner/frontend"
npm start
```

## 🎉 Expected Result

After following these steps:
1. **Backend**: Running on http://localhost:5000
2. **Frontend**: Running on http://localhost:3000
3. **Wander Guide**: Working with search functionality
4. **No Errors**: Connection errors resolved

Your Dynamic Wander Guide will be fully functional! 🌍✈️
