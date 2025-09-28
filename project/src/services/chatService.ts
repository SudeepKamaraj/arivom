import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ChatService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(message: string, type: string = 'text') {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
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

      return response.data;
    } catch (error) {
      console.error('Chat service error:', error);
      throw new Error('Failed to send message');
    }
  }

  async getChatHistory() {
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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