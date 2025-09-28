const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { auth } = require('../middleware/auth'); // Destructure to get the auth function

/**
 * @route   GET /api/achievements
 * @desc    Get all achievements
 * @access  Public
 */
router.get('/', achievementController.getAllAchievements);

/**
 * @route   GET /api/achievements/leaderboard
 * @desc    Get XP leaderboard
 * @access  Public
 */
router.get('/leaderboard', achievementController.getLeaderboard);

/**
 * @route   GET /api/achievements/user/:userId?
 * @desc    Get user's achievements (own or specified if admin)
 * @access  Private
 */
router.get('/user/:userId?', auth, achievementController.getUserAchievements);

/**
 * @route   GET /api/achievements/xp/user/:userId?
 * @desc    Get user's XP and level info
 * @access  Private
 */
router.get('/xp/user/:userId?', auth, achievementController.getUserXpInfo);

/**
 * @route   POST /api/achievements
 * @desc    Create a new achievement
 * @access  Admin only
 */
router.post('/', auth, achievementController.createAchievement);

/**
 * @route   GET /api/achievements/:id
 * @desc    Get a single achievement by ID
 * @access  Public
 */
router.get('/:id', achievementController.getAchievement);

/**
 * @route   PUT /api/achievements/:id
 * @desc    Update an achievement
 * @access  Admin only
 */
router.put('/:id', auth, achievementController.updateAchievement);

/**
 * @route   POST /api/achievements/award-xp
 * @desc    Manually award XP (admin only)
 * @access  Admin only
 */
router.post('/award-xp', auth, achievementController.awardXP);

/**
 * @route   GET /api/achievements/chains
 * @desc    Get achievement chains
 * @access  Public (with optional user context)
 */
router.get('/chains', achievementController.getAchievementChains);

/**
 * @route   GET /api/achievements/stats
 * @desc    Get achievement statistics
 * @access  Public (with optional user context)
 */
router.get('/stats', achievementController.getAchievementStats);

/**
 * @route   POST /api/achievements/check
 * @desc    Check for achievements based on user action
 * @access  Private
 */
router.post('/check', auth, achievementController.checkAchievements);

/**
 * @route   POST /api/achievements/progress
 * @desc    Update achievement progress manually
 * @access  Admin only
 */
router.post('/progress', auth, achievementController.updateProgress);

module.exports = router;