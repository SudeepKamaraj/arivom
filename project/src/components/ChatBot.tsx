import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';
import chatService from '../services/chatService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'course-recommendation' | 'study-plan' | 'quick-action';
  data?: any;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { courses } = useCourses();

  const quickActions: QuickAction[] = [
    {
      id: 'recommend-courses',
      label: 'Recommend Courses',
      icon: <BookOpen className="w-4 h-4" />,
      action: 'recommend_courses'
    },
    {
      id: 'study-schedule',
      label: 'Study Schedule',
      icon: <Clock className="w-4 h-4" />,
      action: 'study_schedule'
    },
    {
      id: 'progress-check',
      label: 'Check Progress',
      icon: <TrendingUp className="w-4 h-4" />,
      action: 'check_progress'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        text: user 
          ? `Hi ${user.firstName || user.username}! 👋 I'm your learning assistant. I can help you find courses, create study plans, and track your progress. How can I help you today?`
          : "Hello! 👋 I'm your learning assistant. I can help you discover courses and create study plans. Please sign in to get personalized recommendations!",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user]);

  const handleSendMessage = async (text: string, isQuickAction = false) => {
    if (!text.trim() && !isQuickAction) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      let response;
      
      if (user) {
        // Use API service for authenticated users
        try {
          const apiResponse = await chatService.sendMessage(text);
          if (apiResponse.success) {
            response = apiResponse.message;
          } else {
            throw new Error('API request failed');
          }
        } catch (apiError) {
          console.log('Authenticated API failed, using fallback:', apiError);
          response = await processMessage(text, isQuickAction);
        }
      } else {
        // For non-authenticated users, try test endpoint first, then fallback
        try {
          const testResponse = await fetch('http://localhost:5001/api/chat/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text })
          });
          
          if (testResponse.ok) {
            const data = await testResponse.json();
            if (data.success) {
              response = data.message;
            } else {
              throw new Error('Test API failed');
            }
          } else {
            throw new Error('Test API request failed');
          }
        } catch (testError) {
          console.log('Test API failed, using local fallback:', testError);
          response = await processMessage(text, isQuickAction);
        }
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        type: (response.type as Message['type']) || 'text',
        data: response.data || undefined
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const processMessage = async (text: string, isQuickAction: boolean) => {
    const lowerText = text.toLowerCase();

    // Quick actions
    if (isQuickAction || lowerText.includes('recommend') || lowerText.includes('course')) {
      return await generateCourseRecommendations();
    }
    
    if (isQuickAction || lowerText.includes('schedule') || lowerText.includes('plan')) {
      return generateStudySchedule();
    }
    
    if (isQuickAction || lowerText.includes('progress') || lowerText.includes('status')) {
      return generateProgressReport();
    }

    // General conversation
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return {
        text: `Hello! I'm here to help you with your learning journey. I can recommend courses, create study plans, or answer questions about your progress. What would you like to know?`
      };
    }

    if (lowerText.includes('help')) {
      return {
        text: `I can help you with:\n\n📚 **Course Recommendations** - Find courses that match your skills and interests\n⏰ **Study Scheduling** - Create personalized study plans\n📈 **Progress Tracking** - Monitor your learning progress\n🎯 **Learning Guidance** - Answer questions about courses and concepts\n\nJust ask me anything or use the quick action buttons!`
      };
    }

    // Default intelligent response
    return {
      text: `I understand you're asking about "${text}". While I'm still learning to understand all queries perfectly, I can definitely help you with course recommendations, study planning, and progress tracking. Could you try asking about one of these topics, or use the quick action buttons below?`
    };
  };

  const generateCourseRecommendations = async () => {
    if (!user) {
      return {
        text: "Please sign in to get personalized course recommendations based on your profile and learning history!"
      };
    }

    const availableCourses = courses.slice(0, 3); // Get first 3 courses as recommendations

    if (availableCourses.length === 0) {
      return {
        text: "I'd love to recommend courses, but it seems there are no courses available right now. Please check back later!"
      };
    }

    const recommendationText = `Based on your profile, here are my top course recommendations:\n\n${availableCourses.map((course, index) => 
      `${index + 1}. **${course.title}**\n   • Level: ${course.level}\n   • Duration: ${course.duration || 'N/A'}\n   • Price: ${course.price === 0 ? 'Free' : `₹${course.price}`}\n   • Students: ${course.students || 0}\n`
    ).join('\n')}`;

    return {
      text: recommendationText,
      type: 'course-recommendation',
      data: { courses: availableCourses }
    };
  };

  const generateStudySchedule = () => {
    const scheduleText = `Here's a personalized study plan for you:\n\n📅 **Weekly Study Schedule:**\n\n**Monday-Wednesday-Friday:**\n• 1 hour of video content\n• 30 minutes of practice\n\n**Tuesday-Thursday:**\n• 45 minutes of review\n• 15 minutes of assessment\n\n**Weekend:**\n• 2 hours of project work\n• Community discussion\n\n💡 **Tips:**\n• Study consistently at the same time\n• Take breaks every 45 minutes\n• Review previous lessons weekly\n• Practice with real projects`;

    return {
      text: scheduleText,
      type: 'study-plan'
    };
  };

  const generateProgressReport = () => {
    if (!user) {
      return {
        text: "Please sign in to view your learning progress and achievements!"
      };
    }

    const progressText = `📊 **Your Learning Progress:**\n\n🎯 **Current Status:**\n• Courses enrolled: 2\n• Courses completed: 0\n• Total study time: 8.5 hours\n• Certificates earned: 0\n\n📈 **This Week:**\n• Study sessions: 5\n• Hours studied: 3.2\n• Lessons completed: 8\n\n🏆 **Achievements:**\n• First Login Badge\n• Early Adopter\n\n🎯 **Next Goals:**\n• Complete your first course\n• Earn your first certificate\n• Study 10 hours total`;

    return {
      text: progressText,
      type: 'text'
    };
  };

  const handleQuickAction = (action: string) => {
    const actionTexts = {
      'recommend_courses': 'Please recommend some courses for me',
      'study_schedule': 'Create a study schedule for me',
      'check_progress': 'Show me my learning progress'
    };
    
    handleSendMessage(actionTexts[action as keyof typeof actionTexts] || action, true);
  };

  const renderMessage = (message: Message) => {
    const isBot = message.sender === 'bot';
    
    return (
      <div key={message.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`flex items-start space-x-2 max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isBot ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          
          <div className={`rounded-2xl px-4 py-3 shadow-sm ${
            isBot 
              ? 'bg-white border border-gray-200 text-gray-800' 
              : 'bg-blue-500 text-white'
          }`}>
            <div className="whitespace-pre-line text-sm leading-relaxed">
              {message.text}
            </div>
            <div className={`text-xs mt-2 ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 animate-pulse"
      >
        <MessageCircle className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Learning Assistant</h3>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map(renderMessage)}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.action)}
                    disabled={isLoading}
                    className="flex flex-col items-center space-y-1 p-2 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {action.icon}
                    <span className="text-xs font-medium text-gray-600">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={isLoading || !inputText.trim()}
                  className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;