const mongoose = require('mongoose');
const CareerData = require('../models/CareerData');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arivom', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleJobs = [
  {
    jobTitle: 'Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: { min: 90000, max: 130000, currency: 'USD' },
    requiredSkills: [
      { skill: 'JavaScript', importance: 'must-have', level: 'advanced' },
      { skill: 'React', importance: 'must-have', level: 'intermediate' },
      { skill: 'Node.js', importance: 'must-have', level: 'intermediate' },
      { skill: 'MongoDB', importance: 'preferred', level: 'intermediate' },
      { skill: 'TypeScript', importance: 'nice-to-have', level: 'beginner' }
    ],
    description: 'We are looking for a Full Stack Developer to build amazing web applications...',
    requirements: [
      '3+ years of experience with JavaScript',
      'Strong knowledge of React and Node.js',
      'Experience with databases',
      'Good communication skills'
    ],
    benefits: ['Health Insurance', 'Remote Work', '401k Matching', 'Flexible Hours'],
    category: 'Technology',
    industry: 'Software Development',
    remote: true,
    applicationUrl: 'https://techcorp.com/jobs/fullstack-dev'
  },
  {
    jobTitle: 'Data Scientist',
    company: 'DataVision Analytics',
    location: 'New York, NY',
    jobType: 'full-time',
    experienceLevel: 'senior',
    salaryRange: { min: 110000, max: 160000, currency: 'USD' },
    requiredSkills: [
      { skill: 'Python', importance: 'must-have', level: 'advanced' },
      { skill: 'Machine Learning', importance: 'must-have', level: 'advanced' },
      { skill: 'SQL', importance: 'must-have', level: 'intermediate' },
      { skill: 'Statistics', importance: 'must-have', level: 'advanced' },
      { skill: 'TensorFlow', importance: 'preferred', level: 'intermediate' }
    ],
    description: 'Join our data science team to build predictive models and extract insights...',
    requirements: [
      '5+ years in data science',
      'PhD or Masters in related field',
      'Experience with ML frameworks',
      'Strong statistical background'
    ],
    benefits: ['Health Insurance', '401k', 'Stock Options', 'Learning Budget'],
    category: 'Data Science',
    industry: 'Analytics',
    remote: false,
    applicationUrl: 'https://datavision.com/careers/data-scientist'
  },
  {
    jobTitle: 'Frontend Developer',
    company: 'Creative Digital Agency',
    location: 'Austin, TX',
    jobType: 'full-time',
    experienceLevel: 'junior',
    salaryRange: { min: 65000, max: 85000, currency: 'USD' },
    requiredSkills: [
      { skill: 'HTML', importance: 'must-have', level: 'advanced' },
      { skill: 'CSS', importance: 'must-have', level: 'advanced' },
      { skill: 'JavaScript', importance: 'must-have', level: 'intermediate' },
      { skill: 'React', importance: 'preferred', level: 'beginner' },
      { skill: 'Design Systems', importance: 'nice-to-have', level: 'beginner' }
    ],
    description: 'Looking for a creative frontend developer to build beautiful user interfaces...',
    requirements: [
      '2+ years of frontend experience',
      'Strong HTML/CSS skills',
      'JavaScript proficiency',
      'Eye for design'
    ],
    benefits: ['Health Insurance', 'Creative Environment', 'Flexible Schedule'],
    category: 'Web Development',
    industry: 'Digital Marketing',
    remote: true,
    applicationUrl: 'https://creativedigital.com/jobs/frontend'
  },
  {
    jobTitle: 'DevOps Engineer',
    company: 'CloudScale Infrastructure',
    location: 'Seattle, WA',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: { min: 95000, max: 140000, currency: 'USD' },
    requiredSkills: [
      { skill: 'AWS', importance: 'must-have', level: 'intermediate' },
      { skill: 'Docker', importance: 'must-have', level: 'intermediate' },
      { skill: 'Kubernetes', importance: 'must-have', level: 'intermediate' },
      { skill: 'CI/CD', importance: 'must-have', level: 'intermediate' },
      { skill: 'Linux', importance: 'preferred', level: 'advanced' }
    ],
    description: 'Join our DevOps team to build and maintain scalable cloud infrastructure...',
    requirements: [
      '3+ years DevOps experience',
      'Cloud platform expertise',
      'Container orchestration',
      'Automation mindset'
    ],
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Conference Budget'],
    category: 'DevOps',
    industry: 'Cloud Computing',
    remote: true,
    applicationUrl: 'https://cloudscale.com/careers/devops'
  },
  {
    jobTitle: 'Mobile App Developer',
    company: 'MobileFirst Startup',
    location: 'Los Angeles, CA',
    jobType: 'full-time',
    experienceLevel: 'junior',
    salaryRange: { min: 70000, max: 95000, currency: 'USD' },
    requiredSkills: [
      { skill: 'React Native', importance: 'must-have', level: 'intermediate' },
      { skill: 'JavaScript', importance: 'must-have', level: 'intermediate' },
      { skill: 'Mobile UI/UX', importance: 'preferred', level: 'beginner' },
      { skill: 'API Integration', importance: 'must-have', level: 'intermediate' },
      { skill: 'Redux', importance: 'nice-to-have', level: 'beginner' }
    ],
    description: 'Build the next generation of mobile applications with our innovative team...',
    requirements: [
      '2+ years mobile development',
      'React Native experience',
      'App store publishing',
      'Agile methodology'
    ],
    benefits: ['Equity', 'Health Insurance', 'Flexible Hours', 'Startup Environment'],
    category: 'Mobile Development',
    industry: 'Technology',
    remote: false,
    applicationUrl: 'https://mobilefirst.com/jobs/mobile-dev'
  },
  {
    jobTitle: 'Backend Developer',
    company: 'Enterprise Solutions Inc',
    location: 'Chicago, IL',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: { min: 85000, max: 115000, currency: 'USD' },
    requiredSkills: [
      { skill: 'Java', importance: 'must-have', level: 'advanced' },
      { skill: 'Spring Boot', importance: 'must-have', level: 'intermediate' },
      { skill: 'PostgreSQL', importance: 'must-have', level: 'intermediate' },
      { skill: 'REST APIs', importance: 'must-have', level: 'intermediate' },
      { skill: 'Microservices', importance: 'preferred', level: 'beginner' }
    ],
    description: 'Develop robust backend systems for enterprise-level applications...',
    requirements: [
      '4+ years Java development',
      'Enterprise system experience',
      'Database design skills',
      'API development expertise'
    ],
    benefits: ['Health Insurance', '401k Matching', 'Professional Development', 'Stable Environment'],
    category: 'Backend Development',
    industry: 'Enterprise Software',
    remote: false,
    applicationUrl: 'https://enterprisesolutions.com/careers/backend'
  },
  {
    jobTitle: 'UI/UX Designer',
    company: 'Design Innovation Lab',
    location: 'Portland, OR',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: { min: 75000, max: 105000, currency: 'USD' },
    requiredSkills: [
      { skill: 'Figma', importance: 'must-have', level: 'advanced' },
      { skill: 'Adobe Creative Suite', importance: 'must-have', level: 'intermediate' },
      { skill: 'Prototyping', importance: 'must-have', level: 'intermediate' },
      { skill: 'User Research', importance: 'preferred', level: 'intermediate' },
      { skill: 'HTML/CSS', importance: 'nice-to-have', level: 'beginner' }
    ],
    description: 'Create intuitive and beautiful user experiences for web and mobile applications...',
    requirements: [
      '3+ years UI/UX experience',
      'Strong portfolio',
      'Design thinking methodology',
      'Collaborative mindset'
    ],
    benefits: ['Health Insurance', 'Creative Freedom', 'Design Tools Budget', 'Remote Work'],
    category: 'Design',
    industry: 'Digital Design',
    remote: true,
    applicationUrl: 'https://designlab.com/jobs/ui-ux'
  },
  {
    jobTitle: 'Machine Learning Engineer',
    company: 'AI Innovations Corp',
    location: 'Boston, MA',
    jobType: 'full-time',
    experienceLevel: 'senior',
    salaryRange: { min: 120000, max: 170000, currency: 'USD' },
    requiredSkills: [
      { skill: 'Python', importance: 'must-have', level: 'advanced' },
      { skill: 'TensorFlow', importance: 'must-have', level: 'advanced' },
      { skill: 'PyTorch', importance: 'preferred', level: 'intermediate' },
      { skill: 'MLOps', importance: 'must-have', level: 'intermediate' },
      { skill: 'Deep Learning', importance: 'must-have', level: 'advanced' }
    ],
    description: 'Build and deploy machine learning models at scale for our AI products...',
    requirements: [
      '5+ years ML experience',
      'Production ML systems',
      'PhD or Masters preferred',
      'Research background'
    ],
    benefits: ['Health Insurance', 'Stock Options', 'Research Time', 'Conference Budget'],
    category: 'Machine Learning',
    industry: 'Artificial Intelligence',
    remote: true,
    applicationUrl: 'https://aiinnovations.com/careers/ml-engineer'
  }
];

async function populateCareerData() {
  try {
    console.log('Connecting to database...');
    
    // Clear existing data
    await CareerData.deleteMany({});
    console.log('Cleared existing career data');
    
    // Insert sample data
    const insertedJobs = await CareerData.insertMany(sampleJobs);
    console.log(`Inserted ${insertedJobs.length} job listings`);
    
    console.log('Career data populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating career data:', error);
    process.exit(1);
  }
}

populateCareerData();