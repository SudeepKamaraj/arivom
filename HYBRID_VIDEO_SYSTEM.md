# 🎬 Hybrid Video System Guide - YouTube + Local Videos

## 🚀 What's New

Your platform now supports **both YouTube and local videos** with different access levels:

- **🆓 YouTube Videos**: Free, public access for everyone
- **💎 Local Videos**: Premium, secure access for paid courses

## 📹 How to Add Videos

### Method 1: Add YouTube Video (Easiest!)

#### Option A: Via API (Recommended)
```bash
curl -X POST https://arivom-backend.onrender.com/api/videos/add-youtube \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=Ke90Tje7VS0",
    "title": "React in 100 Seconds",
    "courseId": "react-course",
    "lessonId": "react-intro",
    "duration": 150
  }'
```

#### Option B: Direct Code Addition
```javascript
// Add to VIDEO_DATA in backend/routes/videos.js
'your-lesson-id': {
  type: 'youtube',
  youtubeId: 'Ke90Tje7VS0',  // Extracted from URL automatically
  title: 'Your Video Title',
  duration: 150,
  thumbnail: 'https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg',
  courseId: 'your-course',
  isPublic: true,
  requiresAuth: false
}
```

### Method 2: Add Local Video (Premium Content)

```javascript
// Upload video first, then add to VIDEO_DATA
'premium-lesson': {
  type: 'local',
  videoId: 'generated-hash-from-filename',
  title: 'Premium Advanced Tutorial',
  duration: 720,
  thumbnail: 'your-thumbnail-url',
  courseId: 'premium-course',
  isPublic: false,
  requiresAuth: true,
  requiresSecureAccess: true
}
```

## 🎯 Supported YouTube URL Formats

The system automatically extracts video IDs from:

```javascript
// All these work automatically:
'https://www.youtube.com/watch?v=Ke90Tje7VS0'
'https://youtu.be/Ke90Tje7VS0'
'https://www.youtube.com/embed/Ke90Tje7VS0'
'https://m.youtube.com/watch?v=Ke90Tje7VS0'
'https://youtube.com/watch?v=Ke90Tje7VS0&t=30s'
```

## 🔄 How It Works

### Frontend Flow:
```javascript
// 1. Get video metadata
const metadata = await api.get('/videos/metadata/lesson-id');

// 2A. For YouTube videos:
if (metadata.type === 'youtube') {
  // Use embedUrl directly - no authentication needed
  setVideoSrc(metadata.embedUrl);
}

// 2B. For local videos:
if (metadata.type === 'local') {
  // Request secure URL - authentication required
  const secureUrl = await api.post('/video-stream/secure-url', {
    videoId: metadata.videoId,
    courseId: metadata.courseId
  });
  setVideoSrc(secureUrl.url);
}
```

### Backend Response Examples:

#### YouTube Video Response:
```json
{
  "id": "react-lesson-1",
  "title": "Introduction to React",
  "type": "youtube",
  "youtubeId": "Ke90Tje7VS0",
  "embedUrl": "https://www.youtube.com/embed/Ke90Tje7VS0?rel=0&modestbranding=1",
  "thumbnail": "https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg",
  "isPublic": true,
  "accessType": "public",
  "message": "YouTube video - publicly accessible"
}
```

#### Local Video Response:
```json
{
  "id": "premium-lesson-1",
  "title": "Advanced React Patterns",
  "type": "local",
  "videoId": "abc123def456",
  "requiresSecureAccess": true,
  "isPublic": false,
  "accessType": "premium",
  "message": "Premium video - requires course enrollment"
}
```

## 🎨 Frontend Component Usage

```tsx
// Universal video player handles both types automatically
<VideoPlayer 
  lessonId="react-lesson-1" 
  courseId="react-course" 
/>
```

The component automatically:
- ✅ Detects video type (YouTube/local)
- ✅ Shows appropriate player (iframe/video)
- ✅ Handles authentication for premium content
- ✅ Displays access level badges
- ✅ Manages error states

## 🏗️ Course Strategy Examples

### Strategy 1: Free Preview + Premium Content
```javascript
const course = {
  lessons: [
    {
      id: 'intro',
      title: 'Course Introduction',
      type: 'youtube',
      youtubeId: 'preview-video',
      isPublic: true  // Hook users with free content
    },
    {
      id: 'lesson-1',
      title: 'Deep Dive Tutorial',
      type: 'local',
      videoId: 'premium-content',
      isPublic: false  // Convert to premium
    }
  ]
}
```

### Strategy 2: Tiered Access
```javascript
// Free tier: YouTube videos only
// Premium tier: Both YouTube + local videos
// Enterprise tier: All content + additional features
```

### Strategy 3: Mixed Content
```javascript
// Tutorials: YouTube (easy to update, SEO benefits)
// Exercises: Local videos (secure, course-specific)
// Live sessions: YouTube (broad reach)
// Premium workshops: Local (exclusive access)
```

## 📊 Comparison: YouTube vs Local

| Feature | YouTube Videos | Local Videos |
|---------|---------------|--------------|
| **Access** | 🆓 Public, free | 💎 Premium, paid |
| **Authentication** | ❌ Not required | ✅ Required |
| **Course Enrollment** | ❌ Not checked | ✅ Verified |
| **URL Security** | 🔓 Public YouTube URL | 🔒 Signed, expiring tokens |
| **Hosting Cost** | 🆓 Free (YouTube) | 💰 Your server/storage |
| **Bandwidth** | 🚀 YouTube's CDN | 📡 Your server |
| **SEO Benefits** | ✅ YouTube SEO | ❌ Not indexed |
| **Customization** | ⚙️ Limited | 🎨 Full control |
| **Analytics** | 📊 YouTube Analytics | 📈 Your tracking |
| **Content Security** | 🌐 Public on YouTube | 🛡️ Fully protected |

## 🚀 Benefits of This Hybrid Approach

### 1. **Marketing Strategy**
- Use YouTube videos as course previews
- Free content attracts users
- Premium content converts to sales

### 2. **Cost Optimization**
- YouTube handles free content bandwidth
- You only host premium content
- Reduced server costs

### 3. **SEO & Discovery**
- YouTube videos improve discoverability
- Search engine optimization
- Social media sharing

### 4. **Content Protection**
- Premium content fully protected
- Free content for marketing
- Balanced security approach

### 5. **Scalability**
- YouTube scales automatically
- Reduced server load
- Better performance

## 🛠️ API Endpoints

### New Endpoints:
```http
POST /api/videos/add-youtube
GET  /api/videos/by-type/:type
GET  /api/videos/metadata/:lessonId  # Now returns type info
```

### Existing Endpoints (Enhanced):
```http
GET  /api/videos/list                # Now shows both types
POST /api/video-stream/secure-url    # For local videos only
GET  /api/video-stream/stream/:token # For local videos only
```

## 📝 Quick Start

1. **Add a YouTube video:**
```bash
curl -X POST YOUR_API/videos/add-youtube \
  -d '{"youtubeUrl": "https://youtu.be/VIDEO_ID", "title": "Title", "courseId": "course", "lessonId": "lesson"}'
```

2. **Test the video:**
```bash
curl YOUR_API/videos/metadata/lesson-id
```

3. **Use in frontend:**
```tsx
<VideoPlayer lessonId="lesson-id" />
```

## 🎯 Best Practices

### Content Strategy:
- **Free YouTube videos**: Course introductions, basic tutorials
- **Premium local videos**: Advanced content, exclusive materials
- **Mix both**: Create compelling learning journeys

### Security:
- YouTube videos: No security needed (public by design)
- Local videos: Use existing secure streaming system

### Performance:
- YouTube videos load faster (CDN)
- Local videos need proper caching
- Consider user's internet speed

This hybrid system gives you the best of both worlds: the reach and performance of YouTube with the security and control of local hosting! 🎬✨