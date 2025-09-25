import React, { useState, useEffect } from 'react';
import { Briefcase, Target, TrendingUp, MapPin, DollarSign, Clock, Star, ExternalLink, Filter, Search, BookOpen, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/apiService';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  postedDate: Date;
  matchScore: number; // 0-100
  requiredSkills: string[];
  missingSkills: string[];
  description: string;
  logo?: string;
  remote: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior';
}

interface SkillGap {
  skill: string;
  currentLevel: number; // 0-100
  requiredLevel: number; // 0-100
  recommendedCourses: string[];
  timeToAcquire: string; // "2-3 weeks"
  priority: 'high' | 'medium' | 'low';
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  currentRole: string;
  targetRole: string;
  timeline: string;
  requiredSkills: string[];
  recommendedCourses: string[];
  averageSalary: number;
  jobGrowth: string;
  completionRate: number;
}

const CareerHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'skills' | 'paths'>('jobs');
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    salary: '',
    remote: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    
    loadJobOpportunities();
    analyzeSkillGaps();
    loadCareerPaths();
  }, [user]);

  const loadJobOpportunities = async () => {
    try {
      const response = await fetchWithAuth('/career/jobs');
      const data = await response.json();
      
      // Transform API data to match component interface
      const transformedJobs = data.jobs.map((job: any) => ({
        id: job._id,
        title: job.jobTitle,
        company: job.company,
        location: job.location,
        type: job.jobType,
        salary: {
          min: job.salaryRange.min,
          max: job.salaryRange.max,
          currency: job.salaryRange.currency || 'USD'
        },
        postedDate: new Date(job.postedDate),
        matchScore: job.matchScore || 0,
        requiredSkills: job.requiredSkills.map((skill: any) => skill.skill),
        missingSkills: job.matchingSkills ? [] : job.requiredSkills.slice(0, 2).map((skill: any) => skill.skill),
        description: job.description,
        remote: job.remote,
        experienceLevel: job.experienceLevel
      }));
      
      setJobOpportunities(transformedJobs);
      
    } catch (error) {
      console.error('Error loading job opportunities:', error);
      loadMockJobs();
    }
  };

  const loadMockJobs = () => {
    // Simulate AI-matched job opportunities based on user's completed courses
    const jobs: JobOpportunity[] = [
      {
        id: '1',
        title: 'Junior Frontend Developer',
        company: 'TechStart Inc.',
        location: 'San Francisco, CA',
        type: 'full-time',
        salary: { min: 65000, max: 85000, currency: 'USD' },
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        matchScore: 92,
        requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
        missingSkills: ['TypeScript', 'Redux'],
        description: 'Join our dynamic team to build cutting-edge web applications...',
        remote: true,
        experienceLevel: 'entry'
      },
      {
        id: '2',
        title: 'React Developer',
        company: 'Digital Solutions Co.',
        location: 'Austin, TX',
        type: 'contract',
        salary: { min: 45, max: 65, currency: 'USD' }, // per hour
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        matchScore: 87,
        requiredSkills: ['React', 'JavaScript', 'Node.js', 'MongoDB'],
        missingSkills: ['GraphQL', 'Docker'],
        description: '6-month contract position for an experienced React developer...',
        remote: false,
        experienceLevel: 'mid'
      },
      {
        id: '3',
        title: 'Full Stack Intern',
        company: 'Innovation Labs',
        location: 'Remote',
        type: 'internship',
        salary: { min: 18, max: 22, currency: 'USD' }, // per hour
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        matchScore: 78,
        requiredSkills: ['JavaScript', 'Python', 'SQL'],
        missingSkills: ['AWS', 'DevOps basics'],
        description: 'Summer internship program for aspiring full-stack developers...',
        remote: true,
        experienceLevel: 'entry'
      }
    ];
    setJobOpportunities(jobs);
  };

  const analyzeSkillGaps = () => {
    // Analyze user's skills vs market demands
    const gaps: SkillGap[] = [
      {
        skill: 'TypeScript',
        currentLevel: 0,
        requiredLevel: 75,
        recommendedCourses: ['TypeScript Fundamentals', 'Advanced TypeScript'],
        timeToAcquire: '3-4 weeks',
        priority: 'high'
      },
      {
        skill: 'Redux',
        currentLevel: 20,
        requiredLevel: 80,
        recommendedCourses: ['Redux Toolkit Mastery', 'State Management Patterns'],
        timeToAcquire: '2-3 weeks',
        priority: 'high'
      },
      {
        skill: 'GraphQL',
        currentLevel: 0,
        requiredLevel: 60,
        recommendedCourses: ['GraphQL Basics', 'Apollo Client'],
        timeToAcquire: '4-5 weeks',
        priority: 'medium'
      },
      {
        skill: 'AWS Basics',
        currentLevel: 10,
        requiredLevel: 70,
        recommendedCourses: ['AWS Cloud Fundamentals', 'Serverless Architecture'],
        timeToAcquire: '6-8 weeks',
        priority: 'medium'
      }
    ];
    setSkillGaps(gaps);
  };

  const loadCareerPaths = async () => {
    try {
      const response = await fetchWithAuth('/career/career-paths');
      const data = await response.json();
      
      // Transform API data to match component interface
      const transformedPaths = data.recommendedPaths.map((path: any) => ({
        id: path.id,
        title: path.title,
        description: path.description,
        currentRole: 'Current Level',
        targetRole: path.title,
        timeline: path.timeline,
        requiredSkills: path.requiredSkills,
        recommendedCourses: [],
        averageSalary: path.averageSalary ? Math.round((path.averageSalary.min + path.averageSalary.max) / 2) : 80000,
        jobGrowth: path.growth,
        completionRate: path.compatibilityScore
      }));
      
      setCareerPaths(transformedPaths);
      
    } catch (error) {
      console.error('Error loading career paths:', error);
      loadMockCareerPaths();
    }
  };

  const loadMockCareerPaths = () => {
    const paths: CareerPath[] = [
      {
        id: '1',
        title: 'Frontend Developer Career Track',
        description: 'Master modern frontend development from basics to advanced concepts',
        currentRole: 'Beginner',
        targetRole: 'Senior Frontend Developer',
        timeline: '12-18 months',
        requiredSkills: ['JavaScript', 'React', 'TypeScript', 'Next.js', 'Testing'],
        recommendedCourses: ['JS Advanced', 'React Mastery', 'TypeScript Pro', 'Testing Strategies'],
        averageSalary: 95000,
        jobGrowth: '+22% (2024-2034)',
        completionRate: 34
      },
      {
        id: '2',
        title: 'Full Stack Developer Path',
        description: 'Become proficient in both frontend and backend technologies',
        currentRole: 'Beginner',
        targetRole: 'Full Stack Developer',
        timeline: '18-24 months',
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'Databases', 'DevOps'],
        recommendedCourses: ['MERN Stack', 'Database Design', 'DevOps Basics', 'System Design'],
        averageSalary: 105000,
        jobGrowth: '+25% (2024-2034)',
        completionRate: 28
      }
    ];
    setCareerPaths(paths);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatSalary = (job: JobOpportunity) => {
    if (job.type === 'contract' || job.type === 'internship') {
      return `$${job.salary.min}-${job.salary.max}/hr`;
    }
    return `$${(job.salary.min / 1000).toFixed(0)}k-${(job.salary.max / 1000).toFixed(0)}k`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-isabelline min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-gunmetal mb-2">Career Hub</h1>
        <p className="text-dark-gunmetal/70">AI-powered career guidance based on your learning journey</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'jobs', label: 'Job Opportunities', icon: Briefcase },
            { id: 'skills', label: 'Skill Gaps', icon: Target },
            { id: 'paths', label: 'Career Paths', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Job Opportunities Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {jobOpportunities.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-purple-600 font-medium mb-1">{job.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatSalary(job)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{Math.floor((Date.now() - job.postedDate.getTime()) / (1000 * 60 * 60 * 24))}d ago</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-lg font-bold text-green-600">{job.matchScore}%</span>
                      <span className="text-sm text-gray-600">match</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.type === 'full-time' ? 'bg-green-100 text-green-700' :
                      job.type === 'contract' ? 'bg-blue-100 text-blue-700' :
                      job.type === 'internship' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.type}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                {/* Skills */}
                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills You Have:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {job.missingSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Skills to Learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.missingSkills.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            ! {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {job.remote && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        🏠 Remote
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.experienceLevel === 'entry' ? 'bg-green-100 text-green-700' :
                      job.experienceLevel === 'mid' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {job.experienceLevel} level
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                      Save Job
                    </button>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex items-center space-x-2">
                      <span>Apply Now</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gaps Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills Analysis</h3>
            <p className="text-gray-600 mb-6">Based on your completed courses and current job market demands</p>
            
            <div className="space-y-4">
              {skillGaps.map((gap) => (
                <div key={gap.skill} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                        {gap.priority} priority
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{gap.timeToAcquire}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Current Level</span>
                      <span>Required Level</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${gap.currentLevel}%` }}
                        />
                      </div>
                      <div
                        className="absolute top-0 h-3 w-1 bg-red-500 rounded"
                        style={{ left: `${gap.requiredLevel}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{gap.currentLevel}%</span>
                      <span className="text-red-600">{gap.requiredLevel}% required</span>
                    </div>
                  </div>

                  {/* Recommended Courses */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Recommended Courses:</h5>
                    <div className="flex flex-wrap gap-2">
                      {gap.recommendedCourses.map((course) => (
                        <button
                          key={course}
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{course}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Career Paths Tab */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {careerPaths.map((path) => (
              <div key={path.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{path.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Timeline:</span>
                      <p className="font-medium text-gray-900">{path.timeline}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg. Salary:</span>
                      <p className="font-medium text-green-600">${(path.averageSalary / 1000).toFixed(0)}k</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Job Growth:</span>
                      <p className="font-medium text-blue-600">{path.jobGrowth}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Your Progress:</span>
                      <p className="font-medium text-purple-600">{path.completionRate}%</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${path.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Required Skills */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Skills Required:</h4>
                  <div className="flex flex-wrap gap-2">
                    {path.requiredSkills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Start Career Path</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerHub;