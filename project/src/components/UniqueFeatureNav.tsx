import React from 'react';
import { Users, Brain, Calendar, Briefcase, Target, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UniqueFeatureNavProps {
  className?: string;
}

const UniqueFeatureNav: React.FC<UniqueFeatureNavProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'peer-learning',
      title: 'Peer Learning Hub',
      description: 'Study groups & learning buddies',
      icon: Users,
      path: '/peer-learning',
      color: 'from-blue-500 to-cyan-500',
      isNew: true
    },
    {
      id: 'career-hub',
      title: 'Career Hub',
      description: 'Job matching & skill gaps',
      icon: Briefcase,
      path: '/career-hub',
      color: 'from-purple-500 to-pink-500',
      isNew: true
    },
    {
      id: 'interactive-assessments',
      title: 'Coding Challenges',
      description: 'Interactive assessments',
      icon: Code,
      path: '/assessments',
      color: 'from-green-500 to-teal-500',
      isNew: true
    }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 Unique Features</h3>
        <p className="text-gray-600 text-sm">Exclusive features you won't find elsewhere</p>
      </div>

      <div className="space-y-4">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => navigate(feature.path)}
              className="w-full group"
            >
              <div className={`relative p-4 rounded-xl bg-gradient-to-r ${feature.color} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                {feature.isNew && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    NEW
                  </div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-white mb-1 group-hover:text-gray-100 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-white/80 text-sm group-hover:text-white/90 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="text-white/60 group-hover:text-white/80 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Features Highlight */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-5 h-5 text-orange-600" />
          <h4 className="font-semibold text-orange-800">AI-Powered Learning</h4>
        </div>
        <p className="text-sm text-orange-700 mb-3">
          Every course includes an AI Learning Companion and Smart Study Planner that adapts to your learning style.
        </p>
        <div className="flex space-x-2">
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Personalized</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Adaptive</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Smart</span>
        </div>
      </div>

      {/* Social Learning Highlight */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">Learn Together</h4>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Join study groups, find learning buddies, and participate in live coding sessions with peers.
        </p>
        <div className="flex space-x-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Study Groups</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Live Sessions</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Peer Reviews</span>
        </div>
      </div>
    </div>
  );
};

export default UniqueFeatureNav;