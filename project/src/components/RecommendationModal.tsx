import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Brain, BookOpen, Star, Clock, Sparkles } from 'lucide-react';
import { Course } from '../contexts/CourseContext';
import { useNavigate } from 'react-router-dom';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseSelect: (course: Course) => void;
  courses: Course[];
}

interface QuestionnaireData {
  experience: string;
  interests: string[];
  goals: string[];
  timeCommitment: string;
  learningStyle: string;
  careerLevel: string;
  industryPreference: string[];
  currentSkills: string[];
  projectType: string[];
  learningPace: string;
  certificationsNeeded: boolean;
  budgetRange: string;
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({ 
  isOpen, 
  onClose, 
  onCourseSelect,
  courses 
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    experience: '',
    interests: [],
    goals: [],
    timeCommitment: '',
    learningStyle: '',
    careerLevel: '',
    industryPreference: [],
    currentSkills: [],
    projectType: [],
    learningPace: '',
    certificationsNeeded: false,
    budgetRange: ''
  });
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const experienceOptions = [
    { value: 'beginner', label: 'Complete Beginner', description: 'New to programming/tech' },
    { value: 'some-experience', label: 'Some Experience', description: 'Know basics, want to expand' },
    { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with fundamentals' },
    { value: 'advanced', label: 'Advanced', description: 'Looking to specialize or master' }
  ];

  const interestOptions = [
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
    'Artificial Intelligence', 'Cybersecurity', 'Cloud Computing', 'DevOps',
    'Game Development', 'UI/UX Design', 'Database Management', 'Programming Languages'
  ];

  const goalOptions = [
    'Career Change', 'Skill Enhancement', 'Personal Interest', 'Academic Requirements',
    'Professional Certification', 'Freelancing', 'Entrepreneurship', 'Job Promotion'
  ];

  const timeOptions = [
    { value: '1-2', label: '1-2 hours/week', description: 'Casual learning' },
    { value: '3-5', label: '3-5 hours/week', description: 'Steady progress' },
    { value: '6-10', label: '6-10 hours/week', description: 'Focused learning' },
    { value: '10+', label: '10+ hours/week', description: 'Intensive study' }
  ];

  const learningOptions = [
    { value: 'visual', label: 'Visual Learner', description: 'Videos, diagrams, demonstrations' },
    { value: 'hands-on', label: 'Hands-on Learner', description: 'Projects, coding exercises' },
    { value: 'reading', label: 'Reading/Text', description: 'Articles, documentation' },
    { value: 'mixed', label: 'Mixed Approach', description: 'Combination of all methods' }
  ];

  const careerLevelOptions = [
    { value: 'student', label: 'Student', description: 'Currently studying or fresh graduate' },
    { value: 'entry', label: 'Entry Level', description: '0-2 years professional experience' },
    { value: 'mid', label: 'Mid Level', description: '2-5 years professional experience' },
    { value: 'senior', label: 'Senior Level', description: '5+ years professional experience' },
    { value: 'lead', label: 'Team Lead/Manager', description: 'Leading teams or projects' }
  ];

  const industryOptions = [
    'Technology/Software', 'Finance/Banking', 'Healthcare', 'Education', 
    'E-commerce/Retail', 'Gaming', 'Startups', 'Enterprise/Corporate',
    'Government', 'Non-profit', 'Media/Entertainment', 'Consulting'
  ];

  const currentSkillsOptions = [
    'HTML/CSS', 'JavaScript', 'Python', 'Java', 'React', 'Node.js',
    'SQL/Database', 'Git/Version Control', 'API Development', 'Testing',
    'Cloud Platforms', 'Mobile Development', 'Data Analysis', 'Design Tools'
  ];

  const projectTypeOptions = [
    'Web Applications', 'Mobile Apps', 'Data Analysis Projects', 'APIs/Backend',
    'Machine Learning Models', 'Desktop Software', 'Games', 'DevOps/Infrastructure',
    'E-commerce Sites', 'Portfolio Projects', 'Open Source Contributions', 'Automation Scripts'
  ];

  const learningPaceOptions = [
    { value: 'slow', label: 'Take My Time', description: 'Prefer thorough understanding over speed' },
    { value: 'moderate', label: 'Steady Progress', description: 'Balanced approach to learning' },
    { value: 'fast', label: 'Quick Learner', description: 'Learn rapidly, cover more ground' },
    { value: 'intensive', label: 'Bootcamp Style', description: 'Intensive, immersive learning' }
  ];

  const budgetOptions = [
    { value: 'free', label: 'Free Only', description: 'Looking for free resources only' },
    { value: 'low', label: '$1-50/month', description: 'Budget-friendly options' },
    { value: 'medium', label: '$50-200/month', description: 'Moderate investment in learning' },
    { value: 'high', label: '$200+/month', description: 'Premium courses and resources' }
  ];

  const handleArraySelection = (field: 'interests' | 'goals' | 'industryPreference' | 'currentSkills' | 'projectType', value: string) => {
    setQuestionnaire(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    
    // Enhanced recommendation algorithm based on comprehensive questionnaire
    let filtered = courses.filter(course => {
      // Experience level filtering (mandatory)
      if (questionnaire.experience === 'beginner' && course.level !== 'Beginner') return false;
      if (questionnaire.experience === 'advanced' && course.level === 'Beginner') return false;
      
      // Interest matching (high priority)
      const hasMatchingInterest = questionnaire.interests.some(interest =>
        course.title.toLowerCase().includes(interest.toLowerCase()) ||
        course.description.toLowerCase().includes(interest.toLowerCase()) ||
        course.skills?.some(skill => skill.toLowerCase().includes(interest.toLowerCase()))
      );
      if (!hasMatchingInterest && questionnaire.interests.length > 0) return false;
      
      return true;
    });

    // Enhanced scoring algorithm
    filtered = filtered.map(course => {
      let score = 50; // Base score
      const reasons = [];
      
      // Interest matching (25 points max)
      questionnaire.interests.forEach(interest => {
        if (course.title.toLowerCase().includes(interest.toLowerCase())) {
          score += 15;
          reasons.push(`Strongly matches your interest in ${interest}`);
        } else if (course.description.toLowerCase().includes(interest.toLowerCase()) ||
                  course.skills?.some(skill => skill.toLowerCase().includes(interest.toLowerCase()))) {
          score += 10;
          reasons.push(`Relates to your interest in ${interest}`);
        }
      });
      
      // Experience level matching (15 points max)
      if (questionnaire.experience === 'beginner' && course.level === 'Beginner') {
        score += 15;
        reasons.push('Perfect for beginners');
      } else if (questionnaire.experience === 'intermediate' && course.level === 'Intermediate') {
        score += 15;
        reasons.push('Ideal for intermediate learners');
      } else if (questionnaire.experience === 'advanced' && course.level === 'Advanced') {
        score += 15;
        reasons.push('Designed for advanced learners');
      }
      
      // Career level and goals alignment (10 points max)
      questionnaire.goals.forEach(goal => {
        if (goal === 'Career Change' && course.title.toLowerCase().includes('career')) {
          score += 5;
          reasons.push('Great for career changers');
        } else if (goal === 'Professional Certification' && course.title.toLowerCase().includes('certification')) {
          score += 5;
          reasons.push('Offers professional certification');
        } else if (goal === 'Skill Enhancement' && course.title.toLowerCase().includes('advanced')) {
          score += 3;
          reasons.push('Enhances existing skills');
        }
      });
      
      // Industry preference matching (8 points max)
      questionnaire.industryPreference.forEach(industry => {
        if (course.title.toLowerCase().includes(industry.toLowerCase()) ||
            course.description.toLowerCase().includes(industry.toLowerCase())) {
          score += 4;
          reasons.push(`Relevant to ${industry} industry`);
        }
      });
      
      // Current skills complementarity (10 points max)
      let skillsMatch = 0;
      questionnaire.currentSkills.forEach(skill => {
        if (course.skills?.some(courseSkill => courseSkill.toLowerCase().includes(skill.toLowerCase()))) {
          skillsMatch += 2;
        }
      });
      if (skillsMatch > 0 && skillsMatch < 6) {
        score += skillsMatch;
        reasons.push('Builds on your existing skills');
      } else if (skillsMatch >= 6) {
        score += 3; // Don't over-recommend if they already have most skills
        reasons.push('Advanced concepts in familiar areas');
      }
      
      // Project type alignment (8 points max)
      questionnaire.projectType.forEach(projectType => {
        if (course.title.toLowerCase().includes(projectType.toLowerCase().replace(' ', '')) ||
            course.description.toLowerCase().includes(projectType.toLowerCase())) {
          score += 4;
          reasons.push(`Perfect for building ${projectType.toLowerCase()}`);
        }
      });
      
      // Learning pace consideration (5 points max)
      if (questionnaire.learningPace === 'fast' && course.title.toLowerCase().includes('intensive')) {
        score += 5;
        reasons.push('Fast-paced learning approach');
      } else if (questionnaire.learningPace === 'slow' && course.title.toLowerCase().includes('comprehensive')) {
        score += 5;
        reasons.push('Comprehensive, thorough approach');
      }
      
      // Time commitment alignment (5 points max)
      if (questionnaire.timeCommitment === '1-2' && course.duration && course.duration.includes('week')) {
        score += 3;
        reasons.push('Fits your available time commitment');
      } else if (questionnaire.timeCommitment === '10+' && course.title.toLowerCase().includes('bootcamp')) {
        score += 5;
        reasons.push('Intensive format matches your commitment');
      }
      
      // Budget consideration (3 points max)
      if (questionnaire.budgetRange === 'free' && course.price === 0) {
        score += 3;
        reasons.push('Free course within your budget');
      } else if (questionnaire.budgetRange !== 'free' && course.price > 0) {
        score += 2;
        reasons.push('Premium course with additional value');
      }
      
      // Certification preference (3 points max)
      if (questionnaire.certificationsNeeded && course.certificate) {
        score += 3;
        reasons.push('Includes certification');
      }
      
      // Ensure we have at least one reason
      if (reasons.length === 0) {
        reasons.push('Recommended based on your comprehensive profile');
      }
      
      return {
        ...course,
        score: Math.min(score, 100), // Cap at 100
        reasons: reasons.slice(0, 3) // Limit to top 3 reasons
      };
    });

    // Sort by score and get top recommendations
    const sortedRecommendations = filtered
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Increased to 8 recommendations
    
    setRecommendations(sortedRecommendations);
    
    // Save results to backend
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch('http://localhost:5001/api/recommendations/save-questionnaire', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            questionnaire,
            recommendations: sortedRecommendations
          })
        });
        
        if (response.ok) {
          console.log('Questionnaire results saved successfully');
        } else {
          console.warn('Failed to save questionnaire results');
        }
      }
    } catch (error) {
      console.error('Error saving questionnaire results:', error);
      // Don't show error to user, just log it
    }
    
    setLoading(false);
    setStep(11);
  };

  const resetModal = () => {
    setStep(1);
    setQuestionnaire({
      experience: '',
      interests: [],
      goals: [],
      timeCommitment: '',
      learningStyle: '',
      careerLevel: '',
      industryPreference: [],
      currentSkills: [],
      projectType: [],
      learningPace: '',
      certificationsNeeded: false,
      budgetRange: ''
    });
    setRecommendations([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Course Recommender</h2>
              <p className="text-blue-100">Find your perfect learning path</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Step {step} of {step <= 10 ? '10' : '11'}</span>
              <span>{Math.round((step / (step <= 10 ? 10 : 11)) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${(step / (step <= 10 ? 10 : 11)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Experience Level */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What's your experience level?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This helps us recommend courses at the right difficulty level
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experienceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuestionnaire(prev => ({ ...prev, experience: option.value }))}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                      questionnaire.experience === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {option.label}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What interests you most?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select all areas that spark your curiosity (multiple selections allowed)
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleArraySelection('interests', interest)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                      questionnaire.interests.includes(interest)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{interest}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What are your learning goals?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select what you hope to achieve (multiple selections allowed)
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleArraySelection('goals', goal)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                      questionnaire.goals.includes(goal)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{goal}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Time Commitment */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  How much time can you dedicate?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This helps us suggest courses that fit your schedule
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuestionnaire(prev => ({ ...prev, timeCommitment: option.value }))}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                      questionnaire.timeCommitment === option.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {option.label}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Learning Style */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  How do you prefer to learn?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose the learning method that works best for you
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuestionnaire(prev => ({ ...prev, learningStyle: option.value }))}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                      questionnaire.learningStyle === option.value
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                    }`}
                  >
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {option.label}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Career Level */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What's your current career level?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This helps us recommend courses appropriate for your professional stage
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careerLevelOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuestionnaire(prev => ({ ...prev, careerLevel: option.value }))}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                      questionnaire.careerLevel === option.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {option.label}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Industry Preference */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Which industries interest you?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select industries you'd like to work in (multiple selections allowed)
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {industryOptions.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => handleArraySelection('industryPreference', industry)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                      questionnaire.industryPreference.includes(industry)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{industry}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Current Skills */}
          {step === 8 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What skills do you already have?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select your current skills so we can recommend complementary courses
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentSkillsOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleArraySelection('currentSkills', skill)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                      questionnaire.currentSkills.includes(skill)
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-teal-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{skill}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Project Types */}
          {step === 9 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  What type of projects do you want to build?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This helps us recommend courses with relevant practical applications
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {projectTypeOptions.map((project) => (
                  <button
                    key={project}
                    onClick={() => handleArraySelection('projectType', project)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                      questionnaire.projectType.includes(project)
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-rose-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{project}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 10: Learning Pace & Budget */}
          {step === 10 && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Final preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Help us fine-tune your recommendations
                </p>
              </div>

              {/* Learning Pace */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Pace</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learningPaceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setQuestionnaire(prev => ({ ...prev, learningPace: option.value }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                        questionnaire.learningPace === option.value
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                      }`}
                    >
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {option.label}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Range</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budgetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setQuestionnaire(prev => ({ ...prev, budgetRange: option.value }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                        questionnaire.budgetRange === option.value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {option.label}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certifications</h4>
                <button
                  onClick={() => setQuestionnaire(prev => ({ ...prev, certificationsNeeded: !prev.certificationsNeeded }))}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                    questionnaire.certificationsNeeded
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        I need courses with certifications
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Prefer courses that offer certificates of completion
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      questionnaire.certificationsNeeded ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {questionnaire.certificationsNeeded && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 11: Recommendations */}
          {step === 11 && (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Analyzing Your Preferences...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our AI is finding the perfect courses for you
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Sparkles className="w-8 h-8 text-yellow-500" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Your Personalized Recommendations
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Based on your preferences, here are the courses we recommend
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((course, index) => (
                      <div
                        key={course.id}
                        className="group bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all duration-300 overflow-hidden cursor-pointer"
                        onClick={() => {
                          onCourseSelect(course);
                          handleClose();
                        }}
                      >
                        <div className="relative">
                          <img
                            src={course.thumbnail || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={course.title}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                            #{index + 1} Match
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {course.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                            {course.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                                course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {course.level}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span className="text-gray-600 dark:text-gray-400">{course.duration}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">
                                {typeof course.rating === 'number' ? course.rating : course.rating?.average || 4.5}
                              </span>
                            </div>
                          </div>
                          
                          <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors">
                            Start Learning
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {recommendations.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Perfect Matches Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Don't worry! Try adjusting your preferences or browse all available courses.
                      </p>
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 11 ? (
          <div className="bg-gray-50 dark:bg-gray-800 px-8 py-4 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Close</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  handleClose();
                  navigate('/recommendations');
                }}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
              >
                <span>View All Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : step < 11 && (
          <div className="bg-gray-50 dark:bg-gray-800 px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i + 1 <= step ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                if (step === 10) {
                  generateRecommendations();
                } else {
                  setStep(Math.min(11, step + 1));
                }
              }}
              disabled={
                (step === 1 && !questionnaire.experience) ||
                (step === 2 && questionnaire.interests.length === 0) ||
                (step === 3 && questionnaire.goals.length === 0) ||
                (step === 4 && !questionnaire.timeCommitment) ||
                (step === 5 && !questionnaire.learningStyle) ||
                (step === 6 && !questionnaire.careerLevel) ||
                (step === 7 && questionnaire.industryPreference.length === 0) ||
                (step === 8 && questionnaire.currentSkills.length === 0) ||
                (step === 9 && questionnaire.projectType.length === 0) ||
                (step === 10 && (!questionnaire.learningPace || !questionnaire.budgetRange))
              }
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{step === 10 ? 'Get Recommendations' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationModal;