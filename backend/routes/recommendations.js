const express = require('express');
const { auth } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

const router = express.Router();

// Get personalized course recommendations based on user skills and interests
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, category, level } = req.query;
    
    // Get user profile with skills and interests
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's enrolled courses to avoid recommending already enrolled courses
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': userId
    }).select('_id');
    
    const enrolledCourseIds = enrolledCourses.map(course => course._id.toString());
    
    // Build recommendation query
    let query = { 
      isPublished: true,
      _id: { $nin: enrolledCourseIds } // Exclude already enrolled courses
    };
    
    // Apply filters if provided
    if (category) query.category = category;
    if (level) query.level = level;
    
    // Get all available courses
    let courses = await Course.find(query);
    
    // Calculate recommendation scores based on user profile
    const recommendedCourses = courses.map(course => {
      let score = 0;
      const reasons = [];
      
      // Check if user has completed similar courses (negative scoring to avoid duplicates)
      if (user.completedCourses && user.completedCourses.length > 0) {
        const similarCompleted = user.completedCourses.filter(completed => 
          course.title?.toLowerCase().includes(completed.toLowerCase()) ||
          completed.toLowerCase().includes(course.title?.toLowerCase()) ||
          course.category?.toLowerCase().includes(completed.toLowerCase())
        );
        
        if (similarCompleted.length > 0) {
          score -= 20; // Reduce score for similar completed courses
          reasons.push(`Similar to completed: ${similarCompleted[0]}`);
        }
      }
      
      // Score based on user skills (40% weight)
      if (user.skills && user.skills.length > 0) {
        const skillMatches = user.skills.filter(userSkill => 
          course.skills?.some(courseSkill => 
            courseSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
            userSkill.toLowerCase().includes(courseSkill.toLowerCase())
          ) ||
          course.category?.toLowerCase().includes(userSkill.toLowerCase()) ||
          course.title?.toLowerCase().includes(userSkill.toLowerCase())
        );
        
        if (skillMatches.length > 0) {
          score += (skillMatches.length / user.skills.length) * 40;
          reasons.push(`Matches ${skillMatches.length} of your skills`);
        }
      }
      
      // Score based on user interests (30% weight)
      if (user.interests && user.interests.length > 0) {
        const interestMatches = user.interests.filter(userInterest => 
          course.category?.toLowerCase().includes(userInterest.toLowerCase()) ||
          course.title?.toLowerCase().includes(userInterest.toLowerCase()) ||
          course.description?.toLowerCase().includes(userInterest.toLowerCase())
        );
        
        if (interestMatches.length > 0) {
          score += (interestMatches.length / user.interests.length) * 30;
          reasons.push(`Aligns with your interests in ${interestMatches.join(', ')}`);
        }
      }
      
      // Score based on experience level (20% weight)
      if (user.experienceLevel && course.level) {
        const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
        const userLevelIndex = experienceLevels.indexOf(user.experienceLevel);
        const courseLevelIndex = experienceLevels.indexOf(course.level);
        
        if (userLevelIndex !== -1 && courseLevelIndex !== -1) {
          // Prefer courses at user's level or one level above
          if (courseLevelIndex === userLevelIndex) {
            score += 20;
            reasons.push(`Perfect match for your ${user.experienceLevel} level`);
          } else if (courseLevelIndex === userLevelIndex + 1) {
            score += 15;
            reasons.push(`Great next step from your ${user.experienceLevel} level`);
          } else if (courseLevelIndex === userLevelIndex - 1) {
            score += 10;
            reasons.push(`Good refresher for your ${user.experienceLevel} level`);
          }
        }
      }
      
      // Bonus for progression courses (based on completed courses)
      if (user.completedCourses && user.completedCourses.length > 0) {
        const progressionBonus = user.completedCourses.filter(completed => {
          // Check if this course is a logical next step
          const isProgression = (
            (completed.toLowerCase().includes('beginner') && course.level === 'Intermediate') ||
            (completed.toLowerCase().includes('intermediate') && course.level === 'Advanced') ||
            (completed.toLowerCase().includes('basic') && course.level !== 'Beginner')
          );
          return isProgression;
        });
        
        if (progressionBonus.length > 0) {
          score += 15;
          reasons.push('Great next step in your learning journey');
        }
      }
      
      // Bonus points for popular courses (10% weight)
      if (course.rating && course.rating.average >= 4.0) {
        score += 5;
        reasons.push(`Highly rated (${course.rating.average}/5)`);
      }
      
      if (course.students >= 1000) {
        score += 5;
        reasons.push(`Popular with ${course.students.toLocaleString()} students`);
      }
      
      // If no specific matches, give a base score for discovery
      if (score <= 0) {
        score = 10;
        reasons.push('Recommended for skill expansion');
      }
      
      return {
        ...course.toObject(),
        recommendationScore: Math.round(score),
        recommendationReasons: reasons,
        matchType: score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low'
      };
    });
    
    // Sort by recommendation score
    recommendedCourses.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    // Limit results
    const limitedCourses = recommendedCourses.slice(0, parseInt(limit));
    
    res.json({
      recommendations: limitedCourses,
      total: recommendedCourses.length,
      userProfile: {
        skills: user.skills || [],
        interests: user.interests || [],
        experienceLevel: user.experienceLevel || 'Beginner',
        completedCourses: user.completedCourses || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching course recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// Get recommendations by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 6 } = req.query;
    const userId = req.user._id;
    
    // Get user's enrolled courses to avoid duplicates
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': userId
    }).select('_id');
    
    const enrolledCourseIds = enrolledCourses.map(course => course._id.toString());
    
    const courses = await Course.find({
      category: { $regex: category, $options: 'i' },
      isPublished: true,
      _id: { $nin: enrolledCourseIds }
    })
    .sort({ 'rating.average': -1, students: -1 })
    .limit(parseInt(limit));
    
    res.json({
      category,
      courses,
      total: courses.length
    });
    
  } catch (error) {
    console.error('Error fetching category recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch category recommendations' });
  }
});

// Get trending courses
router.get('/trending', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    // Get trending courses based on recent enrollments and ratings
    const courses = await Course.find({ isPublished: true })
      .sort({ 
        students: -1, 
        'rating.average': -1,
        createdAt: -1 
      })
      .limit(parseInt(limit));
    
    res.json({
      trending: courses,
      total: courses.length
    });
    
  } catch (error) {
    console.error('Error fetching trending courses:', error);
    res.status(500).json({ message: 'Failed to fetch trending courses' });
  }
});

// Get similar courses based on a specific course
router.get('/similar/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { limit = 6 } = req.query;
    
    const baseCourse = await Course.findById(courseId);
    if (!baseCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find similar courses based on category, skills, and level
    const similarCourses = await Course.find({
      _id: { $ne: courseId },
      isPublished: true,
      $or: [
        { category: baseCourse.category },
        { level: baseCourse.level },
        { skills: { $in: baseCourse.skills || [] } }
      ]
    })
    .sort({ 'rating.average': -1, students: -1 })
    .limit(parseInt(limit));
    
    res.json({
      baseCourse: {
        id: baseCourse._id,
        title: baseCourse.title,
        category: baseCourse.category
      },
      similarCourses,
      total: similarCourses.length
    });
    
  } catch (error) {
    console.error('Error fetching similar courses:', error);
    res.status(500).json({ message: 'Failed to fetch similar courses' });
  }
});

module.exports = router;
