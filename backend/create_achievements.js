const mongoose = require('mongoose');
const Achievement = require('./models/Achievement');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-recommendation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleAchievements() {
  try {
    console.log('Creating sample achievements...');
    
    const achievements = [
      {
        name: 'First Steps',
        description: 'Complete your first course',
        icon: '🎯',
        category: 'course',
        criteria: {
          type: 'course_count',
          threshold: 1
        },
        xpReward: 100,
        rarity: 'common',
        isActive: true
      },
      {
        name: 'Programming Beginner',
        description: 'Complete 3 programming courses',
        icon: '�',
        category: 'course',
        criteria: {
          type: 'course_count',
          threshold: 3,
          domainSpecific: {
            enabled: true,
            domain: 'Programming'
          }
        },
        xpReward: 300,
        rarity: 'uncommon',
        isActive: true
      },
      {
        name: 'Learning Streak',
        description: 'Complete courses for 7 consecutive days',
        icon: '�',
        category: 'streak',
        criteria: {
          type: 'daily_streak',
          threshold: 7
        },
        xpReward: 200,
        rarity: 'uncommon',
        isActive: true
      },
      {
        name: 'Quiz Champion',
        description: 'Score 90% or higher on 5 assessments',
        icon: '🏆',
        category: 'assessment',
        criteria: {
          type: 'assessment_score',
          threshold: 5
        },
        xpReward: 400,
        rarity: 'rare',
        isActive: true
      },
      {
        name: 'Review Writer',
        description: 'Write 5 course reviews',
        icon: '✍️',
        category: 'community',
        criteria: {
          type: 'review_count',
          threshold: 5
        },
        xpReward: 150,
        rarity: 'common',
        isActive: true
      },
      {
        name: 'Video Master',
        description: 'Watch 50 video lessons',
        icon: '📺',
        category: 'course',
        criteria: {
          type: 'video_count',
          threshold: 50
        },
        xpReward: 500,
        rarity: 'rare',
        isActive: true
      },
      {
        name: 'Course Collector',
        description: 'Complete 10 courses',
        icon: '📜',
        category: 'course',
        criteria: {
          type: 'course_count',
          threshold: 10
        },
        xpReward: 1000,
        rarity: 'epic',
        isActive: true
      },
      {
        name: 'Super Learner',
        description: 'Complete 25 courses',
        icon: '🌟',
        category: 'course',
        criteria: {
          type: 'course_count',
          threshold: 25
        },
        xpReward: 2500,
        rarity: 'legendary',
        isActive: true
      }
    ];

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('Cleared existing achievements');

    // Insert new achievements
    const result = await Achievement.insertMany(achievements);
    console.log(`✅ Created ${result.length} sample achievements`);

    // Display created achievements
    console.log('\n📋 Created Achievements:');
    result.forEach(achievement => {
      console.log(`${achievement.icon} ${achievement.name} - ${achievement.description} (${achievement.xpReward} XP)`);
    });

  } catch (error) {
    console.error('❌ Error creating achievements:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleAchievements();