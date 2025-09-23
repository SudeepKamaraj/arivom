# 🔒 Secure Video Streaming System

## Overview

This system provides secure video delivery without exposing local file paths or direct URLs. Videos are served through authenticated, time-limited, signed URLs that protect your content from unauthorized access.

## 🚀 Key Features

### ✅ **Security Features**
- **No Direct URLs**: Video files are never exposed through direct paths
- **Token-Based Access**: All video requests require valid authentication tokens
- **Time-Limited URLs**: Video URLs expire after 1 hour (configurable)
- **Course Enrollment Check**: Users can only access videos from courses they've paid for
- **Signed URLs**: Cryptographically signed tokens prevent tampering

### ✅ **Technical Features**
- **Range Request Support**: Enables video seeking and progressive loading
- **Proper MIME Types**: Correct video/mp4 content type headers
- **Error Handling**: Comprehensive error responses for various failure scenarios
- **Logging**: Activity tracking for video access and viewing

## 🏗️ Architecture

```
Frontend Request → Authentication → Course Access Check → Token Generation → Secure Stream
```

### Components

1. **Video Streaming Route** (`/api/video-stream/`)
   - Handles secure URL generation
   - Manages token verification
   - Streams video content with range support

2. **Video Metadata Route** (`/api/videos/metadata/:lessonId`)
   - Returns video information without URLs
   - Provides videoId and courseId for secure access requests

3. **Course Access Middleware**
   - Checks if user has paid for course
   - Validates course enrollment
   - Supports free courses

4. **Token System**
   - HMAC-SHA256 signed tokens
   - JSON payload with expiration
   - User and video binding

## 📡 API Endpoints

### 1. Get Video Metadata
```http
GET /api/videos/metadata/:lessonId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "react-lesson-1",
  "title": "Introduction to React",
  "duration": 596,
  "thumbnail": "https://...",
  "videoId": "abc123...",
  "courseId": "react-course",
  "quality": "720p",
  "requiresSecureAccess": true
}
```

### 2. Request Secure Video URL
```http
POST /api/video-stream/secure-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "abc123...",
  "courseId": "react-course"
}
```

**Response:**
```json
{
  "url": "/api/video-stream/stream/eyJ2aWRlb0lkIjoi...",
  "expiresIn": 3600,
  "message": "Secure video URL generated"
}
```

### 3. Stream Video
```http
GET /api/video-stream/stream/:token
Range: bytes=0-1023 (optional, for seeking)
```

**Response:** Video stream with proper headers

## 🔧 Implementation Guide

### Backend Setup

1. **Add Video Streaming Route**
```javascript
// server.js
app.use('/api/video-stream', require('./routes/video-stream'));
```

2. **Environment Variables**
```bash
VIDEO_SECRET=your-secret-key-for-signing-tokens
NODE_ENV=production
```

3. **Video File Organization**
```
backend/
  public/
    videos/
      video1.mp4
      video2.mp4
```

### Frontend Implementation

```typescript
// Secure video component usage
const VideoPlayer = ({ lessonId, courseId }) => {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    async function loadVideo() {
      // 1. Get metadata
      const metadata = await api.get(`/videos/metadata/${lessonId}`);
      
      // 2. Request secure URL
      const secureUrl = await api.post('/video-stream/secure-url', {
        videoId: metadata.data.videoId,
        courseId: metadata.data.courseId
      });
      
      // 3. Set video URL
      setVideoUrl(`${API_BASE}${secureUrl.data.url}`);
    }
    
    loadVideo();
  }, [lessonId]);

  return <video src={videoUrl} controls />;
};
```

## 🛡️ Security Considerations

### Token Security
- Tokens are signed with HMAC-SHA256
- Include expiration timestamps
- Bind to specific user and video
- Cannot be forged without secret key

### Access Control
- Course enrollment verification
- User authentication required
- Role-based access (admin features)
- Time-limited access (default: 1 hour)

### File Protection
- No direct file system access
- Videos served only through controlled endpoints
- No URL guessing possible
- Range request support for performance

## 🚀 Deployment Steps

1. **Deploy Updated Backend**
```bash
git add .
git commit -m "Add secure video streaming system"
git push origin main
```

2. **Set Environment Variables**
```bash
VIDEO_SECRET=your-random-secret-key-here
NODE_ENV=production
```

3. **Update Frontend**
- Replace direct video URLs with secure API calls
- Implement token refresh logic
- Add error handling for expired tokens

## 📊 Benefits vs Traditional Static Serving

| Feature | Static Serving | Secure Streaming |
|---------|---------------|------------------|
| URL Exposure | ❌ Direct paths visible | ✅ Hidden behind tokens |
| Access Control | ❌ Anyone with URL | ✅ Authenticated users only |
| Course Protection | ❌ No enrollment check | ✅ Paid course verification |
| Time Limits | ❌ Permanent access | ✅ Expiring URLs |
| Content Security | ❌ Easy to download | ✅ Controlled access |
| Video Seeking | ✅ Range requests | ✅ Range requests |
| Performance | ✅ Direct serving | ✅ Optimized streaming |

## 🔄 Migration from Static URLs

1. **Phase 1**: Deploy secure streaming alongside static
2. **Phase 2**: Update frontend to use secure endpoints
3. **Phase 3**: Remove static video serving
4. **Phase 4**: Move videos to private storage (optional)

## 🧪 Testing

Run the test script to verify implementation:
```bash
node test_secure_video_system.js
```

This tests:
- Authentication flow
- Video metadata retrieval
- Secure URL generation
- Video streaming access
- Token validation

## 🎯 Future Enhancements

- **Cloud Storage Integration**: AWS S3, Google Cloud Storage
- **CDN Integration**: CloudFront, CloudFlare
- **Adaptive Streaming**: Multiple quality levels
- **Analytics**: Detailed viewing statistics
- **Watermarking**: User-specific video watermarks
- **Download Prevention**: Additional DRM protection

## 🆘 Troubleshooting

### Common Issues

1. **Token Expired Error**
   - Solution: Request new secure URL
   - Prevention: Implement automatic token refresh

2. **Access Denied Error**
   - Check course enrollment status
   - Verify payment records
   - Confirm user authentication

3. **Video Not Found**
   - Verify video file exists in backend/public/videos/
   - Check video ID mapping
   - Confirm file permissions

4. **Streaming Issues**
   - Check Range header support
   - Verify MIME type configuration
   - Test with different browsers

This secure video streaming system provides enterprise-level protection for your course content while maintaining excellent user experience!