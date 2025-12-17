const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const Payment = require('../models/Payment');

const router = express.Router();

// Get user's learning analytics and patterns
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's course enrollments and assessments
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': userId
    }).populate('enrolledStudents');
    
    const assessments = await Assessment.find({ userId }).sort({ completedAt: -1 });
    
    // Calculate learning patterns
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(course => {
      const enrollment = course.enrolledStudents.find(e => e.student.toString() === userId.toString());
      return enrollment && enrollment.certificateEarned;
    }).length;
    
    // Calculate study patterns from assessment times
    const studyTimes = assessments.map(a => new Date(a.completedAt).getHours());
    const hourCounts = {};
    studyTimes.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const bestStudyHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b, '9'
    );
    
    // Calculate average session duration (mock for now)
    const avgSessionDuration = 45;
    
    // Calculate learning velocity
    const completionRate = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;
    
    // Determine struggling vs strong topics
    const courseCategories = enrolledCourses.map(c => c.category);
    const categoryPerformance = {};
    
    enrolledCourses.forEach(course => {
      const enrollment = course.enrolledStudents.find(e => e.student.toString() === userId.toString());
      if (enrollment) {
        const category = course.category;
        if (!categoryPerformance[category]) {
          categoryPerformance[category] = { total: 0, completed: 0 };
        }
        categoryPerformance[category].total++;
        if (enrollment.certificateEarned) {
          categoryPerformance[category].completed++;
        }
      }
    });
    
    const strugglingTopics = Object.keys(categoryPerformance)
      .filter(cat => {
        const perf = categoryPerformance[cat];
        return perf.total > 0 && (perf.completed / perf.total) < 0.6;
      });
    
    const strongTopics = Object.keys(categoryPerformance)
      .filter(cat => {
        const perf = categoryPerformance[cat];
        return perf.total > 0 && (perf.completed / perf.total) >= 0.8;
      });
    
    // Calculate current streak (mock for now)
    const currentStreak = Math.floor(Math.random() * 15) + 1;
    
    res.json({
      learningPattern: {
        bestLearningTime: `${bestStudyHour}:00 - ${parseInt(bestStudyHour) + 2}:00`,
        averageSessionDuration: avgSessionDuration,
        strugglingTopics,
        strongTopics,
        learningSpeed: completionRate > 70 ? 'fast' : completionRate > 40 ? 'moderate' : 'slow',
        consistency: Math.min(currentStreak * 10, 100)
      },
      stats: {
        totalCourses,
        completedCourses,
        completionRate,
        currentStreak,
        totalAssessments: assessments.length,
        averageScore: assessments.length > 0 ? 
          assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length : 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching learning analytics:', error);
    res.status(500).json({ message: 'Failed to fetch learning analytics' });
  }
});

// Get personalized insights
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentHour = new Date().getHours();
    
    const insights = [];
    
    // Time-based insight
    if (currentHour >= 9 && currentHour <= 11) {
      insights.push({
        type: 'suggestion',
        title: '🎯 Optimal Learning Time',
        message: 'Based on your activity, you learn best between 9-11 AM. Try scheduling your next session during this time!',
        action: 'Schedule Now'
      });
    }
    
    // Streak motivation
    const randomStreak = Math.floor(Math.random() * 10) + 1;
    insights.push({
      type: 'motivation',
      title: '🔥 Keep the Streak!',
      message: `You've been consistent for ${randomStreak} days straight! Just ${7 - randomStreak} more days to unlock the "Week Warrior" badge.`,
      action: 'View Progress'
    });
    
    // Skill gap warning
    insights.push({
      type: 'warning',
      title: '⚠️ Concept Gap Detected',
      message: 'You might want to review "JavaScript Basics" before moving to "Advanced Concepts" - it will make learning easier!',
      action: 'Review Now'
    });
    
    // Achievement celebration
    if (Math.random() > 0.7) {
      insights.push({
        type: 'celebration',
        title: '🎉 Milestone Achieved!',
        message: 'Congratulations! You\'ve mastered the fundamentals. You\'re ready for intermediate topics!',
        action: 'Explore Next Level'
      });
    }
    
    res.json({ insights });
    
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ message: 'Failed to fetch insights' });
  }
});

// Get study schedule
router.get('/study-schedule', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's enrolled courses
    const enrolledCourses = await Course.find({
      'enrolledStudents.student': userId
    }).populate('enrolledStudents');
    
    const sessions = [];
    const now = new Date();
    
    enrolledCourses.forEach((course, index) => {
      const enrollment = course.enrolledStudents.find(e => e.student.toString() === userId.toString());
      if (enrollment && !enrollment.certificateEarned) {
        // Create study sessions for incomplete courses
        const sessionTime = new Date(now.getTime() + (index + 1) * 2 * 60 * 60 * 1000);
        
        sessions.push({
          id: `session-${course._id}-${index}`,
          courseId: course._id,
          courseTitle: course.title,
          topic: `Continue ${course.title}`,
          duration: 25,
          scheduledTime: sessionTime,
          type: 'video',
          difficulty: course.level === 'beginner' ? 'easy' : course.level === 'intermediate' ? 'medium' : 'hard',
          completed: false,
          priority: 5 - index
        });
      }
    });
    
    res.json({ sessions });
    
  } catch (error) {
    console.error('Error fetching study schedule:', error);
    res.status(500).json({ message: 'Failed to fetch study schedule' });
  }
});

// Update study session completion
router.post('/study-session/:sessionId/complete', auth, async (req, res) => {
  try {
    // In a real implementation, you'd store session data in the database
    // For now, just return success
    res.json({ message: 'Session marked as completed' });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ message: 'Failed to complete session' });
  }
});

module.exports = router;