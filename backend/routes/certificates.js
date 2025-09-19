const express = require('express');
const Certificate = require('../models/Certificate');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a new certificate
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, certificateData, issuedAt } = req.body;
    const userId = req.user._id;
    
    const certificate = new Certificate({
      userId,
      courseId,
      certificateId: certificateData.certificateId,
      studentName: certificateData.studentName,
      courseTitle: certificateData.courseTitle,
      instructorName: certificateData.instructorName || '',
      completionDate: certificateData.completionDate,
      score: certificateData.score,
      courseDuration: certificateData.courseDuration,
      skills: certificateData.skills,
      certificateUrl: certificateData.certificateUrl || '',
      issuedAt: issuedAt || new Date(),
      status: 'issued'
    });

    const savedCertificate = await certificate.save();
    
    res.status(201).json({
      message: 'Certificate created successfully',
      certificate: savedCertificate,
      certificateUrl: savedCertificate.certificateUrl
    });
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ message: 'Failed to create certificate' });
  }
});

// Get all certificates for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.params.userId })
      .populate('courseId', 'title category level')
      .sort({ issuedAt: -1 });
    
    res.json(certificates);
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
});

// Get a specific certificate by ID
router.get('/:certificateId', auth, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('courseId', 'title category level instructor')
      .populate('userId', 'firstName lastName email');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    res.json(certificate);
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Failed to fetch certificate' });
  }
});

// Update certificate URL
router.put('/:certificateId', auth, async (req, res) => {
  try {
    const { certificateUrl } = req.body;
    
    const certificate = await Certificate.findOneAndUpdate(
      { certificateId: req.params.certificateId },
      { certificateUrl },
      { new: true }
    );
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    res.json({
      message: 'Certificate updated successfully',
      certificate
    });
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ message: 'Failed to update certificate' });
  }
});

// Verify certificate authenticity
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('courseId', 'title category level')
      .populate('userId', 'firstName lastName email');
    
    if (!certificate) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Certificate not found' 
      });
    }
    
    res.json({
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        instructorName: certificate.instructorName,
        completionDate: certificate.completionDate,
        score: certificate.score,
        issuedAt: certificate.issuedAt,
        status: certificate.status
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Failed to verify certificate' 
    });
  }
});

// Get certificate statistics
router.get('/stats/user/:userId', auth, async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.params.userId });
    
    const stats = {
      totalCertificates: certificates.length,
      averageScore: certificates.length > 0 
        ? certificates.reduce((sum, cert) => sum + cert.score, 0) / certificates.length 
        : 0,
      totalSkills: [...new Set(certificates.flatMap(cert => cert.skills))].length,
      certificatesByMonth: {}
    };
    
    // Group certificates by month
    certificates.forEach(cert => {
      const month = new Date(cert.issuedAt).toISOString().slice(0, 7); // YYYY-MM
      stats.certificatesByMonth[month] = (stats.certificatesByMonth[month] || 0) + 1;
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Get certificate stats error:', error);
    res.status(500).json({ message: 'Failed to fetch certificate statistics' });
  }
});

module.exports = router;
