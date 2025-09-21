const User = require('../models/User');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');

/**
 * Service for managing user experience points, levels, and achievements
 */
class GamificationService {
  /**
   * Calculate the XP required for a given level
   * @param {number} level - The level to calculate XP for
   * @returns {number} - XP required for this level
   */
  static getLevelXP(level) {
    // Formula: 100 * (level^2) 
    // Level 1: 100 XP
    // Level 2: 400 XP
    // Level 3: 900 XP, etc.
    return 100 * (level * level);
  }

  /**
   * Calculate user's level based on total XP
   * @param {number} xp - User's total XP
   * @returns {number} - User's level
   */
  static calculateLevel(xp) {
    // Formula is the inverse of getLevelXP
    // level = sqrt(xp / 100)
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Award XP to a user for completing an activity
   * @param {string} userId - The user's ID
   * @param {string} activityType - Type of activity (e.g., 'course_completion', 'video_watched')
   * @param {number} amount - Amount of XP to award
   * @param {Object} metadata - Additional metadata about the activity
   * @returns {Promise<Object>} - Updated user object with new XP and level
   */
  static async awardXP(userId, activityType, amount, metadata = {}) {
    try {
      // Get the user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check daily XP cap
      const now = new Date();
      const resetDate = new Date(user.lastXpReset);
      
      // Reset daily XP if it's a new day
      if (resetDate.getDate() !== now.getDate() || 
          resetDate.getMonth() !== now.getMonth() || 
          resetDate.getFullYear() !== now.getFullYear()) {
        user.dailyXpEarned = 0;
        user.lastXpReset = now;
      }

      // Cap the XP award if necessary
      const availableXP = Math.max(0, user.dailyXpCap - user.dailyXpEarned);
      const awardedXP = Math.min(amount, availableXP);
      
      if (awardedXP <= 0) {
        return { user, xpAwarded: 0, levelUp: false, message: 'Daily XP cap reached' };
      }

      // Update user's XP and daily XP earned
      const oldLevel = user.level;
      user.xp += awardedXP;
      user.dailyXpEarned += awardedXP;
      
      // Recalculate level
      user.level = this.calculateLevel(user.xp);
      
      // Check for streak updates
      if (activityType === 'daily_login' || activityType === 'course_progress') {
        const lastActivity = user.streak.lastActivityDate ? new Date(user.streak.lastActivityDate) : null;
        
        // If last activity was yesterday, increment streak
        if (lastActivity) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastActivity.getDate() === yesterday.getDate() && 
              lastActivity.getMonth() === yesterday.getMonth() && 
              lastActivity.getFullYear() === yesterday.getFullYear()) {
            user.streak.current += 1;
            
            // Update longest streak if current exceeds it
            if (user.streak.current > user.streak.longest) {
              user.streak.longest = user.streak.current;
            }
          } else if (lastActivity.getTime() < yesterday.getTime()) {
            // Reset streak if more than a day has passed
            user.streak.current = 1;
          }
        } else {
          // First activity
          user.streak.current = 1;
          user.streak.longest = 1;
        }
        
        user.streak.lastActivityDate = now;
      }

      // Save the updated user
      await user.save();
      
      // Check for and award any achievements
      const newAchievements = await this.checkForAchievements(userId);
      
      // Determine if user leveled up
      const levelUp = user.level > oldLevel;
      
      return { 
        user, 
        xpAwarded: awardedXP, 
        levelUp, 
        newLevel: user.level, 
        newAchievements 
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }

  /**
   * Check and award any achievements the user has earned
   * @param {string} userId - The user's ID
   * @returns {Promise<Array>} - Array of new achievements earned
   */
  static async checkForAchievements(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get all active achievements
      const achievements = await Achievement.find({ isActive: true });
      const newAchievements = [];
      
      // For each achievement, check if user meets criteria
      for (const achievement of achievements) {
        // Check if user already has this achievement
        const existingAchievement = await UserAchievement.findOne({
          userId,
          achievementId: achievement._id,
          isCompleted: true
        });
        
        if (existingAchievement) {
          continue; // Skip if already earned
        }
        
        let progress = 0;
        let isEarned = false;
        
        // Check different achievement criteria
        switch (achievement.criteria.type) {
          case 'course_count':
            // TODO: Implement course completion count check
            break;
            
          case 'assessment_score':
            // TODO: Implement assessment score check
            break;
            
          case 'daily_streak':
            progress = (user.streak.current / achievement.criteria.threshold) * 100;
            isEarned = user.streak.current >= achievement.criteria.threshold;
            break;
            
          case 'review_count':
            // TODO: Implement review count check
            break;
            
          case 'video_count':
            // TODO: Implement video count check
            break;
        }
        
        // If achievement criteria met, award it
        if (isEarned) {
          let userAchievement = await UserAchievement.findOne({
            userId,
            achievementId: achievement._id
          });
          
          if (!userAchievement) {
            // Create new user achievement if doesn't exist
            userAchievement = new UserAchievement({
              userId,
              achievementId: achievement._id,
              progress: 100,
              isCompleted: true
            });
          } else {
            // Update existing achievement
            userAchievement.progress = 100;
            userAchievement.isCompleted = true;
          }
          
          await userAchievement.save();
          
          // Award XP for earning achievement
          await this.awardXP(userId, 'achievement_earned', achievement.xpReward, {
            achievementId: achievement._id,
            achievementName: achievement.name
          });
          
          // Add to new achievements list
          newAchievements.push({
            ...achievement.toObject(),
            earnedAt: userAchievement.earnedAt
          });
        } 
        // Update progress on incomplete achievements
        else if (progress > 0) {
          let userAchievement = await UserAchievement.findOne({
            userId,
            achievementId: achievement._id
          });
          
          if (!userAchievement) {
            userAchievement = new UserAchievement({
              userId,
              achievementId: achievement._id,
              progress: Math.round(progress)
            });
          } else {
            userAchievement.progress = Math.round(progress);
          }
          
          await userAchievement.save();
        }
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  /**
   * Get all achievements for a user
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} - Object containing earned and in-progress achievements
   */
  static async getUserAchievements(userId) {
    try {
      // Find all user achievements
      const userAchievements = await UserAchievement.find({ user: userId })
        .populate('achievement')
        .lean();
      
      // Separate into earned and in-progress
      const earned = userAchievements
        .filter(ua => ua.isCompleted)
        .map(ua => ({
          ...ua.achievement,
          earnedAt: ua.earnedAt
        }));
      
      const inProgress = userAchievements
        .filter(ua => !ua.isCompleted)
        .map(ua => ({
          ...ua.achievement,
          progress: ua.progress
        }));
      
      return { earned, inProgress };
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }
}

module.exports = GamificationService;