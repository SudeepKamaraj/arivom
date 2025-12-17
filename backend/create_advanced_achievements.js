const mongoose = require('mongoose');
const Achievement = require('./models/Achievement');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coursedb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const advancedAchievements = [
  // Course Mastery Chain
  {
    name: "First Steps",
    description: "Complete your first course",
    icon: "🎯",
    category: "course",
    rarity: "common",
    difficulty: 1,
    estimatedTime: "1-2 hours",
    criteria: {
      type: "course_count",
      threshold: 1
    },
    xpReward: 50,
    isChained: true,
    tags: ["beginner", "milestone"]
  },
  {
    name: "Getting Momentum",
    description: "Complete 5 courses",
    icon: "🏃",
    category: "course",
    rarity: "uncommon",
    difficulty: 2,
    estimatedTime: "1-2 weeks",
    criteria: {
      type: "course_count",
      threshold: 5
    },
    xpReward: 150,
    isChained: true,
    tags: ["progress", "dedication"]
  },
  {
    name: "Course Enthusiast",
    description: "Complete 15 courses",
    icon: "📚",
    category: "course",
    rarity: "rare",
    difficulty: 3,
    estimatedTime: "1-2 months",
    criteria: {
      type: "course_count",
      threshold: 15
    },
    xpReward: 300,
    isChained: true,
    tags: ["enthusiasm", "commitment"]
  },
  {
    name: "Learning Master",
    description: "Complete 50 courses",
    icon: "🎓",
    category: "course",
    rarity: "epic",
    difficulty: 4,
    estimatedTime: "3-6 months",
    criteria: {
      type: "course_count",
      threshold: 50
    },
    xpReward: 750,
    isChained: true,
    tags: ["mastery", "expert"]
  },
  {
    name: "Knowledge Titan",
    description: "Complete 100 courses - You are truly dedicated to learning!",
    icon: "👑",
    category: "course",
    rarity: "legendary",
    difficulty: 5,
    estimatedTime: "6+ months",
    criteria: {
      type: "course_count",
      threshold: 100
    },
    xpReward: 2000,
    isChained: true,
    tags: ["legendary", "titan", "ultimate"]
  },

  // Assessment Excellence Chain
  {
    name: "Perfect Score",
    description: "Get 100% on any assessment",
    icon: "⭐",
    category: "assessment",
    rarity: "uncommon",
    difficulty: 2,
    estimatedTime: "1-3 attempts",
    criteria: {
      type: "perfect_score",
      threshold: 1
    },
    xpReward: 100,
    isChained: true,
    tags: ["perfection", "excellence"]
  },
  {
    name: "Consistency King",
    description: "Get perfect scores on 5 assessments",
    icon: "🎯",
    category: "assessment",
    rarity: "rare",
    difficulty: 3,
    estimatedTime: "1-2 weeks",
    criteria: {
      type: "perfect_score",
      threshold: 5
    },
    xpReward: 400,
    isChained: true,
    tags: ["consistency", "excellence"]
  },
  {
    name: "Assessment Virtuoso",
    description: "Achieve perfect scores on 20 assessments",
    icon: "🏆",
    category: "assessment",
    rarity: "epic",
    difficulty: 4,
    estimatedTime: "1-2 months",
    criteria: {
      type: "perfect_score",
      threshold: 20
    },
    xpReward: 1200,
    isChained: true,
    tags: ["virtuoso", "mastery"]
  },

  // Streak Champions
  {
    name: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    category: "streak",
    rarity: "common",
    difficulty: 2,
    estimatedTime: "1 week",
    criteria: {
      type: "daily_streak",
      threshold: 7
    },
    xpReward: 100,
    isChained: true,
    tags: ["consistency", "habit"]
  },
  {
    name: "Monthly Champion",
    description: "Maintain a 30-day learning streak",
    icon: "🌟",
    category: "streak",
    rarity: "rare",
    difficulty: 3,
    estimatedTime: "1 month",
    criteria: {
      type: "daily_streak",
      threshold: 30
    },
    xpReward: 500,
    isChained: true,
    tags: ["dedication", "champion"]
  },
  {
    name: "Legendary Streaker",
    description: "Maintain a 100-day learning streak - Ultimate dedication!",
    icon: "💎",
    category: "streak",
    rarity: "legendary",
    difficulty: 5,
    estimatedTime: "100+ days",
    criteria: {
      type: "daily_streak",
      threshold: 100
    },
    xpReward: 2500,
    isChained: true,
    tags: ["legendary", "dedication", "ultimate"]
  },

  // Special Seasonal Achievements
  {
    name: "New Year, New Skills",
    description: "Complete 3 courses in January",
    icon: "🎊",
    category: "special",
    rarity: "rare",
    difficulty: 2,
    estimatedTime: "1 month",
    criteria: {
      type: "course_count",
      threshold: 3,
      timeLimit: 744 // hours in January
    },
    xpReward: 300,
    seasonalEvent: {
      isEnabled: true,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      eventName: "New Year Learning Challenge"
    },
    tags: ["seasonal", "january", "challenge"]
  },

  // Speed Run Achievements
  {
    name: "Speed Learner",
    description: "Complete a course in under 2 hours",
    icon: "⚡",
    category: "special",
    rarity: "uncommon",
    difficulty: 3,
    estimatedTime: "< 2 hours",
    criteria: {
      type: "speed_run",
      threshold: 1,
      timeLimit: 2
    },
    xpReward: 200,
    tags: ["speed", "efficiency"]
  },

  // Social Learning
  {
    name: "Review Contributor",
    description: "Submit 10 helpful course reviews",
    icon: "📝",
    category: "community",
    rarity: "uncommon",
    difficulty: 2,
    estimatedTime: "2-3 weeks",
    criteria: {
      type: "review_count",
      threshold: 10
    },
    xpReward: 250,
    tags: ["community", "helpful", "reviews"]
  },
  {
    name: "Community Leader",
    description: "Submit 50 course reviews and help others learn",
    icon: "👥",
    category: "community",
    rarity: "epic",
    difficulty: 4,
    estimatedTime: "2-3 months",
    criteria: {
      type: "review_count",
      threshold: 50
    },
    xpReward: 1000,
    tags: ["leadership", "community", "mentor"]
  },

  // Explorer Achievements
  {
    name: "Domain Explorer",
    description: "Complete courses in 3 different categories",
    icon: "🗺️",
    category: "special",
    rarity: "rare",
    difficulty: 3,
    estimatedTime: "1-2 months",
    criteria: {
      type: "explorer",
      threshold: 3
    },
    xpReward: 400,
    tags: ["exploration", "diverse", "curious"]
  },
  {
    name: "Renaissance Learner",
    description: "Complete courses in 5 different categories - True versatility!",
    icon: "🎨",
    category: "special",
    rarity: "legendary",
    difficulty: 5,
    estimatedTime: "3-6 months",
    criteria: {
      type: "explorer",
      threshold: 5
    },
    xpReward: 1500,
    tags: ["renaissance", "versatile", "legendary"]
  }
];

async function createAdvancedAchievements() {
  try {
    console.log('Creating advanced achievements...');
    
    for (const achievementData of advancedAchievements) {
      // Check if achievement already exists
      const existing = await Achievement.findOne({ name: achievementData.name });
      
      if (!existing) {
        const achievement = new Achievement(achievementData);
        await achievement.save();
        console.log(`✅ Created: ${achievement.name} (${achievement.rarity})`);
      } else {
        console.log(`⏭️  Skipped: ${achievementData.name} (already exists)`);
      }
    }

    // Set up chained achievements
    console.log('\nSetting up achievement chains...');
    
    const courseChain = [
      "First Steps", "Getting Momentum", "Course Enthusiast", "Learning Master", "Knowledge Titan"
    ];
    
    const assessmentChain = [
      "Perfect Score", "Consistency King", "Assessment Virtuoso"
    ];
    
    const streakChain = [
      "Week Warrior", "Monthly Champion", "Legendary Streaker"
    ];

    const chains = [courseChain, assessmentChain, streakChain];
    
    for (const chain of chains) {
      for (let i = 1; i < chain.length; i++) {
        const current = await Achievement.findOne({ name: chain[i] });
        const previous = await Achievement.findOne({ name: chain[i - 1] });
        
        if (current && previous) {
          current.chainedFrom = previous._id;
          await current.save();
          console.log(`🔗 Linked: ${chain[i]} -> ${chain[i - 1]}`);
        }
      }
    }

    console.log('\n🎉 Advanced achievements setup complete!');
    console.log('\nAchievement Summary:');
    console.log(`📊 Total: ${advancedAchievements.length} achievements`);
    
    const counts = advancedAchievements.reduce((acc, a) => {
      acc[a.rarity] = (acc[a.rarity] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(counts).forEach(([rarity, count]) => {
      console.log(`${rarity}: ${count}`);
    });

  } catch (error) {
    console.error('Error creating achievements:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdvancedAchievements();