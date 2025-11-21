import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ChatService {
  private sessionId: string;
  private sessionData: any = {};

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(message: string, type: string = 'text') {
    try {
      const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
      
      // Use public endpoint if no token available
      if (!token) {
        console.log('No auth token found, using public chat endpoint');
        const response = await axios.post(
          `${API_BASE_URL}/chat/public`,
          { message },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      }

      // Use enhanced chat endpoint with session data support
      const response = await axios.post(
        `${API_BASE_URL}/chat/chat`,
        {
          message,
          sessionId: this.sessionId,
          type,
          sessionData: this.sessionData
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local session data if returned from backend
      if (response.data.sessionData) {
        this.sessionData = { ...this.sessionData, ...response.data.sessionData };
      }

      return response.data;
    } catch (error) {
      console.error('Chat service error:', error);
      
      // Fallback to regular chat if Gemini fails
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const fallbackResponse = await axios.post(
            `${API_BASE_URL}/chat/chat`,
            {
              message,
              sessionId: this.sessionId,
              type
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          return fallbackResponse.data;
        } catch (fallbackError) {
          console.error('Fallback chat also failed:', fallbackError);
        }
      }
      
      throw new Error('Failed to send message');
    }
  }

  // Questionnaire specific methods
  async startQuestionnaire() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/chat/questionnaire/start`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Initialize session data for questionnaire
      if (response.data.sessionData) {
        this.sessionData = response.data.sessionData;
      }

      return response.data;
    } catch (error) {
      console.error('Questionnaire start error:', error);
      throw new Error('Failed to start questionnaire');
    }
  }

  async processQuestionnaireStep(step: number, answers: any, currentAnswer: string) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/chat/questionnaire/step`,
        {
          step,
          answers,
          currentAnswer
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update session data
      if (response.data.sessionData) {
        this.sessionData = { ...this.sessionData, ...response.data.sessionData };
      }

      return response.data;
    } catch (error) {
      console.error('Questionnaire step error:', error);
      throw new Error('Failed to process questionnaire step');
    }
  }

  // Clear session data (useful for starting fresh)
  clearSession() {
    this.sessionData = {};
    this.sessionId = this.generateSessionId();
  }

  // Get current session data
  getSessionData() {
    return this.sessionData;
  }

  // Detect the type of request for Gemini AI
  private detectRequestType(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || 
        lowerMessage.includes('course') || lowerMessage.includes('learn')) {
      return 'course-recommendation';
    }
    
    if (lowerMessage.includes('progress') || lowerMessage.includes('achievement') || 
        lowerMessage.includes('completed') || lowerMessage.includes('learning journey')) {
      return 'progress-analysis';
    }
    
    return 'general';
  }

  // New method for direct AI recommendations
  async getAIRecommendations(query: string = '') {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/chat/ai-recommendations?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('AI recommendations error:', error);
      throw new Error('Failed to get AI recommendations');
    }
  }

  async getChatHistory() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/chat/history/${this.sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Chat history error:', error);
      return { messages: [] };
    }
  }

  async getCourseRecommendations(preferences: any = {}) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/chat/recommendations`,
        {
          preferences,
          context: 'chatbot'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Recommendations error:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  async getStudySchedule(courseIds: string[] = [], availableHours: number = 10, preferences: any = {}) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/chat/study-schedule`,
        {
          courseIds,
          availableHours,
          preferences
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Study schedule error:', error);
      throw new Error('Failed to generate study schedule');
    }
  }

  async getUserProgress() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/chat/progress`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Progress error:', error);
      throw new Error('Failed to get progress');
    }
  }

  // Simulate AI-powered responses (can be replaced with actual AI API)
  async processWithAI(message: string, _context: any = {}) {
    try {
      // This is where you would integrate with OpenAI, Gemini, or other AI services
      // For now, we'll use the backend processing
      return await this.sendMessage(message);
    } catch (error) {
      console.error('AI processing error:', error);
      return {
        success: false,
        message: {
          text: "I'm having trouble processing your request right now. Please try again later.",
          sender: 'bot',
          type: 'text'
        }
      };
    }
  }

  resetSession() {
    this.sessionId = this.generateSessionId();
  }

  getSessionId() {
    return this.sessionId;
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;
