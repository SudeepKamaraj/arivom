// Comprehensive test for YouTube URL functionality

const youtube = require('./backend/utils/youtube');

console.log('🧪 Comprehensive YouTube URL Test\n');

// Test 1: URL Extraction
console.log('1. Testing URL extraction:');
const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
  'invalid-url',
  '',
  null
];

testUrls.forEach((url, index) => {
  try {
    const videoId = youtube.extractYouTubeVideoId(url);
    console.log(`   ${index + 1}. ✅ "${url}" → ${videoId}`);
  } catch (error) {
    console.log(`   ${index + 1}. ❌ "${url}" → Error: ${error.message}`);
  }
});

// Test 2: Video ID Validation
console.log('\n2. Testing video ID validation:');
const testIds = ['dQw4w9WgXcQ', 'invalid', '', null, '123', 'dQw4w9WgXcQextra'];

testIds.forEach((id, index) => {
  const isValid = youtube.isValidYouTubeVideoId(id);
  console.log(`   ${index + 1}. ${isValid ? '✅' : '❌'} "${id}" → ${isValid}`);
});

// Test 3: Embed URL Generation
console.log('\n3. Testing embed URL generation:');
try {
  const embedUrl = youtube.generateYouTubeEmbedUrl('dQw4w9WgXcQ');
  console.log(`   ✅ Embed URL: ${embedUrl}`);
  
  const embedUrlWithOptions = youtube.generateYouTubeEmbedUrl('dQw4w9WgXcQ', {
    autoplay: true,
    start: 30,
    mute: true
  });
  console.log(`   ✅ Embed URL with options: ${embedUrlWithOptions}`);
} catch (error) {
  console.log(`   ❌ Embed URL error: ${error.message}`);
}

// Test 4: Thumbnail Generation
console.log('\n4. Testing thumbnail generation:');
try {
  const thumbnail = youtube.generateYouTubeThumbnail('dQw4w9WgXcQ');
  console.log(`   ✅ Thumbnail: ${thumbnail}`);
  
  const thumbnailHQ = youtube.generateYouTubeThumbnail('dQw4w9WgXcQ', 'maxresdefault');
  console.log(`   ✅ High quality thumbnail: ${thumbnailHQ}`);
} catch (error) {
  console.log(`   ❌ Thumbnail error: ${error.message}`);
}

// Test 5: URL Type Detection
console.log('\n5. Testing URL type detection:');
const mixedUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://example.com/video.mp4',
  '/local/video.mp4',
  ''
];

mixedUrls.forEach((url, index) => {
  const isYT = youtube.isYouTubeUrl(url);
  const type = youtube.getVideoType(url);
  console.log(`   ${index + 1}. "${url}" → YouTube: ${isYT}, Type: ${type}`);
});

// Test 6: Process Video URL
console.log('\n6. Testing processVideoUrl:');
try {
  const processed = youtube.processVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    title: 'Test Video',
    courseId: 'test-course'
  });
  console.log('   ✅ Processed video data:', {
    type: processed.type,
    youtubeId: processed.youtubeId,
    title: processed.title,
    isPublic: processed.isPublic
  });
} catch (error) {
  console.log(`   ❌ Process URL error: ${error.message}`);
}

console.log('\n🎉 YouTube URL test completed!');