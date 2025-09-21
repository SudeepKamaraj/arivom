import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Award, Download, ArrowLeft, Calendar, Star, Share2, CheckCircle } from 'lucide-react';

interface CertificateProps {
  course: any;
  onBack: () => void;
}

interface CertificateData {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  score: number;
  courseDuration: string;
  skills: string[];
  certificateUrl?: string;
}

const Certificate: React.FC<CertificateProps> = ({ course, onBack }) => {
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (user && course) {
      // Generate certificate data
      const data: CertificateData = {
        certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentName: `${user.firstName} ${user.lastName}`,
        courseTitle: course.title,
        completionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        score: 95, // This would come from assessment results
        courseDuration: course.duration || '2 hours',
        skills: course.skills || ['Programming', 'Web Development'],
        certificateUrl: ''
      };
      setCertificateData(data);
      
      // Save certificate to MongoDB
      saveCertificateToDatabase(data);
    }
  }, [user, course]);

  const saveCertificateToDatabase = async (data: CertificateData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          courseId: course._id,
          certificateData: data,
          issuedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setCertificateData(prev => ({ ...prev!, certificateUrl: result.certificateUrl }));
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !certificateData) return;
    
    setIsGenerating(true);
    try {
      // Ensure html2canvas is available
      const html2canvas = await import('html2canvas');
      
      // Wait a bit for the DOM to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas.default(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: true,
        logging: false,
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight
      });
      
      // Convert to blob for better download handling
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${certificateData.studentName.replace(/\s+/g, '_')}-${certificateData.courseTitle.replace(/\s+/g, '_')}-Certificate.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          // Update certificate URL in database
          if (certificateData.certificateId) {
            updateCertificateUrl(certificateData.certificateId, url);
          }
        }
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      // Fallback: Create a simple text-based certificate
      const certificateText = `
CERTIFICATE OF COMPLETION

This certifies that
${certificateData?.studentName}
has successfully completed the course
${certificateData?.courseTitle}

Completed on: ${certificateData?.completionDate}
Score: ${certificateData?.score}%
Certificate ID: ${certificateData?.certificateId}

Arivom - Online Learning Platform
        `;
        
        const blob = new Blob([certificateText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = `${certificateData?.studentName.replace(/\s+/g, '_')}-${certificateData?.courseTitle.replace(/\s+/g, '_')}-Certificate.txt`;
        link.href = URL.createObjectURL(blob);
        link.click();
    } finally {
      setIsGenerating(false);
    }
  };

  const updateCertificateUrl = async (certificateId: string, imageUrl: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`http://localhost:5001/api/certificates/${certificateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ certificateUrl: imageUrl })
      });
    } catch (error) {
      console.error('Error updating certificate URL:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && downloadUrl) {
      navigator.share({
        title: `Certificate of Completion - ${certificateData?.courseTitle}`,
        text: `I just completed ${certificateData?.courseTitle} on Arivom!`,
        url: downloadUrl
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`I just completed ${certificateData?.courseTitle} on Arivom!`);
      alert('Certificate link copied to clipboard!');
    }
  };

  if (!certificateData) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Congratulations! 🎉
        </h1>
        <p className="text-gray-600">
          You have successfully completed the course and earned your certificate
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-5xl mx-auto">
        {/* Certificate */}
        <div
          ref={certificateRef}
          className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-12 text-center border-8 border-blue-600 relative overflow-hidden"
          style={{ aspectRatio: '4/3' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 border-4 border-blue-600 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-purple-600 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-green-600 rounded-full"></div>
          </div>

          <div className="border-2 border-blue-300 rounded-lg p-8 h-full flex flex-col justify-center relative z-10">
            {/* Header */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Certificate of Completion
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Student Info */}
            <div className="mb-8">
              <p className="text-lg text-gray-600 mb-4">This certifies that</p>
              <h3 className="text-3xl font-bold text-blue-600 mb-4">
                {certificateData.studentName}
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                has successfully completed the course
              </p>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">
                {certificateData.courseTitle}
              </h4>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{certificateData.completionDate}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>Score: {certificateData.score}%</span>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Skills Acquired:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {certificateData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-4">
              {/* Instructor line removed */}
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-blue-600 text-lg">Arivom</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Certificate ID: {certificateData.certificateId}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{isGenerating ? 'Generating...' : 'Download Certificate'}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Achievement</span>
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Share your achievement on social media or add it to your professional profile
            </p>
          </div>
        </div>
      </div>

      {/* Course Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Course Completed</h3>
          <p className="text-sm text-gray-600">All lessons and assessments passed</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Final Score</h3>
          <p className="text-sm text-gray-600">{certificateData.score}%</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Skills Mastered</h3>
          <p className="text-sm text-gray-600">{certificateData.skills.length} skills</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Time Invested</h3>
          <p className="text-sm text-gray-600">{certificateData.courseDuration}</p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;