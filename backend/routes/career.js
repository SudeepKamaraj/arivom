const express = require('express');
const { auth } = require('../middleware/auth');
const CareerData = require('../models/CareerData');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

// Get job recommendations based on user's courses and skills
router.get('/jobs', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, experience, location, remote, page = 1, limit = 10 } = req.query;
    
    // Get user's enrolled courses to understand their skills
    const userCourses = await Course.find({
      'enrolledStudents.student': userId
    });
    
    const userSkills = [...new Set(userCourses.map(course => course.category))];
    const userTopics = [...new Set(userCourses.flatMap(course => course.tags || []))];
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (experience) {
      query.experienceLevel = experience;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (remote !== undefined) {
      query.remote = remote === 'true';
    }
    
    let jobs = await CareerData.find(query)
      .sort({ postedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Calculate match scores based on user's skills
    jobs = jobs.map(job => {
      const jobSkills = job.requiredSkills.map(skill => skill.skill.toLowerCase());
      const userSkillsLower = [...userSkills, ...userTopics].map(skill => skill.toLowerCase());
      
      const matchingSkills = jobSkills.filter(skill => 
        userSkillsLower.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      
      const matchScore = Math.min(
        (matchingSkills.length / jobSkills.length) * 100,
        100
      );
      
      return {
        ...job.toObject(),
        matchScore: Math.round(matchScore),
        matchingSkills
      };
    });
    
    // Sort by match score
    jobs.sort((a, b) => b.matchScore - a.matchScore);
    
    const total = await CareerData.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
    
  } catch (error) {
    console.error('Error fetching job recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch job recommendations' });
  }
});

// Get skill gap analysis
router.get('/skill-gap/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;
    
    const job = await CareerData.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Get user's current skills from enrolled courses
    const userCourses = await Course.find({
      'enrolledStudents.student': userId
    });
    
    const userSkills = [...new Set([
      ...userCourses.map(course => course.category),
      ...userCourses.flatMap(course => course.tags || [])
    ])].map(skill => skill.toLowerCase());
    
    const requiredSkills = job.requiredSkills;
    const skillGaps = [];
    const matchingSkills = [];
    
    requiredSkills.forEach(reqSkill => {
      const hasSkill = userSkills.some(userSkill => 
        userSkill.includes(reqSkill.skill.toLowerCase()) || 
        reqSkill.skill.toLowerCase().includes(userSkill)
      );
      
      if (hasSkill) {
        matchingSkills.push({
          skill: reqSkill.skill,
          level: reqSkill.level,
          importance: reqSkill.importance,
          status: 'have'
        });
      } else {
        skillGaps.push({
          skill: reqSkill.skill,
          level: reqSkill.level,
          importance: reqSkill.importance,
          status: 'missing'
        });
      }
    });
    
    // Find relevant courses for missing skills
    const recommendedCourses = await Course.find({
      $or: skillGaps.map(gap => ({
        $or: [
          { category: { $regex: gap.skill, $options: 'i' } },
          { title: { $regex: gap.skill, $options: 'i' } },
          { tags: { $in: [new RegExp(gap.skill, 'i')] } }
        ]
      }))
    }).limit(10);
    
    res.json({
      job: {
        title: job.jobTitle,
        company: job.company,
        requiredSkills: requiredSkills.length
      },
      analysis: {
        matchingSkills,
        skillGaps,
        matchPercentage: Math.round((matchingSkills.length / requiredSkills.length) * 100),
        readinessLevel: matchingSkills.length >= requiredSkills.length * 0.7 ? 'ready' :
                      matchingSkills.length >= requiredSkills.length * 0.5 ? 'almost-ready' : 'needs-work'
      },
      recommendedCourses: recommendedCourses.map(course => ({
        _id: course._id,
        title: course.title,
        category: course.category,
        level: course.level,
        price: course.price,
        duration: course.duration,
        rating: course.rating
      }))
    });
    
  } catch (error) {
    console.error('Error analyzing skill gap:', error);
    res.status(500).json({ message: 'Failed to analyze skill gap' });
  }
});

// Get career path recommendations
router.get('/career-paths', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's current skills and interests
    const userCourses = await Course.find({
      'enrolledStudents.student': userId
    });
    
    const userCategories = [...new Set(userCourses.map(course => course.category))];
    const userSkills = [...new Set(userCourses.flatMap(course => course.tags || []))];
    
    // Define career paths based on common skill combinations
    const careerPaths = [
      {
        id: 'fullstack-developer',
        title: 'Full Stack Developer',
        description: 'Build complete web applications from frontend to backend',
        timeline: '6-12 months',
        difficulty: 'intermediate',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'Database', 'HTML', 'CSS'],
        averageSalary: { min: 70000, max: 120000 },
        demandLevel: 'high',
        growth: '+15%'
      },
      {
        id: 'data-scientist',
        title: 'Data Scientist',
        description: 'Analyze data to extract insights and build predictive models',
        timeline: '8-15 months',
        difficulty: 'advanced',
        requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
        averageSalary: { min: 90000, max: 150000 },
        demandLevel: 'very-high',
        growth: '+22%'
      },
      {
        id: 'mobile-developer',
        title: 'Mobile App Developer',
        description: 'Create mobile applications for iOS and Android platforms',
        timeline: '4-8 months',
        difficulty: 'intermediate',
        requiredSkills: ['React Native', 'Flutter', 'Mobile UI/UX', 'API Integration'],
        averageSalary: { min: 65000, max: 110000 },
        demandLevel: 'high',
        growth: '+18%'
      },
      {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        description: 'Bridge development and operations through automation and infrastructure',
        timeline: '6-10 months',
        difficulty: 'advanced',
        requiredSkills: ['Cloud Computing', 'Docker', 'CI/CD', 'Linux', 'Monitoring'],
        averageSalary: { min: 80000, max: 130000 },
        demandLevel: 'very-high',
        growth: '+25%'
      }
    ];
    
    // Calculate compatibility scores for each path
    const pathsWithScores = careerPaths.map(path => {
      const pathSkills = path.requiredSkills.map(skill => skill.toLowerCase());
      const userSkillsLower = [...userCategories, ...userSkills].map(skill => skill.toLowerCase());
      
      const matchingSkills = pathSkills.filter(skill => 
        userSkillsLower.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      
      const missingSkills = pathSkills.filter(skill => 
        !userSkillsLower.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      
      const compatibilityScore = Math.round((matchingSkills.length / pathSkills.length) * 100);
      
      return {
        ...path,
        compatibilityScore,
        matchingSkills,
        missingSkills,
        readinessLevel: compatibilityScore >= 70 ? 'ready' :
                       compatibilityScore >= 40 ? 'almost-ready' : 'beginner'
      };
    });
    
    // Sort by compatibility score
    pathsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    res.json({
      recommendedPaths: pathsWithScores
    });
    
  } catch (error) {
    console.error('Error fetching career paths:', error);
    res.status(500).json({ message: 'Failed to fetch career paths' });
  }
});

// Get industry insights
router.get('/industry-insights', auth, async (req, res) => {
  try {
    // Mock industry data - in production, this would come from external APIs or databases
    const insights = [
      {
        category: 'Technology',
        trends: [
          { skill: 'AI/Machine Learning', growth: '+35%', demand: 'very-high' },
          { skill: 'Cloud Computing', growth: '+28%', demand: 'very-high' },
          { skill: 'Cybersecurity', growth: '+31%', demand: 'high' },
          { skill: 'Data Science', growth: '+22%', demand: 'high' }
        ],
        averageSalary: { min: 75000, max: 140000 },
        jobOpenings: 45230,
        hotCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple']
      },
      {
        category: 'Finance',
        trends: [
          { skill: 'FinTech', growth: '+18%', demand: 'high' },
          { skill: 'Blockchain', growth: '+25%', demand: 'medium' },
          { skill: 'Risk Analysis', growth: '+12%', demand: 'medium' },
          { skill: 'Quantitative Analysis', growth: '+15%', demand: 'high' }
        ],
        averageSalary: { min: 70000, max: 120000 },
        jobOpenings: 23100,
        hotCompanies: ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Coinbase']
      },
      {
        category: 'Healthcare',
        trends: [
          { skill: 'Health Informatics', growth: '+20%', demand: 'high' },
          { skill: 'Telemedicine', growth: '+30%', demand: 'very-high' },
          { skill: 'Medical AI', growth: '+40%', demand: 'high' },
          { skill: 'Digital Health', growth: '+25%', demand: 'high' }
        ],
        averageSalary: { min: 65000, max: 110000 },
        jobOpenings: 18500,
        hotCompanies: ['Pfizer', 'Johnson & Johnson', 'Teladoc', 'Epic Systems']
      }
    ];
    
    res.json({ insights });
    
  } catch (error) {
    console.error('Error fetching industry insights:', error);
    res.status(500).json({ message: 'Failed to fetch industry insights' });
  }
});

module.exports = router;