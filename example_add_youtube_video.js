// Simple example: How to add YouTube videos to your course

const { processVideoUrl } = require('./backend/utils/youtube');

// Example 1: Add a YouTube video programmatically
function addYouTubeVideo() {
  const youtubeUrl = 'https://www.youtube.com/watch?v=Ke90Tje7VS0';
  
  try {
    const videoData = processVideoUrl(youtubeUrl, {
      title: 'React in 100 Seconds',
      courseId: 'react-course',
      duration: 150
    });
    
    console.log('✅ YouTube video processed:', videoData);
    
    // This is what you'd add to your VIDEO_DATA:
    const lessonData = {
      'react-intro': {
        type: videoData.type,
        youtubeId: videoData.youtubeId,
        title: 'React in 100 Seconds',
        duration: 150,
        thumbnail: videoData.thumbnail,
        courseId: 'react-course',
        isPublic: true,
        requiresAuth: false
      }
    };
    
    console.log('📝 Add this to VIDEO_DATA:', lessonData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Example 2: Test different YouTube URL formats
function testYouTubeUrlFormats() {
  const testUrls = [
    'https://www.youtube.com/watch?v=Ke90Tje7VS0',
    'https://youtu.be/Ke90Tje7VS0',
    'https://www.youtube.com/embed/Ke90Tje7VS0',
    'https://m.youtube.com/watch?v=Ke90Tje7VS0'
  ];
  
  console.log('\n🧪 Testing different URL formats:');
  
  testUrls.forEach((url, index) => {
    try {
      const videoData = processVideoUrl(url);
      console.log(`${index + 1}. ✅ ${url} → ${videoData.youtubeId}`);
    } catch (error) {
      console.log(`${index + 1}. ❌ ${url} → Error: ${error.message}`);
    }
  });
}

// Run examples
console.log('🎬 YouTube Video Integration Examples\n');
addYouTubeVideo();
testYouTubeUrlFormats();

console.log('\n💡 To add YouTube videos to your course:');
console.log('1. 📋 Copy the lesson data from above');
console.log('2. 📝 Add it to VIDEO_DATA in backend/routes/videos.js');
console.log('3. 🚀 Deploy and test!');
console.log('\nOr use the API endpoint:');
console.log('POST /api/videos/add-youtube with the YouTube URL');