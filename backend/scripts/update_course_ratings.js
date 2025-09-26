const mongoose = require('mongoose');
const Course = require('../models/Course');
const Review = require('../models/Review');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);

const updateCourseRatings = async () => {
  try {
    console.log('Starting course rating update...');

    // Get all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to update`);

    let updatedCount = 0;

    for (const course of courses) {
      // Initialize rating object if it doesn't exist or is malformed
      if (!course.rating || typeof course.rating !== 'object' || 
          course.rating.average === undefined || course.rating.count === undefined) {
        
        console.log(`Updating course: ${course.title}`);
        
        // Calculate proper rating from existing reviews
        const ratingData = await Review.calculateCourseRating(course._id);
        
        // Update the course with calculated rating
        await Course.findByIdAndUpdate(course._id, {
          'rating.average': ratingData.average,
          'rating.count': ratingData.count
        });
        
        updatedCount++;
        console.log(`✅ Updated ${course.title}: Average ${ratingData.average}, Count ${ratingData.count}`);
      } else {
        // Course already has proper rating structure, but let's recalculate to ensure accuracy
        const ratingData = await Review.calculateCourseRating(course._id);
        
        if (course.rating.average !== ratingData.average || course.rating.count !== ratingData.count) {
          await Course.findByIdAndUpdate(course._id, {
            'rating.average': ratingData.average,
            'rating.count': ratingData.count
          });
          
          updatedCount++;
          console.log(`🔄 Recalculated ${course.title}: Average ${ratingData.average}, Count ${ratingData.count}`);
        } else {
          console.log(`✓ ${course.title}: Already correct (Average ${course.rating.average}, Count ${course.rating.count})`);
        }
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} courses`);
    console.log('All courses now have proper rating structure starting from 0');

    // Display summary of all course ratings
    const updatedCourses = await Course.find({}).select('title rating');
    console.log('\n📊 Course Rating Summary:');
    updatedCourses.forEach(course => {
      const rating = course.rating.average === 0 ? 'No ratings yet' : `${course.rating.average}/5 (${course.rating.count} reviews)`;
      console.log(`${course.title}: ${rating}`);
    });

  } catch (error) {
    console.error('Error updating course ratings:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the update script
updateCourseRatings();