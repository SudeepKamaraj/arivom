import { useState } from 'react';
import { Check, ArrowRight, BookOpen, Code, Palette, Calculator, Globe, Music, Camera, Briefcase, Heart, Zap } from 'lucide-react';

interface SkillsInterestsSelectionProps {
  onComplete: (data: { skills: string[], interests: string[], experienceLevel: string, completedCourses: string[] }) => void;
}

const skillCategories = [
  {
    category: 'Programming & Tech',
    icon: <Code className="h-6 w-6" />,
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL', 'Machine Learning', 'Data Science', 'Cybersecurity']
  },
  {
    category: 'Design & Creative',
    icon: <Palette className="h-6 w-6" />,
    skills: ['UI/UX Design', 'Graphic Design', 'Adobe Photoshop', 'Figma', 'Illustration', 'Video Editing', 'Animation', 'Photography', 'Web Design', 'Branding']
  },
  {
    category: 'Business & Marketing',
    icon: <Briefcase className="h-6 w-6" />,
    skills: ['Digital Marketing', 'SEO', 'Content Marketing', 'Project Management', 'Sales', 'Entrepreneurship', 'Finance', 'Leadership', 'Communication', 'Strategy']
  },
  {
    category: 'Science & Math',
    icon: <Calculator className="h-6 w-6" />,
    skills: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Statistics', 'Research', 'Data Analysis', 'Engineering', 'Astronomy', 'Environmental Science']
  },
  {
    category: 'Languages & Literature',
    icon: <Globe className="h-6 w-6" />,
    skills: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Writing', 'Literature', 'Translation', 'Public Speaking', 'Creative Writing']
  },
  {
    category: 'Arts & Music',
    icon: <Music className="h-6 w-6" />,
    skills: ['Piano', 'Guitar', 'Singing', 'Music Production', 'Drawing', 'Painting', 'Sculpture', 'Dance', 'Theater', 'Film Making']
  }
];

const interestAreas = [
  { name: 'Technology & Innovation', icon: <Zap className="h-5 w-5" /> },
  { name: 'Creative Arts', icon: <Palette className="h-5 w-5" /> },
  { name: 'Business & Entrepreneurship', icon: <Briefcase className="h-5 w-5" /> },
  { name: 'Health & Wellness', icon: <Heart className="h-5 w-5" /> },
  { name: 'Science & Research', icon: <Calculator className="h-5 w-5" /> },
  { name: 'Education & Teaching', icon: <BookOpen className="h-5 w-5" /> },
  { name: 'Media & Communication', icon: <Camera className="h-5 w-5" /> },
  { name: 'Travel & Culture', icon: <Globe className="h-5 w-5" /> },
  { name: 'Music & Entertainment', icon: <Music className="h-5 w-5" /> }
];

const experienceLevels = [
  { level: 'Beginner', description: 'New to learning, looking to explore' },
  { level: 'Intermediate', description: 'Some experience, want to build skills' },
  { level: 'Advanced', description: 'Experienced, seeking specialization' },
  { level: 'Expert', description: 'Professional level, continuous learning' }
];

const commonCourseTypes = [
  'Web Development',
  'Mobile App Development',
  'Data Science & Analytics',
  'Machine Learning & AI',
  'Cloud Computing (AWS/Azure/GCP)',
  'Digital Marketing',
  'UI/UX Design',
  'Project Management',
  'Cybersecurity',
  'Database Management',
  'DevOps & CI/CD',
  'Blockchain Development',
  'Game Development',
  'Business Analysis',
  'Content Creation & Writing',
  'Photography & Video Editing',
  'Financial Analysis',
  'Leadership & Management',
  'Sales & Customer Relations',
  'Quality Assurance & Testing'
];

export default function SkillsInterestsSelection({ onComplete }: SkillsInterestsSelectionProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleCourseToggle = (course: string) => {
    setCompletedCourses(prev => 
      prev.includes(course) 
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    onComplete({
      skills: selectedSkills,
      interests: selectedInterests,
      experienceLevel,
      completedCourses
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedSkills.length >= 3;
      case 2: return selectedInterests.length >= 2;
      case 3: return completedCourses.length >= 0; // Optional step, can proceed with 0 courses
      case 4: return experienceLevel !== '';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalize Your Learning Journey</h1>
          <p className="text-gray-600">Help us recommend the perfect courses for you</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">
              Step {currentStep} of 4
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Skills Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What skills do you want to learn or improve?</h2>
              <p className="text-gray-600 mb-6">Select at least 3 skills that interest you</p>
              
              <div className="space-y-6">
                {skillCategories.map((category) => (
                  <div key={category.category}>
                    <div className="flex items-center mb-3">
                      <div className="text-red-600 mr-2">{category.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {category.skills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            selectedSkills.includes(skill)
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Selected: {selectedSkills.length} skills
                </p>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Interests Selection */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are your main areas of interest?</h2>
              <p className="text-gray-600 mb-6">Select at least 2 areas that you're passionate about</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interestAreas.map((interest) => (
                  <button
                    key={interest.name}
                    onClick={() => handleInterestToggle(interest.name)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedInterests.includes(interest.name)
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={selectedInterests.includes(interest.name) ? 'text-red-600' : 'text-gray-400'}>
                        {interest.icon}
                      </div>
                      <span className="font-medium">{interest.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Selected: {selectedInterests.length} interests
                </p>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Previous Learning Experience */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What courses or training have you completed?</h2>
              <p className="text-gray-600 mb-6">Select any courses you've completed before (optional - helps us avoid recommending similar content)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {commonCourseTypes.map((course) => (
                  <button
                    key={course}
                    onClick={() => handleCourseToggle(course)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      completedCourses.includes(course)
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{course}</span>
                      {completedCourses.includes(course) && (
                        <Check className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Selected: {completedCourses.length} completed courses
                </p>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Experience Level */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your experience level?</h2>
              <p className="text-gray-600 mb-6">This helps us recommend courses at the right difficulty</p>
              
              <div className="space-y-4">
                {experienceLevels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => setExperienceLevel(level.level)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      experienceLevel === level.level
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${
                          experienceLevel === level.level ? 'text-red-700' : 'text-gray-900'
                        }`}>
                          {level.level}
                        </h3>
                        <p className="text-gray-600 text-sm">{level.description}</p>
                      </div>
                      {experienceLevel === level.level && (
                        <Check className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
                >
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
