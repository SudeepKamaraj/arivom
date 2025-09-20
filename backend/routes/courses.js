const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

function requireInstructor(req, res, next) {
  if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Instructor or admin role required' });
  }
  next();
}

router.post('/', auth, requireInstructor, async (req, res) => {
  try {
    const payload = req.body;
    
    // Set instructor - use current user if no instructorName provided or if instructor not found
    if (payload.instructorName && payload.instructorName.trim()) {
      const instructorUser = await User.findOne({
        $or: [
          { username: payload.instructorName },
          { firstName: payload.instructorName },
          { lastName: payload.instructorName }
        ]
      });
      if (instructorUser) {
        payload.instructor = instructorUser._id;
      } else {
        // If instructor not found, use current user and log a warning
        console.warn(`Instructor "${payload.instructorName}" not found, using current user as instructor`);
        payload.instructor = req.user._id;
      }
    } else {
      payload.instructor = req.user._id;
    }
    
    // Process videos
    if (Array.isArray(payload.videos)) {
      payload.videos = payload.videos.map((v, i) => ({ order: i + 1, ...v }));
    }
    
    // Process assessments
    if (Array.isArray(payload.assessments)) {
      payload.assessments = payload.assessments.map((assessment, i) => ({
        ...assessment,
        questions: assessment.questions.map((q, j) => ({
          ...q,
          correctAnswer: Number(q.correctAnswer)
        }))
      }));
    }
    // Ensure assessmentMode
    if (!['handmade','auto'].includes(payload.assessmentMode)) {
      payload.assessmentMode = 'handmade';
    }
    
    // Ensure required fields are present
    if (!payload.title || !payload.description || !payload.category) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, and category are required' 
      });
    }
    
    const course = await Course.create(payload);
    res.status(201).json(course);
  } catch (err) {
    console.error('Create course error:', err);
    
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: 'Failed to create course' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, category, level } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.$text = { $search: search };
    const courses = await Course.find(query).select('-enrolledStudents');
    res.json(courses);
  } catch (err) {
    console.error('List courses error:', err);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Get course by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    console.log('Slug endpoint called with:', slug);
    
    let course = null;
    
    // Check if slug is a valid ObjectId (24 characters, hexadecimal)
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(slug) && slug.length === 24) {
      // Try to find course by ID first (for backward compatibility)
      course = await Course.findById(slug).populate('instructor', 'username firstName lastName');
      console.log('Course found by ID:', !!course);
    }
    
    if (!course) {
      // If not found by ID, try to find by matching title-based slug
      const courses = await Course.find().populate('instructor', 'username firstName lastName');
      console.log('Total courses found:', courses.length);
      
      // Debug: Show all course slugs
      courses.forEach(c => {
        const courseSlug = c.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        console.log(`Course "${c.title}" -> slug "${courseSlug}"`);
      });
      
      course = courses.find(c => {
        const courseSlug = c.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        console.log(`Comparing "${courseSlug}" with "${slug}": ${courseSlug === slug}`);
        return courseSlug === slug;
      });
      
      console.log('Course found by slug:', !!course);
    }
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (err) {
    console.error('Get course by slug error:', err);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

router.get('/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

router.put('/:courseId', auth, requireInstructor, async (req, res) => {
  try {
    const payload = req.body;
    const course = await Course.findByIdAndUpdate(req.params.courseId, payload, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

router.post('/:courseId/publish', auth, requireInstructor, async (req, res) => {
  try {
    const { isPublished } = req.body;
    const course = await Course.findByIdAndUpdate(req.params.courseId, { isPublished: !!isPublished }, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error('Publish course error:', err);
    res.status(500).json({ message: 'Failed to change publish state' });
  }
});

router.post('/:courseId/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const idx = course.enrolledStudents.findIndex(es => es.student?.toString() === req.user._id.toString());
    if (idx === -1) {
      course.enrolledStudents.push({ student: req.user._id, progress: 0 });
      await course.save();
    }
    res.json({ enrolled: true });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ message: 'Failed to enroll' });
  }
});

router.get('/:courseId/progress', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select('videos enrolledStudents');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const enrollment = course.enrolledStudents.find(es => es.student?.toString() === req.user._id.toString());
    if (!enrollment) return res.json({ progress: 0, completedVideos: [] });
    res.json({ progress: enrollment.progress || 0, completedVideos: enrollment.completedVideos || [] });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ message: 'Failed to get progress' });
  }
});

router.post('/:courseId/progress/video', auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    const course = await Course.findById(req.params.courseId).select('videos enrolledStudents');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const enrollment = course.enrolledStudents.find(es => es.student?.toString() === req.user._id.toString());
    if (!enrollment) return res.status(400).json({ message: 'Not enrolled' });
    if (!enrollment.completedVideos) enrollment.completedVideos = [];
    if (!enrollment.completedVideos.find(v => v.toString() === videoId)) {
      enrollment.completedVideos.push(videoId);
    }
    const total = course.videos.length || 1;
    enrollment.progress = Math.round((enrollment.completedVideos.length / total) * 100);
    await course.save();
    res.json({ progress: enrollment.progress, completedVideos: enrollment.completedVideos });
  } catch (err) {
    console.error('Mark video complete error:', err);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

// Mark course as completed
router.post('/:courseId/complete', auth, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find user enrollment or auto-enroll if not found
    let enrollment = course.enrolledStudents.find(
      es => es.student?.toString() === userId.toString()
    );
    
    if (!enrollment) {
      // Auto-enroll the user if they're not already enrolled
      enrollment = {
        student: userId,
        enrolledAt: new Date(),
        progress: 100, // Set to 100 since they're completing the course
        completedVideos: [],
        completedAssessments: [],
        certificateEarned: false
      };
      course.enrolledStudents.push(enrollment);
    }
    
    // Check if already completed
    if (enrollment.certificateEarned) {
      return res.json({ 
        message: 'Course already completed',
        completed: true
      });
    }
    
    // Check for passed assessment if required
    if (course.assessments && course.assessments.length > 0) {
      // Find the user's latest assessment for this course
      const Assessment = require('../models/Assessment');
      const latestAssessment = await Assessment.findOne({
        userId: userId,
        courseId: courseId,
        passed: true
      }).sort({ completedAt: -1 });
      
      // If assessment is required but not passed, don't mark as completed
      if (!latestAssessment) {
        return res.status(400).json({
          message: 'Assessment required to complete course',
          completed: false,
          requiresAssessment: true
        });
      }
    }
    
    // Mark as completed and set certificate earned
    enrollment.certificateEarned = true;
    enrollment.certificateEarnedAt = new Date();
    enrollment.progress = 100;
    
    await course.save();
    
    res.json({ 
      message: 'Course marked as completed',
      completed: true,
      canReview: true
    });
  } catch (err) {
    console.error('Complete course error:', err);
    res.status(500).json({ message: 'Failed to complete course' });
  }
});

// Get course completion status
router.get('/:courseId/status', auth, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;
    
    console.log('=== COURSE STATUS CHECK ===');
    console.log('CourseId:', courseId);
    console.log('UserId:', userId);
    
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log('Course found:', course.title);
    console.log('Course has assessments:', course.assessments && course.assessments.length > 0);
    
    // Find user enrollment
    const enrollment = course.enrolledStudents.find(
      es => es.student?.toString() === userId.toString()
    );
    
    console.log('User enrollment found:', !!enrollment);
    if (enrollment) {
      console.log('Enrollment details:', {
        progress: enrollment.progress,
        certificateEarned: enrollment.certificateEarned,
        completedVideos: enrollment.completedVideos?.length || 0,
        completedAssessments: enrollment.completedAssessments?.length || 0
      });
    }
    
    // Check assessments if they exist
    if (course.assessments && course.assessments.length > 0) {
      const Assessment = require('../models/Assessment');
      const assessments = await Assessment.find({
        userId: userId,
        courseId: courseId
      }).sort({ completedAt: -1 });
      
      console.log('Assessments found:', assessments.length);
      assessments.forEach((assessment, index) => {
        console.log(`Assessment ${index + 1}:`, {
          passed: assessment.passed,
          score: assessment.score,
          completedAt: assessment.completedAt
        });
      });
      
      const passedAssessment = assessments.find(a => a.passed);
      console.log('Has passed assessment:', !!passedAssessment);
    }
    
    const isEnrolled = !!enrollment;
    const isCompleted = enrollment?.certificateEarned || false;
    const progress = enrollment?.progress || 0;
    
    console.log('Final status:', { isEnrolled, isCompleted, progress });
    
    res.json({
      enrolled: isEnrolled,
      completed: isCompleted,
      progress: progress,
      totalStudents: course.enrolledStudents.length,
      completedStudents: course.enrolledStudents.filter(es => es.certificateEarned).length,
      debug: {
        courseId,
        userId: userId.toString(),
        hasAssessments: course.assessments && course.assessments.length > 0,
        enrollment: enrollment ? {
          progress: enrollment.progress,
          certificateEarned: enrollment.certificateEarned
        } : null
      }
    });
  } catch (err) {
    console.error('Get course status error:', err);
    res.status(500).json({ message: 'Failed to get course status' });
  }
});

// Delete a course (instructor only)
router.delete('/:courseId', auth, requireInstructor, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Only the instructor can delete their own course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own courses' });
    }
    
    // Delete the course
    await Course.findByIdAndDelete(courseId);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

// Manual course completion for testing/debugging
router.post('/:courseId/force-complete', auth, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;
    
    console.log('=== FORCE COMPLETE COURSE ===');
    console.log('CourseId:', courseId);
    console.log('UserId:', userId);
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find user enrollment or create one
    let enrollment = course.enrolledStudents.find(
      es => es.student?.toString() === userId.toString()
    );
    
    if (!enrollment) {
      enrollment = {
        student: userId,
        enrolledAt: new Date(),
        progress: 100,
        completedVideos: [],
        completedAssessments: [],
        certificateEarned: false
      };
      course.enrolledStudents.push(enrollment);
    }
    
    // Force mark as completed
    enrollment.certificateEarned = true;
    enrollment.certificateEarnedAt = new Date();
    enrollment.progress = 100;
    
    await course.save();
    
    console.log('Course force-completed successfully');
    
    res.json({ 
      message: 'Course force-completed successfully',
      completed: true,
      debug: 'This was a manual completion for testing'
    });
  } catch (err) {
    console.error('Force complete error:', err);
    res.status(500).json({ message: 'Failed to force complete course' });
  }
});

module.exports = router;

