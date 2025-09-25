import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Video, Calendar, Trophy, Star, MapPin, Clock, Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../services/apiService';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId: string;
  courseName: string;
  members: GroupMember[];
  maxMembers: number;
  meetingSchedule: string;
  nextMeeting: Date;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  timezone: string;
  tags: string[];
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
}

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  studyStreak: number;
  contributionScore: number;
}

interface StudyBuddy {
  id: string;
  name: string;
  avatar: string;
  commonCourses: string[];
  studyTime: string;
  timezone: string;
  learningStyle: string;
  compatibility: number; // 0-100
  lastActive: Date;
}

const PeerLearning: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'groups' | 'buddies' | 'sessions'>('groups');
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [suggestedBuddies, setSuggestedBuddies] = useState<StudyBuddy[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadStudyGroups();
      loadSuggestedBuddies();
      loadUpcomingSessions();
    }
  }, [user]);

  const loadStudyGroups = async () => {
    try {
      const response = await fetchWithAuth('/peers/groups');
      const data = await response.json();
      
      // Transform API data to match component interface
      const transformedGroups = data.groups.map((group: any) => ({
        id: group._id,
        name: group.name,
        description: group.description,
        courseId: group.topic, // Using topic as courseId for now
        courseName: group.topic,
        members: group.members?.map((member: any) => ({
          id: member.user._id,
          name: member.user.name,
          avatar: '👤',
          role: member.role,
          joinedAt: new Date(member.joinedAt),
          studyStreak: Math.floor(Math.random() * 20),
          contributionScore: Math.floor(Math.random() * 100)
        })) || [],
        maxMembers: group.maxMembers,
        meetingSchedule: group.schedule,
        nextMeeting: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        topic: group.topic,
        level: group.level,
        language: 'English',
        timezone: 'UTC',
        tags: group.tags || [],
        isPrivate: false,
        createdBy: group.creator?._id || '',
        createdAt: new Date(group.createdAt)
      }));
      
      setStudyGroups(transformedGroups);
      
    } catch (error) {
      console.error('Error loading study groups:', error);
      // Fallback to mock data
      loadMockStudyGroups();
    }
  };

  const loadMockStudyGroups = () => {
    // Simulate API call
    const groups: StudyGroup[] = [
      {
        id: '1',
        name: 'JavaScript Ninjas',
        description: 'Master JavaScript fundamentals together! We meet twice a week to discuss concepts and solve coding challenges.',
        courseId: 'js-course-1',
        courseName: 'JavaScript Fundamentals',
        members: [
          { id: '1', name: 'Alex Johnson', avatar: '👨‍💻', role: 'admin', joinedAt: new Date(), studyStreak: 15, contributionScore: 95 },
          { id: '2', name: 'Sarah Chen', avatar: '👩‍💻', role: 'moderator', joinedAt: new Date(), studyStreak: 12, contributionScore: 88 },
          { id: '3', name: 'Mike Rodriguez', avatar: '👨‍🎓', role: 'member', joinedAt: new Date(), studyStreak: 8, contributionScore: 72 }
        ],
        maxMembers: 8,
        meetingSchedule: 'Tue & Thu, 7:00 PM',
        nextMeeting: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        topic: 'Async/Await and Promises',
        level: 'intermediate',
        language: 'English',
        timezone: 'EST',
        tags: ['JavaScript', 'Web Development', 'Coding Practice'],
        isPrivate: false,
        createdBy: '1',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'React Study Circle',
        description: 'Building real projects while learning React. Share code, get feedback, and grow together!',
        courseId: 'react-course-1',
        courseName: 'React Fundamentals',
        members: [
          { id: '4', name: 'Emma Wilson', avatar: '👩‍🔬', role: 'admin', joinedAt: new Date(), studyStreak: 20, contributionScore: 92 },
          { id: '5', name: 'David Kim', avatar: '👨‍💼', role: 'member', joinedAt: new Date(), studyStreak: 5, contributionScore: 65 }
        ],
        maxMembers: 6,
        meetingSchedule: 'Mon, Wed, Fri 6:00 PM',
        nextMeeting: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        topic: 'State Management with Context API',
        level: 'beginner',
        language: 'English',
        timezone: 'PST',
        tags: ['React', 'Frontend', 'Projects'],
        isPrivate: false,
        createdBy: '4',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      }
    ];
    setStudyGroups(groups);
  };

  const loadSuggestedBuddies = async () => {
    try {
      const response = await fetchWithAuth('/peers/find-buddies');
      const buddies = await response.json();
      
      // Transform API data to match component interface
      const transformedBuddies = buddies.map((buddy: any) => ({
        id: buddy._id,
        name: buddy.name,
        avatar: '👤',
        commonCourses: buddy.sharedInterests,
        studyTime: '7:00 PM - 9:00 PM', // Mock time
        timezone: 'UTC',
        learningStyle: 'Mixed Learner',
        compatibility: buddy.compatibilityScore,
        lastActive: new Date()
      }));
      
      setSuggestedBuddies(transformedBuddies);
      
    } catch (error) {
      console.error('Error loading suggested buddies:', error);
      loadMockBuddies();
    }
  };

  const loadMockBuddies = () => {
    const buddies: StudyBuddy[] = [
      {
        id: '1',
        name: 'Lisa Park',
        avatar: '👩‍🎨',
        commonCourses: ['JavaScript Fundamentals', 'React Basics'],
        studyTime: '7:00 PM - 9:00 PM',
        timezone: 'EST',
        learningStyle: 'Visual Learner',
        compatibility: 92,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Carlos Martinez',
        avatar: '👨‍🔧',
        commonCourses: ['Python for Beginners'],
        studyTime: '6:00 AM - 8:00 AM',
        timezone: 'CST',
        learningStyle: 'Hands-on Learner',
        compatibility: 87,
        lastActive: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Zoe Anderson',
        avatar: '👩‍🚀',
        commonCourses: ['Data Structures', 'Algorithms'],
        studyTime: '8:00 PM - 10:00 PM',
        timezone: 'PST',
        learningStyle: 'Collaborative Learner',
        compatibility: 85,
        lastActive: new Date(Date.now() - 5 * 60 * 1000)
      }
    ];
    setSuggestedBuddies(buddies);
  };

  const loadUpcomingSessions = () => {
    const sessions = [
      {
        id: '1',
        title: 'JavaScript Deep Dive',
        groupName: 'JavaScript Ninjas',
        time: new Date(Date.now() + 6 * 60 * 60 * 1000),
        attendees: 5,
        type: 'study'
      },
      {
        id: '2',
        title: 'React Project Review',
        groupName: 'React Study Circle',
        time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        attendees: 3,
        type: 'project'
      }
    ];
    setUpcomingSessions(sessions);
  };

  const joinGroup = (groupId: string) => {
    setStudyGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              members: [...group.members, {
                id: (user as any)?.id || 'current-user',
                name: (user as any)?.firstName + ' ' + (user as any)?.lastName || 'You',
                avatar: '👤',
                role: 'member' as const,
                joinedAt: new Date(),
                studyStreak: 0,
                contributionScore: 0
              }]
            }
          : group
      )
    );
  };

  const connectWithBuddy = (buddyId: string) => {
    // Simulate connection
    console.log('Connecting with buddy:', buddyId);
  };

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-isabelline min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-gunmetal mb-2">Peer Learning Hub</h1>
        <p className="text-dark-gunmetal/70">Connect, collaborate, and learn together with fellow students</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'groups', label: 'Study Groups', icon: Users },
            { id: 'buddies', label: 'Study Buddies', icon: Star },
            { id: 'sessions', label: 'Live Sessions', icon: Video }
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

      {/* Study Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search groups by name, course, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create Group</span>
              </button>
            </div>
          </div>

          {/* Groups List */}
          <div className="grid gap-6 md:grid-cols-2">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{group.courseName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    group.level === 'beginner' ? 'bg-green-100 text-green-700' :
                    group.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {group.level}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                {/* Group Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{group.members.length}/{group.maxMembers} members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{group.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{group.timezone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Next: {group.nextMeeting.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Member Avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((member) => (
                      <div key={member.id} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm border-2 border-white">
                        {member.avatar}
                      </div>
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => joinGroup(group.id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Buddies Tab */}
      {activeTab === 'buddies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Suggested Study Buddies</h3>
            <p className="text-gray-600 mb-6">AI-matched based on your courses, study times, and learning style</p>
            
            <div className="grid gap-4">
              {suggestedBuddies.map((buddy) => (
                <div key={buddy.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                        {buddy.avatar}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{buddy.name}</h4>
                        <p className="text-sm text-gray-600">{buddy.learningStyle} • {buddy.timezone}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-green-600">{buddy.compatibility}% match</span>
                          </div>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            Active {Math.floor((Date.now() - buddy.lastActive.getTime()) / (1000 * 60))}m ago
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {buddy.commonCourses.slice(0, 2).map((course) => (
                          <span key={course} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {course}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Studies: {buddy.studyTime}</p>
                      <button
                        onClick={() => connectWithBuddy(buddy.id)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Live Sessions</h3>
            
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{session.title}</h4>
                      <p className="text-sm text-gray-600">{session.groupName}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>📅 {session.time.toLocaleDateString()}</span>
                        <span>🕐 {session.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>👥 {session.attendees} attending</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                        <Video className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerLearning;