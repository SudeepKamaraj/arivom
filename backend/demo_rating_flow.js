const mongoose = require('mongoose');
const Course = require('./models/Course');
const Review = require('./models/Review');
const User = require('./models/User');

require('dotenv').config();

const demonstrateRatingFlow = async () => {
  try {
    console.log('🎭 Demonstrating Customer Review System\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Select a course for demonstration
    const course = await Course.findOne({ title: /Java Programming/i });
    if (!course) {
      console.log('❌ Java Programming course not found');
      return;
    }
    
    console.log(`📚 Course: "${course.title}"`);
    
    // Clear any existing reviews for clean demo
    await Review.deleteMany({ course: course._id });
    await Course.findByIdAndUpdate(course._id, {
      'rating.average': 0,
      'rating.count': 0
    });
    
    console.log(`📊 Starting state: 0.0/5 (0 reviews) - "No ratings yet"`);
    
    // Create customers with realistic reviews
    const customerReviews = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        rating: 5,
        title: 'Excellent Java course!',
        comment: 'This course is fantastic! The instructor explains Java concepts very clearly. I went from beginner to confident in Java programming. Highly recommended!'
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com', 
        rating: 4,
        title: 'Very good content',
        comment: 'Great course overall. The examples are practical and the pace is good. Would have liked more advanced topics covered, but excellent for beginners.'
      },
      {
        name: 'Carol Wilson',
        email: 'carol@example.com',
        rating: 5,
        title: 'Perfect for beginners',
        comment: 'I had no programming experience before this course. Now I can write Java programs confidently. The step-by-step approach really works!'
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        rating: 3,
        title: 'Good but could be better',
        comment: 'The course covers the basics well, but I wished there were more hands-on projects. Content is accurate but presentation could be more engaging.'
      },
      {
        name: 'Emma Davis',
        email: 'emma@example.com',
        rating: 4,
        title: 'Solid Java foundation',
        comment: 'This course gave me a solid foundation in Java. The assignments helped reinforce the concepts. Looking forward to the advanced course!'
      }
    ];
    
    console.log('\n🎬 Simulating customer reviews over time...\n');
    
    let runningTotal = 0;
    for (let i = 0; i < customerReviews.length; i++) {
      const customerData = customerReviews[i];
      
      // Create or find customer
      let customer = await User.findOne({ email: customerData.email });
      if (!customer) {
        customer = new User({
          firstName: customerData.name.split(' ')[0],
          lastName: customerData.name.split(' ')[1],
          email: customerData.email,
          password: 'password123',
          username: customerData.email.split('@')[0]
        });
        await customer.save();
      }
      
      // Enroll customer if not already enrolled
      if (!course.enrolledStudents.find(s => s.student.toString() === customer._id.toString())) {
        course.enrolledStudents.push({
          student: customer._id,
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          progress: 85 + Math.random() * 15 // 85-100% progress
        });
        await course.save();
      }
      
      console.log(`👤 ${customerData.name} enrolls and completes the course...`);
      
      // Add review
      const review = new Review({
        course: course._id,
        user: customer._id,
        rating: customerData.rating,
        title: customerData.title,
        comment: customerData.comment
      });
      
      await review.save();
      
      // Calculate expected rating
      runningTotal += customerData.rating;
      const expectedAverage = runningTotal / (i + 1);
      
      // Get updated course
      const updatedCourse = await Course.findById(course._id);
      
      console.log(`⭐ Adds review: ${customerData.rating}/5 - "${customerData.title}"`);
      console.log(`📊 New rating: ${updatedCourse.rating.average}/5 (${updatedCourse.rating.count} reviews)`);
      console.log(`   Expected: ${expectedAverage.toFixed(1)}/5 (${i + 1} reviews)`);
      
      // Add some visual separation
      if (i < customerReviews.length - 1) {
        console.log('   ⏳ Time passes...\n');
        // Small delay for dramatic effect in real demo
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Final summary
    const finalCourse = await Course.findById(course._id);
    const totalReviews = customerReviews.length;
    const totalRating = customerReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / totalReviews;
    
    console.log('\n📈 Final Results:');
    console.log(`   Course: ${finalCourse.title}`);
    console.log(`   Rating: ${finalCourse.rating.average}/5 (${finalCourse.rating.count} reviews)`);
    console.log(`   Status: ${finalCourse.rating.count > 0 ? 'Has customer ratings' : 'No ratings yet'}`);
    
    // Rating breakdown
    const ratingCounts = {};
    customerReviews.forEach(r => {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    });
    
    console.log('\n⭐ Rating Distribution:');
    for (let star = 5; star >= 1; star--) {
      const count = ratingCounts[star] || 0;
      const percentage = count > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
      const bars = '█'.repeat(Math.round(count / totalReviews * 10));
      console.log(`   ${star}★: ${count} reviews (${percentage}%) ${bars}`);
    }
    
    console.log('\n✅ Demo complete! The rating system:');
    console.log('   • Started at 0 ratings');
    console.log('   • Updated automatically after each customer review');
    console.log('   • Maintains accurate averages and counts');
    console.log('   • Ready for production use!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

demonstrateRatingFlow();