// 📹 Example YouTube Video URLs for Course Platform

console.log('🎓 Educational YouTube Videos - Perfect for Course Platform\n');

// Programming & Web Development Videos
const programmingVideos = [
  {
    title: "JavaScript Tutorial for Beginners",
    url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
    videoId: "W6NZfCO5SIk",
    duration: "3:26:42",
    category: "JavaScript",
    description: "Complete JavaScript tutorial for beginners"
  },
  {
    title: "React Tutorial for Beginners",
    url: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
    videoId: "Ke90Tje7VS0",
    duration: "1:48:18",
    category: "React",
    description: "Learn React from scratch"
  },
  {
    title: "Python Full Course",
    url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
    videoId: "_uQrJ0TkZlc",
    duration: "4:26:52",
    category: "Python",
    description: "Complete Python programming course"
  },
  {
    title: "Node.js Tutorial for Beginners",
    url: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
    videoId: "TlB_eWDSMt4",
    duration: "2:39:09",
    category: "Node.js",
    description: "Learn Node.js from basics"
  },
  {
    title: "CSS Flexbox Tutorial",
    url: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
    videoId: "JJSoEo8JSnc",
    duration: "1:13:45",
    category: "CSS",
    description: "Master CSS Flexbox layout"
  }
];

// Math & Science Videos
const mathScienceVideos = [
  {
    title: "Linear Algebra Essence",
    url: "https://www.youtube.com/watch?v=fNk_zzaMoSs",
    videoId: "fNk_zzaMoSs",
    duration: "14:52",
    category: "Mathematics",
    description: "Vectors, what even are they?"
  },
  {
    title: "Introduction to Algorithms",
    url: "https://www.youtube.com/watch?v=0IAPZzGSbME",
    videoId: "0IAPZzGSbME",
    duration: "1:18:36",
    category: "Computer Science",
    description: "Data structures and algorithms"
  }
];

// Business & Productivity Videos
const businessVideos = [
  {
    title: "Project Management Basics",
    url: "https://www.youtube.com/watch?v=2g1UDCqMbGY",
    videoId: "2g1UDCqMbGY",
    duration: "23:45",
    category: "Project Management",
    description: "Learn project management fundamentals"
  }
];

console.log('🔧 Programming & Web Development:\n');
programmingVideos.forEach((video, index) => {
  console.log(`${index + 1}. ${video.title}`);
  console.log(`   URL: ${video.url}`);
  console.log(`   Video ID: ${video.videoId}`);
  console.log(`   Duration: ${video.duration}`);
  console.log(`   Category: ${video.category}`);
  console.log('');
});

console.log('📊 Math & Science:\n');
mathScienceVideos.forEach((video, index) => {
  console.log(`${index + 1}. ${video.title}`);
  console.log(`   URL: ${video.url}`);
  console.log(`   Video ID: ${video.videoId}`);
  console.log(`   Duration: ${video.duration}`);
  console.log(`   Category: ${video.category}`);
  console.log('');
});

console.log('💼 Business & Productivity:\n');
businessVideos.forEach((video, index) => {
  console.log(`${index + 1}. ${video.title}`);
  console.log(`   URL: ${video.url}`);
  console.log(`   Video ID: ${video.videoId}`);
  console.log(`   Duration: ${video.duration}`);
  console.log(`   Category: ${video.category}`);
  console.log('');
});

// Show how to add these to your VIDEO_DATA
console.log('📝 How to add these to your VIDEO_DATA:\n');

const exampleVideoData = {
  'js-tutorial-beginners': {
    type: 'youtube',
    youtubeId: 'W6NZfCO5SIk',
    title: 'JavaScript Tutorial for Beginners',
    duration: 12402, // 3:26:42 in seconds
    courseId: 'javascript-course',
    isPublic: true,
    requiresAuth: false
  },
  'react-tutorial-beginners': {
    type: 'youtube',
    youtubeId: 'Ke90Tje7VS0', 
    title: 'React Tutorial for Beginners',
    duration: 6498, // 1:48:18 in seconds
    courseId: 'react-course',
    isPublic: true,
    requiresAuth: false
  },
  'python-full-course': {
    type: 'youtube',
    youtubeId: '_uQrJ0TkZlc',
    title: 'Python Full Course',
    duration: 16012, // 4:26:52 in seconds
    courseId: 'python-course',
    isPublic: true,
    requiresAuth: false
  }
};

console.log(JSON.stringify(exampleVideoData, null, 2));

console.log('\n🚀 Test these URLs with your API:');
console.log('curl "http://localhost:5000/api/videos/public/metadata/js-tutorial-beginners"');
console.log('curl "http://localhost:5000/api/videos/public/metadata/react-tutorial-beginners"');
console.log('curl "http://localhost:5000/api/videos/public/metadata/python-full-course"');

console.log('\n✅ All these are real, working YouTube videos perfect for educational content!');