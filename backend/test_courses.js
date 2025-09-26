const mongoose = require('mongoose');
const Course = require('./models/Course');

require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to database');
  
  // Check database and collection
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Available collections:', collections.map(c => c.name));
  
  // Try to find courses
  const courses = await Course.find({});
  console.log('Found courses:', courses.length);
  
  // Also try direct collection access
  const coursesCollection = db.collection('courses');
  const directCourses = await coursesCollection.find({}).toArray();
  console.log('Direct courses:', directCourses.length);
  
  courses.forEach((c, i) => {
    console.log(`${i+1}. ${c.title}`);
    console.log(`   Rating:`, c.rating);
  });
  
  mongoose.connection.close();
}).catch(console.error);