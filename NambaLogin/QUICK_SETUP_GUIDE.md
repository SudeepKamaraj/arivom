# Quick Setup Guide - Auth System

## 🚀 Authentication System Only

This project now contains only the authentication system with:
1. **Backend Server** (Node.js/Express)
2. **MongoDB Database** 
3. **Email/SMS Services for OTP**

## ⚡ Quick Setup (5 minutes)

### Step 1: Start Backend Server
```bash
cd "travel planner\backend"
npm start
```
You should see: `🚀 Server running on http://localhost:5000`

### Step 2: Get Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **"Places API (New)"**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### Step 3: Configure API Key
Edit `travel planner\backend\.env`:
```
GOOGLE_PLACES_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### Step 4: Start MongoDB (if not running)
- **Windows**: Start MongoDB service or run `mongod`
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### Step 5: Test Everything
1. Go to your travel planner app
2. Navigate to Destinations page
3. Click **"Test System"** button
4. Fix any red errors shown

## 🎯 Quick Test

Once setup is complete:

1. **Test System**: Click "Test System" button - all should be green ✅
2. **Import Data**: Click "Import Popular Destinations" 
3. **View Results**: See 15 famous landmarks with real Google data
4. **Browse Photos**: Click "View All Photos Gallery"

## 🔧 Troubleshooting

### "Backend server not running"
```bash
cd "travel planner\backend"
npm install
npm start
```

### "Google Places API key not configured"
- Make sure you have a valid API key
- Check `.env` file has correct key
- Restart backend server after changing `.env`

### "Database connection issue"
- Start MongoDB service
- Check MongoDB is running on port 27017
- Default connection: `mongodb://localhost:27017/travel_planner`

### "No destinations found"
- Click "Import Popular Destinations" button
- This will add 15 famous landmarks automatically
- Each destination will have real Google Places data

## 📱 What You'll See After Setup

### Destinations Page
- **Real place data** from Google Places API
- **Actual photos** (not stock images)
- **Complete information**: hours, phone, website, services
- **Service tags**: takeout, delivery, kid-friendly, etc.
- **Ratings and reviews** from Google users

### Photos Gallery
- **High-quality photos** organized by category
- **Photo types**: exterior, interior, food, atmosphere
- **Grid/list views** with photo details
- **Attribution** for photographers

### Place Details
- **80+ data fields** per destination
- **Opening hours** with current status
- **Contact information** (phone, website)
- **Amenities**: parking, payment options, accessibility
- **User reviews** with ratings and dates

## 🎉 Success Indicators

✅ **Backend**: Server running on port 5000  
✅ **API**: Google Places API responding  
✅ **Database**: MongoDB connected  
✅ **Data**: Destinations imported successfully  
✅ **Photos**: Real Google Places photos loading  

## 🚀 Next Steps

Once everything is working:

1. **Explore**: Browse the imported destinations
2. **Search**: Add new places using the search bar
3. **Photos**: Check out the comprehensive photo gallery
4. **Details**: Click on destinations to see full information

## 💡 Pro Tips

- **API Quota**: Google Places API has daily limits - monitor usage
- **Performance**: Photos are cached for better loading
- **Data**: All place data is stored locally in MongoDB
- **Updates**: Place data stays current through Google's API

Your travel planner now has access to Google's complete places database with real photos, reviews, and detailed information for millions of locations worldwide!

## 🆘 Still Having Issues?

1. Click **"Test System"** button for detailed diagnostics
2. Check browser console for error messages
3. Verify all 3 components are running (backend, API, database)
4. Make sure ports 5000 (backend) and 27017 (MongoDB) are available

The test page will show exactly what needs to be fixed! 🔍
