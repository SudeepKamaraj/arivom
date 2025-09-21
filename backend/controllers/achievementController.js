const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const GamificationService = require('../services/GamificationService');

/**
 * Controller for achievement-related operations
 */
const achievementController = {
  /**
   * Get all achievements
   */
  getAllAchievements: async (req, res) => {
    try {
      const achievements = await Achievement.find({ isActive: true });
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Get a single achievement by ID
   */
  getAchievement: async (req, res) => {
    try {
      const achievement = await Achievement.findById(req.params.id);
      
      if (!achievement) {
        return res.status(404).json({ message: 'Achievement not found' });
      }
      
      res.json(achievement);
    } catch (error) {
      console.error('Error fetching achievement:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Create a new achievement (admin only)
   */
  createAchievement: async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const achievement = new Achievement(req.body);
      await achievement.save();
      
      res.status(201).json(achievement);
    } catch (error) {
      console.error('Error creating achievement:', error);
      
      if (error.code === 11000) { // Duplicate key error
        return res.status(400).json({ message: 'Achievement with this name already exists' });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Update an achievement (admin only)
   */
  updateAchievement: async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const achievement = await Achievement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!achievement) {
        return res.status(404).json({ message: 'Achievement not found' });
      }
      
      res.json(achievement);
    } catch (error) {
      console.error('Error updating achievement:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Get user's achievements
   */
  getUserAchievements: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.id;
      
      // Check permission if requesting another user's achievements
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const achievements = await GamificationService.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Get user XP and level info
   */
  getUserXpInfo: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.id;
      
      // Check permission if requesting another user's XP
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const user = await User.findById(userId).select('xp level streak dailyXpEarned dailyXpCap');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Calculate XP needed for next level
      const currentLevelXP = GamificationService.getLevelXP(user.level);
      const nextLevelXP = GamificationService.getLevelXP(user.level + 1);
      const xpForNextLevel = nextLevelXP - currentLevelXP;
      const progress = ((user.xp - currentLevelXP) / xpForNextLevel) * 100;
      
      res.json({
        xp: user.xp,
        level: user.level,
        dailyXpEarned: user.dailyXpEarned,
        dailyXpCap: user.dailyXpCap,
        dailyXpRemaining: Math.max(0, user.dailyXpCap - user.dailyXpEarned),
        streak: user.streak,
        nextLevelXP,
        xpForNextLevel,
        progress: Math.round(progress)
      });
    } catch (error) {
      console.error('Error fetching user XP info:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Get leaderboard
   */
  getLeaderboard: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      
      // Get top users by XP
      const users = await User.find()
        .select('username firstName lastName xp level streak.current profilePicture')
        .sort({ xp: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await User.countDocuments();
      
      res.json({
        leaderboard: users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Award XP to user (used for testing and admin functions)
   */
  awardXP: async (req, res) => {
    try {
      // Only admins can manually award XP
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const { userId, activityType, amount } = req.body;
      
      if (!userId || !activityType || !amount) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const result = await GamificationService.awardXP(userId, activityType, amount);
      
      res.json(result);
    } catch (error) {
      console.error('Error awarding XP:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  /**
   * Check for and award achievements based on user actions
   */
  checkAchievements: async (req, res) => {
    try {
      const userId = req.user.id;
      const { actionType, courseId } = req.body;
      
      if (!actionType) {
        return res.status(400).json({ message: 'Action type is required' });
      }
      
      // Standard XP awards for common activities
      let xpAmount = 0;
      let activityType = '';
      
      switch (actionType) {
        case 'WATCH_VIDEO':
          xpAmount = 10;
          activityType = 'video_watched';
          break;
        case 'COMPLETE_COURSE':
          xpAmount = 50;
          activityType = 'course_completion';
          break;
        case 'PASS_ASSESSMENT':
          xpAmount = 30;
          activityType = 'assessment_passed';
          break;
        case 'REVIEW_COURSE':
          xpAmount = 15;
          activityType = 'review_submitted';
          break;
        case 'DAILY_LOGIN':
          xpAmount = 5;
          activityType = 'daily_login';
          break;
        default:
          activityType = actionType.toLowerCase();
          break;
      }
      
      // Award XP if applicable
      let xpResult = null;
      if (xpAmount > 0) {
        xpResult = await GamificationService.awardXP(userId, activityType, xpAmount, { courseId });
      }
      
      // Check for achievements
      const newAchievements = await GamificationService.checkForAchievements(userId);
      
      res.json({ 
        success: true,
        xpAwarded: xpAmount,
        levelUp: xpResult?.levelUp || false,
        newAchievements
      });
    } catch (error) {
      console.error('Error checking achievements:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = achievementController;