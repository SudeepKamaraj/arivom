const express = require('express');
const { auth } = require('../middleware/auth');
const StudyGroup = require('../models/StudyGroup');
const PeerRelationship = require('../models/PeerRelationship');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

// Get all study groups with search and filter
router.get('/groups', auth, async (req, res) => {
  try {
    const { search, category, level, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    const groups = await StudyGroup.find(query)
      .populate('creator', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Add membership status for current user
    const groupsWithStatus = groups.map(group => {
      const isMember = group.members.some(member => 
        member.user._id.toString() === userId.toString()
      );
      const isCreator = group.creator._id.toString() === userId.toString();
      
      return {
        ...group.toObject(),
        memberCount: group.members.length,
        isMember,
        isCreator,
        canJoin: !isMember && group.members.length < group.maxMembers
      };
    });
    
    const total = await StudyGroup.countDocuments(query);
    
    res.json({
      groups: groupsWithStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
    
  } catch (error) {
    console.error('Error fetching study groups:', error);
    res.status(500).json({ message: 'Failed to fetch study groups' });
  }
});

// Create a new study group
router.post('/groups', auth, async (req, res) => {
  try {
    const { name, topic, category, level, description, maxMembers, schedule, tags } = req.body;
    const userId = req.user._id;
    
    const studyGroup = new StudyGroup({
      name,
      topic,
      category,
      level,
      description,
      creator: userId,
      maxMembers,
      schedule,
      tags,
      members: [{
        user: userId,
        role: 'creator'
      }]
    });
    
    await studyGroup.save();
    
    const populatedGroup = await StudyGroup.findById(studyGroup._id)
      .populate('creator', 'name email')
      .populate('members.user', 'name email');
    
    res.status(201).json(populatedGroup);
    
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ message: 'Failed to create study group' });
  }
});

// Join a study group
router.post('/groups/:groupId/join', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if already a member
    const isMember = group.members.some(member => 
      member.user.toString() === userId.toString()
    );
    
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }
    
    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Study group is full' });
    }
    
    group.members.push({
      user: userId,
      role: 'member'
    });
    
    await group.save();
    
    const updatedGroup = await StudyGroup.findById(groupId)
      .populate('creator', 'name email')
      .populate('members.user', 'name email');
    
    res.json(updatedGroup);
    
  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({ message: 'Failed to join study group' });
  }
});

// Leave a study group
router.post('/groups/:groupId/leave', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Remove user from members
    group.members = group.members.filter(member => 
      member.user.toString() !== userId.toString()
    );
    
    // If creator leaves and there are other members, assign a new creator
    if (group.creator.toString() === userId.toString() && group.members.length > 0) {
      const newCreator = group.members[0];
      group.creator = newCreator.user;
      newCreator.role = 'creator';
    }
    
    // If no members left, deactivate the group
    if (group.members.length === 0) {
      group.isActive = false;
    }
    
    await group.save();
    
    res.json({ message: 'Left study group successfully' });
    
  } catch (error) {
    console.error('Error leaving study group:', error);
    res.status(500).json({ message: 'Failed to leave study group' });
  }
});

// Get user's study groups
router.get('/my-groups', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const groups = await StudyGroup.find({
      'members.user': userId,
      isActive: true
    })
    .populate('creator', 'name email')
    .populate('members.user', 'name email')
    .sort({ updatedAt: -1 });
    
    res.json(groups);
    
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Failed to fetch user groups' });
  }
});

// Find study buddies
router.get('/find-buddies', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    
    // Get user's enrolled courses to find similar users
    const userCourses = await Course.find({
      'enrolledStudents.student': userId
    });
    
    const userCourseIds = userCourses.map(course => course._id);
    const userCategories = [...new Set(userCourses.map(course => course.category))];
    
    // Find users with similar course interests
    const potentialBuddies = await User.find({
      _id: { $ne: userId } // Exclude current user
    }).limit(20);
    
    // Calculate compatibility scores
    const buddiesWithScores = await Promise.all(
      potentialBuddies.map(async (buddy) => {
        const buddyCourses = await Course.find({
          'enrolledStudents.student': buddy._id
        });
        
        const buddyCategories = [...new Set(buddyCourses.map(course => course.category))];
        
        // Calculate compatibility based on shared interests
        const sharedCategories = userCategories.filter(cat => buddyCategories.includes(cat));
        const compatibilityScore = Math.min(
          (sharedCategories.length / Math.max(userCategories.length, buddyCategories.length)) * 100,
          100
        );
        
        // Check if already connected
        const existingRelation = await PeerRelationship.findOne({
          $or: [
            { requester: userId, recipient: buddy._id },
            { requester: buddy._id, recipient: userId }
          ]
        });
        
        return {
          _id: buddy._id,
          name: buddy.name,
          email: buddy.email,
          sharedInterests: sharedCategories,
          compatibilityScore: Math.round(compatibilityScore),
          courseCount: buddyCourses.length,
          isConnected: !!existingRelation,
          relationStatus: existingRelation?.status
        };
      })
    );
    
    // Sort by compatibility score and filter out connected users
    const availableBuddies = buddiesWithScores
      .filter(buddy => !buddy.isConnected && buddy.compatibilityScore > 20)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);
    
    res.json(availableBuddies);
    
  } catch (error) {
    console.error('Error finding study buddies:', error);
    res.status(500).json({ message: 'Failed to find study buddies' });
  }
});

// Send buddy request
router.post('/buddy-request', auth, async (req, res) => {
  try {
    const { recipientId, relationshipType = 'study-buddy' } = req.body;
    const userId = req.user._id;
    
    if (userId.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }
    
    // Check if relationship already exists
    const existingRelation = await PeerRelationship.findOne({
      $or: [
        { requester: userId, recipient: recipientId },
        { requester: recipientId, recipient: userId }
      ]
    });
    
    if (existingRelation) {
      return res.status(400).json({ message: 'Relationship already exists' });
    }
    
    // Calculate compatibility score
    const currentUser = await User.findById(userId);
    const recipient = await User.findById(recipientId);
    
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userCourses = await Course.find({ 'enrolledStudents.student': userId });
    const recipientCourses = await Course.find({ 'enrolledStudents.student': recipientId });
    
    const userCategories = [...new Set(userCourses.map(course => course.category))];
    const recipientCategories = [...new Set(recipientCourses.map(course => course.category))];
    const sharedInterests = userCategories.filter(cat => recipientCategories.includes(cat));
    
    const compatibilityScore = Math.min(
      (sharedInterests.length / Math.max(userCategories.length, recipientCategories.length)) * 100,
      100
    );
    
    const peerRelationship = new PeerRelationship({
      requester: userId,
      recipient: recipientId,
      relationshipType,
      sharedInterests,
      compatibilityScore: Math.round(compatibilityScore)
    });
    
    await peerRelationship.save();
    
    const populatedRelation = await PeerRelationship.findById(peerRelationship._id)
      .populate('requester', 'name email')
      .populate('recipient', 'name email');
    
    res.status(201).json(populatedRelation);
    
  } catch (error) {
    console.error('Error sending buddy request:', error);
    res.status(500).json({ message: 'Failed to send buddy request' });
  }
});

// Get buddy requests (received)
router.get('/buddy-requests', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const requests = await PeerRelationship.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('requester', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(requests);
    
  } catch (error) {
    console.error('Error fetching buddy requests:', error);
    res.status(500).json({ message: 'Failed to fetch buddy requests' });
  }
});

// Respond to buddy request
router.post('/buddy-request/:requestId/respond', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user._id;
    
    const relationship = await PeerRelationship.findById(requestId);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (relationship.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }
    
    if (relationship.status !== 'pending') {
      return res.status(400).json({ message: 'Request already responded to' });
    }
    
    relationship.status = action === 'accept' ? 'accepted' : 'declined';
    if (action === 'accept') {
      relationship.acceptedAt = new Date();
    }
    
    await relationship.save();
    
    const updatedRelation = await PeerRelationship.findById(requestId)
      .populate('requester', 'name email')
      .populate('recipient', 'name email');
    
    res.json(updatedRelation);
    
  } catch (error) {
    console.error('Error responding to buddy request:', error);
    res.status(500).json({ message: 'Failed to respond to request' });
  }
});

// Get user's study buddies
router.get('/my-buddies', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const buddies = await PeerRelationship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    })
    .populate('requester', 'name email')
    .populate('recipient', 'name email')
    .sort({ acceptedAt: -1 });
    
    // Transform data to show the other person as the buddy
    const formattedBuddies = buddies.map(relation => {
      const isRequester = relation.requester._id.toString() === userId.toString();
      const buddy = isRequester ? relation.recipient : relation.requester;
      
      return {
        _id: relation._id,
        buddy: {
          _id: buddy._id,
          name: buddy.name,
          email: buddy.email
        },
        relationshipType: relation.relationshipType,
        sharedInterests: relation.sharedInterests,
        compatibilityScore: relation.compatibilityScore,
        connectedSince: relation.acceptedAt,
        lastInteraction: relation.lastInteraction
      };
    });
    
    res.json(formattedBuddies);
    
  } catch (error) {
    console.error('Error fetching study buddies:', error);
    res.status(500).json({ message: 'Failed to fetch study buddies' });
  }
});

module.exports = router;