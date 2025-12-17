// Example OpenAI integration for the chatbot
// This file shows how to integrate OpenAI API for more intelligent responses

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo - use backend in production
});

export class AIService {
  
  async generateCourseRecommendation(userProfile: any, availableCourses: any[], query: string) {
    try {
      const prompt = `
You are an intelligent learning assistant for a course recommendation system. 

User Profile:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Learning Level: ${userProfile.level || 'Beginner'}
- Completed Courses: ${userProfile.completedCourses || 0}

Available Courses:
${availableCourses.map(course => `
- ${course.title}
  Level: ${course.level}
  Skills: ${course.skills?.join(', ') || 'N/A'}
  Duration: ${course.duration}
  Price: ${course.price === 0 ? 'Free' : `₹${course.price}`}
  Students: ${course.students || 0}
  Description: ${course.description}
`).join('\n')}

User Query: "${query}"

Please recommend the most suitable courses for this user and explain why they would be beneficial. Be conversational, helpful, and personalized. Focus on how the courses align with their goals and current skill level.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a friendly and knowledgeable learning assistant. Help users find the best courses for their goals."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return {
        text: response.choices[0]?.message?.content || "I'm having trouble generating recommendations right now.",
        type: 'course-recommendation',
        data: { courses: availableCourses }
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        text: "I'm having trouble accessing my AI capabilities right now. Let me give you some basic recommendations based on your profile.",
        type: 'text'
      };
    }
  }

  async generateStudyPlan(userProfile: any, enrolledCourses: any[], preferences: any) {
    try {
      const prompt = `
Create a personalized study schedule for a user with the following profile:

User Profile:
- Available time per week: ${preferences.availableHours || 10} hours
- Preferred study times: ${preferences.preferredTimes || 'Evenings'}
- Learning style: ${preferences.learningStyle || 'Mixed'}
- Current level: ${userProfile.level || 'Beginner'}

Enrolled Courses:
${enrolledCourses.map(course => `
- ${course.title} (${course.level}, Duration: ${course.duration})
`).join('\n')}

Please create a detailed weekly study plan that:
1. Optimizes learning retention
2. Balances theory and practice
3. Includes regular breaks and review sessions
4. Considers the user's available time and preferences
5. Provides specific daily recommendations

Be encouraging and practical in your recommendations.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", 
            content: "You are an expert learning coach. Create practical, personalized study plans that help students succeed."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      });

      return {
        text: response.choices[0]?.message?.content || "I'll create a basic study plan for you.",
        type: 'study-plan'
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        text: "I'm having trouble creating a personalized plan right now. Here's a general study schedule that works well for most learners.",
        type: 'study-plan'
      };
    }
  }

  async answerQuestion(question: string, context: any) {
    try {
      const prompt = `
You are a helpful learning assistant for an online course platform. Answer the user's question in a friendly, informative way.

User Question: "${question}"

Context:
- User is ${context.user ? 'logged in' : 'not logged in'}
- Available features: Course recommendations, study planning, progress tracking
- Platform has courses in: Programming, Data Science, Business, Design, etc.

Provide a helpful response that guides the user toward relevant features or information.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a friendly learning assistant. Help users with their questions about online learning and course selection."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return {
        text: response.choices[0]?.message?.content || "I'd be happy to help! Could you please rephrase your question?",
        type: 'text'
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        text: "I'm here to help with course recommendations, study planning, and learning guidance. What specific area would you like assistance with?",
        type: 'text'
      };
    }
  }
}

export const aiService = new AIService();
