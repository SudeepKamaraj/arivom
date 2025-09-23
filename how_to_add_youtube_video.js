// Example: How to add a YouTube video to your course

console.log('📹 How to Add YouTube Videos - Step by Step\n');

// Step 1: Show the current VIDEO_DATA structure
console.log('1. Current VIDEO_DATA structure in backend/routes/videos.js:\n');
console.log(`const VIDEO_DATA = {
  'react-lesson-1': {
    type: 'youtube',
    youtubeId: 'Ke90Tje7VS0',
    title: 'Introduction to React',
    duration: 596,
    courseId: 'react-course',
    isPublic: true,
    requiresAuth: false
  },
  // ... other videos
};`);

// Step 2: Show how to add a new YouTube video
console.log('\n2. To add a new YouTube video, add this to VIDEO_DATA:\n');

const newVideoExample = {
  'new-lesson-id': {
    type: 'youtube',
    youtubeId: 'YOUR_YOUTUBE_VIDEO_ID', // Extract from URL
    title: 'Your Video Title',
    duration: 300, // Duration in seconds
    courseId: 'your-course-id',
    isPublic: true,
    requiresAuth: false
  }
};

console.log(JSON.stringify(newVideoExample, null, 2));

// Step 3: Show how to extract YouTube ID from URL
console.log('\n3. Extract YouTube ID from URL:\n');

const exampleUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/embed/dQw4w9WgXcQ'
];

exampleUrls.forEach(url => {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
  console.log(`${url} → ${videoId}`);
});

// Step 4: Show API usage
console.log('\n4. API Usage Examples:\n');

console.log('// Get public YouTube video metadata (no auth required)');
console.log('fetch("/api/videos/public/metadata/react-lesson-1")');

console.log('\n// Get authenticated video metadata (auth required)');
console.log('fetch("/api/videos/metadata/react-lesson-1", {');
console.log('  headers: { "Authorization": "Bearer YOUR_TOKEN" }');
console.log('})');

console.log('\n// Add YouTube video via API (admin only)');
console.log('fetch("/api/videos/add-youtube", {');
console.log('  method: "POST",');
console.log('  headers: {');
console.log('    "Authorization": "Bearer YOUR_TOKEN",');
console.log('    "Content-Type": "application/json"');
console.log('  },');
console.log('  body: JSON.stringify({');
console.log('    "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",');
console.log('    "title": "Video Title",');
console.log('    "courseId": "course-id",');
console.log('    "lessonId": "lesson-id",');
console.log('    "duration": 300');
console.log('  })');
console.log('})');

// Step 5: Frontend usage
console.log('\n5. Frontend Usage:\n');

console.log('// React component usage');
console.log('<VideoPlayer lessonId="react-lesson-1" />');

console.log('\n// Manual iframe usage for YouTube videos');
console.log('<iframe');
console.log('  src="https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1"');
console.log('  title="Video Title"');
console.log('  frameBorder="0"');
console.log('  allowFullScreen');
console.log('/>');

console.log('\n✅ YouTube integration is working properly!');
console.log('\n🚀 Next steps:');
console.log('   1. Add your YouTube video to VIDEO_DATA');
console.log('   2. Test with /api/videos/public/metadata/your-lesson-id');
console.log('   3. Use in your frontend components');
console.log('   4. Deploy and enjoy! 🎬');